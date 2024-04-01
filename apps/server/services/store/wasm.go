package store

import (
	"context"

	"github.com/pkg/errors"
	"github.com/redis/go-redis/v9"
	"github.com/streamdal/streamdal/libs/protos/build/go/protos"
	"google.golang.org/protobuf/proto"

	"github.com/streamdal/streamdal/apps/server/util"
	"github.com/streamdal/streamdal/apps/server/validate"
)

var (
	ErrWasmNotFound = errors.New("wasm not found")
)

// GetWasm will fetch Wasm from the store by name and ID
func (s *Store) GetWasm(ctx context.Context, name, id string) (*protos.Wasm, error) {
	data, err := s.read(ctx, RedisWasmKey(name, id))
	if err != nil {
		if err != redis.Nil {
			return nil, errors.Wrap(err, "unable to read Wasm from store")
		}

		// Doing this so we can return a nil error
		return nil, err
	}

	// Try to marshal the data into a Wasm entry
	entry := &protos.Wasm{}
	if err := proto.Unmarshal(data, entry); err != nil {
		return nil, errors.Wrap(err, "unable to unmarshal Wasm from store")
	}

	return entry, nil
}

// GetWasmByID will fetch Wasm from the store by ID (regardless of 'name')
func (s *Store) GetWasmByID(ctx context.Context, id string) (*protos.Wasm, error) {
	keys, err := s.options.RedisBackend.Keys(ctx, RedisWasmKey("*", id)).Result()
	if err != nil {
		return nil, errors.Wrap(err, "unable to list Wasm keys by id")
	}

	if len(keys) == 0 {
		return nil, ErrWasmNotFound
	}

	if len(keys) > 1 {
		return nil, errors.New("bug? found multiple wasm entries with the same ID")
	}

	return s.GetWasm(ctx, keys[0], id)
}

// GetWasmByName will fetch Wasm from the store by name (regardless of 'id')
func (s *Store) GetWasmByName(ctx context.Context, name string) (*protos.Wasm, error) {
	keys, err := s.options.RedisBackend.Keys(ctx, RedisWasmKey(name, "*")).Result()
	if err != nil {
		return nil, errors.Wrap(err, "unable to list Wasm keys by name")
	}

	if len(keys) == 0 {
		return nil, ErrWasmNotFound
	}

	if len(keys) > 1 {
		return nil, errors.New("bug? found multiple wasm entries with the same name")
	}

	return s.GetWasm(ctx, name, keys[0])
}

// SetWasm will store Wasm in the store by name and ID; it will overwrite an
// existing entry (if it exists).
func (s *Store) SetWasm(ctx context.Context, name, id string, wasm *protos.Wasm) error {
	if err := validate.SetWasm(name, id, wasm); err != nil {
		return errors.Wrap(err, "unable to validate SetWasm params")
	}

	data, err := proto.Marshal(wasm)
	if err != nil {
		return errors.Wrapf(err, "unable to marshal '%s' Wasm", wasm.Name)
	}

	if err := s.write(ctx, RedisWasmKey(name, id), data); err != nil {
		return errors.Wrapf(err, "unable to write '%s' Wasm to store", wasm.Name)
	}

	return nil
}

// SetWasmByID will overwrite an EXISTING Wasm entry by ID. This method
// requires for an existing Wasm object to exist in redi and will use the
// discovered 'id' to overwrite the entry.
func (s *Store) SetWasmByID(ctx context.Context, id string, wasm *protos.Wasm) error {
	if err := validate.SetWasmByID(id, wasm); err != nil {
		return errors.Wrap(err, "unable to validate SetWasmByName params")
	}

	keys, err := s.options.RedisBackend.Keys(ctx, RedisWasmKey("*", id)).Result()
	if err != nil {
		return errors.Wrap(err, "unable to list Wasm keys by id")
	}

	if len(keys) == 0 {
		return ErrWasmNotFound
	}

	if len(keys) > 1 {
		return errors.New("bug? found multiple wasm entries with the same ID")
	}

	name, err := util.GetWasmNameFromKey(keys[0])
	if err != nil {
		return errors.Wrap(err, "unable to extract name from key")
	}

	return s.SetWasm(ctx, name, id, wasm)
}

