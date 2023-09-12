package kv

import (
	"sync"

	"github.com/pkg/errors"

	"github.com/streamdal/snitch-go-client/logger"
)

type KV struct {
	cfg    *Config
	kvs    map[string]string
	kvsMtx *sync.RWMutex
	log    logger.Logger
}

type IKV interface {
	// Get gets a value from the KV store; bool indicates if value exists
	Get(key string) (string, bool)

	// Set sets a key/value pair in the KV store; return bool indicates if key
	// was overwritten
	Set(key string, value string) bool

	// Exists checks if a key exists in the KV store
	Exists(key string) bool

	// Purge removes all keys from the KV store; return int indicates how many
	// keys were removed.
	Purge() int64

	// Keys returns a slice of all keys in the KV store
	Keys() []string

	// Items returns the number of keys in the KV store
	Items() int64
}

type Config struct {
	Logger logger.Logger
}

func New(cfg *Config) (*KV, error) {
	if err := validateConfig(cfg); err != nil {
		return nil, errors.Wrap(err, "unable to validate config")
	}

	return &KV{
		cfg:    cfg,
		kvs:    make(map[string]string),
		kvsMtx: &sync.RWMutex{},
		log:    cfg.Logger,
	}, nil
}

func (k *KV) Get(key string) (string, bool) {
	k.kvsMtx.RLock()
	defer k.kvsMtx.RUnlock()

	if val, ok := k.kvs[key]; ok {
		return val, true
	}

	return "", false
}

func (k *KV) Set(key string, value string) bool {
	k.kvsMtx.Lock()
	defer k.kvsMtx.Unlock()

	if _, ok := k.kvs[key]; ok {
		k.kvs[key] = value
		return true
	}

	k.kvs[key] = value
	return false
}

func (k *KV) Exists(key string) bool {
	k.kvsMtx.RLock()
	defer k.kvsMtx.RUnlock()

	if _, ok := k.kvs[key]; ok {
		return true
	}

	return false
}

func (k *KV) Purge() int64 {
	k.kvsMtx.Lock()
	defer k.kvsMtx.Unlock()

	purged := int64(len(k.kvs))
	k.kvs = make(map[string]string)

	return purged
}

func (k *KV) Keys() []string {
	keys := make([]string, 0, len(k.kvs))

	i := 0

	for k, _ := range k.kvs {
		keys[i] = k
		i += 1
	}

	return keys
}

func (k *KV) Items() int64 {
	k.kvsMtx.RLock()
	defer k.kvsMtx.RUnlock()

	return int64(len(k.kvs))
}

func validateConfig(cfg *Config) error {
	if cfg == nil {
		return errors.New("config cannot be nil")
	}

	if cfg.Logger == nil {
		cfg.Logger = &logger.NoOpLogger{}
	}

	return nil
}
