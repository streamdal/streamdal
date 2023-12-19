package kv

import (
	"context"
	"time"

	"github.com/redis/go-redis/v9"

	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
	"google.golang.org/protobuf/proto"

	"github.com/streamdal/mono/libs/protos/build/go/protos"

	"github.com/streamdal/server/validate"
)

const (
	Prefix = "kv:"
)

type IKV interface {
	GetUsage(ctx context.Context) (*Usage, error)
	GetAll(ctx context.Context) ([]*protos.KVObject, error)
	Get(ctx context.Context, key string) (*protos.KVObject, error)
	Create(ctx context.Context, kvs []*protos.KVObject, overwrite bool) error
	Update(ctx context.Context, kv *protos.KVObject) (*protos.KVObject, error)
	Delete(ctx context.Context, key string) error
	DeleteAll(ctx context.Context) error
}

type Usage struct {
	// This does NOT include history -- we get this value by doing Keys() on the
	// bucket
	NumItems int `json:"num_items"`

	// This includes history entries (ie. when you delete a KV, a copy of it is
	// kept around until the key is purged or the bucket is compacted)
	NumBytes int64 `json:"num_bytes"`
}

type KV struct {
	Options *Options
	log     *logrus.Entry
}

type Options struct {
	RedisBackend *redis.Client
}

func New(o *Options) (*KV, error) {
	if err := validateOptions(o); err != nil {
		return nil, err
	}

	return &KV{
		Options: o,
		log:     logrus.WithField("pkg", "kv"),
	}, nil
}

func (k *KV) GetAll(ctx context.Context) ([]*protos.KVObject, error) {
	objects := make([]*protos.KVObject, 0)

	keys, err := k.Options.RedisBackend.Keys(ctx, Prefix+"*").Result()
	if err != nil {
		return nil, errors.Wrap(err, "failed to fetch keys")
	}

	// Fetch every returned key
	for _, key := range keys {
		value, err := k.Options.RedisBackend.Get(ctx, key).Bytes()
		if err != nil {
			return nil, errors.Wrapf(err, "failed to fetch kv '%s'", key)
		}

		object := &protos.KVObject{}

		if err := proto.Unmarshal(value, object); err != nil {
			return nil, errors.Wrapf(err, "failed to unmarshal kv '%s'", key)
		}

		objects = append(objects, object)
	}

	return objects, nil
}

func (k *KV) Get(ctx context.Context, key string) (*protos.KVObject, error) {
	if key == "" {
		return nil, errors.New("key cannot be empty")
	}

	value, err := k.Options.RedisBackend.Get(ctx, KVKey(key)).Bytes()
	if err != nil {
		return nil, errors.Wrapf(err, "failed to fetch kv '%s'", key)
	}

	object := &protos.KVObject{}

	if err := proto.Unmarshal(value, object); err != nil {
		return nil, errors.Wrapf(err, "failed to unmarshal kv '%s'", key)
	}

	return object, nil
}

// Create creates a kv object in RedisBackend. "overwrite" allows you to adjust create
// behavior - if set and the key already exists - it the method will overwrite
// the key. If not set and the key already exists - it will error.
//
// Think of "overwrite" as an "upsert".
func (k *KV) Create(ctx context.Context, kvs []*protos.KVObject, overwrite bool) error {
	if len(kvs) == 0 {
		return errors.New("kvs cannot be empty")
	}

	for _, kv := range kvs {
		if err := validate.KVObject(kv, false, true); err != nil {
			return errors.Wrapf(err, "invalid kv object '%s'", kv.Key)
		}

		// KV is valid, we can set a timestamp now
		kv.CreatedAtUnixTsNanoUtc = time.Now().UTC().UnixNano()

		serialized, err := proto.Marshal(kv)
		if err != nil {
			return errors.Wrapf(err, "failed to marshal kv '%s' to protobuf", kv.Key)
		}

		if overwrite {
			_, err = k.Options.RedisBackend.Set(ctx, KVKey(kv.Key), serialized, 0).Result()
		} else {
			// check if key exists
			if _, err := k.Options.RedisBackend.Get(ctx, KVKey(kv.Key)).Result(); err == nil {
				return errors.Errorf("key '%s' already exists", kv.Key)
			} else {
				_, err = k.Options.RedisBackend.Set(ctx, KVKey(kv.Key), serialized, 0).Result()
			}
		}

		if err != nil {
			return errors.Wrapf(err, "failed to create kv '%s'", kv.Key)
		}
	}

	return nil
}

// Update updates a KV object. It WILL error if the key does not already exist.
func (k *KV) Update(ctx context.Context, kv *protos.KVObject) (*protos.KVObject, error) {
	if err := validate.KVObject(kv, true, true); err != nil {
		return nil, errors.Wrapf(err, "invalid kv object '%s'", kv.Key)
	}

	// Key should exist
	_, err := k.Options.RedisBackend.Get(ctx, KVKey(kv.Key)).Bytes()
	if err != nil {
		return nil, errors.Wrapf(err, "unable to fetch key '%s'", kv.Key)
	}

	// KV is valid, set an updated timestamp + serialize + save to RedisBackend
	kv.UpdatedAtUnixTsNanoUtc = time.Now().UTC().UnixNano()

	serialized, err := proto.Marshal(kv)
	if err != nil {
		return nil, errors.Wrapf(err, "failed to marshal kv '%s' to protobuf", kv.Key)
	}

	if err := k.Options.RedisBackend.Set(ctx, KVKey(kv.Key), serialized, 0).Err(); err != nil {
		return nil, errors.Wrapf(err, "failed to update kv '%s'", kv.Key)
	}

	return kv, nil
}

func (k *KV) Delete(ctx context.Context, key string) error {
	// Delete no-ops if bucket or key does not exist so we can just use this as-is
	return k.Options.RedisBackend.Del(ctx, KVKey(key)).Err()
}

// DeleteAll will delete all kv entries by deleting and re-creating the bucket
func (k *KV) DeleteAll(ctx context.Context) error {
	// Delete all keys with prefix kv:
	keys, err := k.Options.RedisBackend.Keys(ctx, Prefix+"*").Result()
	if err != nil {
		return errors.Wrap(err, "failed to fetch keys")
	}

	// Delete all keys
	if err := k.Options.RedisBackend.Del(ctx, keys...).Err(); err != nil {
		return errors.Wrap(err, "failed to delete keys during delete all")
	}

	return nil
}

func (k *KV) GetUsage(ctx context.Context) (*Usage, error) {
	keys, err := k.Options.RedisBackend.Keys(ctx, Prefix+"*").Result()
	if err != nil {
		return nil, errors.Wrap(err, "failed to fetch keys (for status)")
	}

	var total int64

	for _, key := range keys {
		total += k.Options.RedisBackend.MemoryUsage(ctx, key).Val()
	}

	return &Usage{
		NumItems: len(keys),
		NumBytes: total,
	}, nil
}

func validateOptions(o *Options) error {
	if o.RedisBackend == nil {
		return errors.New("options.RedisBackend cannot be nil")
	}

	return nil
}

func KVKey(key string) string {
	return Prefix + key
}
