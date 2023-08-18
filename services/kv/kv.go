package kv

import (
	"context"
	"time"

	"github.com/nats-io/nats.go"
	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
	"github.com/streamdal/natty"
	"github.com/streamdal/snitch-protos/build/go/protos"
	"google.golang.org/protobuf/proto"

	"github.com/streamdal/snitch-server/validate"
)

const (
	BucketName = "snitch_kv"
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
	NumBytes int `json:"num_bytes"`
}

type KV struct {
	Options *Options
	log     *logrus.Entry
}

type Options struct {
	NATS        natty.INatty
	NumReplicas int
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

	// Fetch all keys in bucket
	keys, err := k.Options.NATS.Keys(ctx, BucketName)
	if err != nil {
		if err == nats.ErrBucketNotFound {
			return objects, nil
		}

		return nil, errors.Wrap(err, "failed to fetch keys")
	}

	// Fetch every returned key
	for _, key := range keys {
		value, err := k.Options.NATS.Get(ctx, BucketName, key)
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

	value, err := k.Options.NATS.Get(ctx, BucketName, key)
	if err != nil {
		if err == nats.ErrKeyNotFound || err == nats.ErrBucketNotFound {
			return nil, nats.ErrKeyNotFound
		}

		return nil, errors.Wrapf(err, "failed to fetch kv '%s'", key)
	}

	object := &protos.KVObject{}

	if err := proto.Unmarshal(value, object); err != nil {
		return nil, errors.Wrapf(err, "failed to unmarshal kv '%s'", key)
	}

	return object, nil
}

// Create creates a kv object in NATS. "overwrite" allows you to adjust create
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
			err = k.Options.NATS.Put(ctx, BucketName, kv.Key, serialized)
		} else {
			err = k.Options.NATS.Create(ctx, BucketName, kv.Key, serialized)
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
	_, err := k.Options.NATS.Get(ctx, BucketName, kv.Key)
	if err != nil {
		return nil, errors.Wrapf(err, "unable to fetch key '%s'", kv.Key)
	}

	// KV is valid, set an updated timestamp + serialize + save to NATS
	kv.UpdatedAtUnixTsNanoUtc = time.Now().UTC().UnixNano()

	serialized, err := proto.Marshal(kv)
	if err != nil {
		return nil, errors.Wrapf(err, "failed to marshal kv '%s' to protobuf", kv.Key)
	}

	if err := k.Options.NATS.Put(ctx, BucketName, kv.Key, serialized); err != nil {
		return nil, errors.Wrapf(err, "failed to update kv '%s'", kv.Key)
	}

	return kv, nil
}

func (k *KV) Delete(ctx context.Context, key string) error {
	// Delete no-ops if bucket or key does not exist so we can just use this as-is
	return k.Options.NATS.Delete(ctx, BucketName, key)
}

// DeleteAll will delete all kv entries by deleting and re-creating the bucket
func (k *KV) DeleteAll(ctx context.Context) error {
	// Delete & re-create bucket
	if err := k.Options.NATS.DeleteBucket(ctx, BucketName); err != nil {
		return errors.Wrap(err, "failed to delete bucket during delete all")
	}

	// Re-create bucket
	if err := k.Options.NATS.CreateBucket(ctx, BucketName, 0, k.Options.NumReplicas); err != nil {
		return errors.Wrap(err, "failed to re-create bucket during delete all")
	}

	return nil
}

func (k *KV) GetUsage(ctx context.Context) (*Usage, error) {
	status, err := k.Options.NATS.Status(ctx, BucketName)
	if err != nil {
		return nil, errors.Wrap(err, "failed to fetch status")
	}

	// We have to do this because .Values() includes historical entries as well
	keys, err := k.Options.NATS.Keys(ctx, BucketName)
	if err != nil {
		return nil, errors.Wrap(err, "failed to fetch keys (for status)")
	}

	return &Usage{
		NumItems: len(keys),
		NumBytes: int(status.Bytes()),
	}, nil
}

func validateOptions(o *Options) error {
	if o.NATS == nil {
		return errors.New("options.NATS cannot be nil")
	}

	if o.NumReplicas == 0 {
		return errors.New("options.NumReplicas cannot be 0")
	}

	return nil
}