// SetWasmByName will overwrite an EXISTING Wasm entry by name. This method
// requires for an existing Wasm object to exist in redis and will use the
// discovered 'name' to overwrite the entry.
func (s *Store) SetWasmByName(ctx context.Context, name string, wasm *protos.Wasm) error {
	if err := validate.SetWasmByName(name, wasm); err != nil {
		return errors.Wrap(err, "unable to validate SetWasmByName params")
	}

	keys, err := s.options.RedisBackend.Keys(ctx, RedisWasmKey(name, "*")).Result()
	if err != nil {
		return errors.Wrap(err, "unable to list Wasm keys by id")
	}

	if len(keys) == 0 {
		return ErrWasmNotFound
	}

	if len(keys) > 1 {
		return errors.New("bug? found multiple wasm entries with the same ID")
	}

	id, err := util.GetWasmIDFromRedisKey(keys[0])
	if err != nil {
		return errors.Wrap(err, "unable to extract id from key")
	}

	return s.SetWasm(ctx, name, id, wasm)
}

// DeleteWasm will remove a Wasm entry from the store by name and ID.
func (s *Store) DeleteWasm(ctx context.Context, name, id string) error {
	if err := validate.DeleteWasm(name, id); err != nil {
		return errors.Wrap(err, "unable to validate DeleteWasm params")
	}

	if err := s.options.RedisBackend.Del(ctx, RedisWasmKey(name, id)).Err(); err != nil {
		return errors.Wrap(err, "unable to delete Wasm from store")
	}

	return nil
}

// DeleteWasmByID will remove an EXISTING Wasm entry by ID. This method expects
// for a Wasm object with the given ID to exist. If it does not, the delete will
// error.
func (s *Store) DeleteWasmByID(ctx context.Context, id string) error {
	if id == "" {
		return errors.New("id is required")
	}

	keys, err := s.options.RedisBackend.Keys(ctx, RedisWasmKey("*", id)).Result()
	if err != nil {
		return errors.Wrap(err, "unable to list Wasm keys by id for delete")
	}

	if len(keys) == 0 {
		return ErrWasmNotFound
	}

	if len(keys) > 1 {
		return errors.New("bug? found multiple wasm entries with the same id for delete")
	}

	name, err := util.GetWasmNameFromKey(keys[0])
	if err != nil {
		return errors.Wrap(err, "unable to extract name from key for delete")
	}

	return s.DeleteWasm(ctx, name, id)
}

// DeleteWasmByName will remove an EXISTING Wasm entry by Name. This method expects
// for a Wasm object with the given Name to exist. If it does not, the delete will
// error.
func (s *Store) DeleteWasmByName(ctx context.Context, name string) error {
	if name == "" {
		return errors.New("name is required")
	}

	keys, err := s.options.RedisBackend.Keys(ctx, RedisWasmKey(name, "*")).Result()
	if err != nil {
		return errors.Wrap(err, "unable to list Wasm keys by name for delete")
	}

	if len(keys) == 0 {
		return ErrWasmNotFound
	}

	if len(keys) > 1 {
		return errors.New("bug? found multiple wasm entries with the same name for delete")
	}

	id, err := util.GetWasmIDFromRedisKey(keys[0])
	if err != nil {
		return errors.Wrap(err, "unable to extract id from key for delete")
	}

	return s.DeleteWasm(ctx, name, id)
}

func (s *Store) GetAllWasm(ctx context.Context) ([]*protos.Wasm, error) {
	// Fetch all keys that match the wasm key pattern
	keys, err := s.options.RedisBackend.Keys(ctx, RedisWasmPrefix+":*").Result()
	if err != nil {
		return nil, errors.Wrap(err, "unable to list Wasm keys")
	}

	entries := make([]*protos.Wasm, 0)

	// Fetch all wasm entries
	for _, key := range keys {
		data, err := s.read(ctx, key)
		if err != nil {
			return nil, errors.Wrap(err, "unable to read Wasm from store")
		}

		// Try to marshal the data into a Wasm entry
		entry := &protos.Wasm{}
		if err := proto.Unmarshal(data, entry); err != nil {
			return nil, errors.Wrap(err, "unable to unmarshal Wasm from store")
		}

		entries = append(entries, entry)
	}

	return entries, nil
}
