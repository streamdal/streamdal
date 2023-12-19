package cache

import (
	"time"

	gcache "github.com/patrickmn/go-cache"
	"github.com/sirupsen/logrus"
)

type ICache interface {
	Add(key string, value interface{}, ttl ...time.Duration) error
	Set(key string, value interface{}, ttl ...time.Duration)
	Get(key string) (value interface{}, ok bool)
	Contains(key string) (exists bool)
	Remove(key string) bool
}

type Cache struct {
	*gcache.Cache
	log *logrus.Entry
}

func New() (*Cache, error) {
	return &Cache{
		Cache: gcache.New(gcache.NoExpiration, time.Minute),
		log:   logrus.WithField("pkg", "cache"),
	}, nil
}

// Add will error if adding a key that already exists in cache
func (c *Cache) Add(key string, value interface{}, ttl ...time.Duration) error {
	expiration := gcache.NoExpiration

	if len(ttl) > 0 {
		expiration = ttl[0]
	}

	return c.Cache.Add(key, value, expiration)
}

// Set will add OR overwrite an element in the cache
func (c *Cache) Set(key string, value interface{}, ttl ...time.Duration) {
	expiration := gcache.NoExpiration

	if len(ttl) > 0 {
		expiration = ttl[0]
	}

	c.Cache.Set(key, value, expiration)
}

func (c *Cache) Get(key string) (interface{}, bool) {
	return c.Cache.Get(key)
}

func (c *Cache) Contains(key string) bool {
	_, ok := c.Cache.Get(key)
	return ok
}

func (c *Cache) Remove(key string) bool {
	_, ok := c.Cache.Get(key)
	if !ok {
		return false
	}

	c.Cache.Delete(key)

	return true
}
