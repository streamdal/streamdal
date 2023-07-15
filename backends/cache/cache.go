package cache

import (
	"time"

	gcache "github.com/patrickmn/go-cache"
	"github.com/sirupsen/logrus"
)

type ICache interface {
	Add(key string, value interface{}) error
	Set(key string, value interface{})
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
		Cache: gcache.New(gcache.NoExpiration, 10*time.Minute),
		log:   logrus.WithField("pkg", "cache"),
	}, nil
}

// Add will error if adding a key that already exists in cache
func (c *Cache) Add(key string, value interface{}) error {
	return c.Cache.Add(key, value, gcache.NoExpiration)
}

// Set will add OR overwrite an element in the cache
func (c *Cache) Set(key string, value interface{}) {
	c.Cache.Set(key, value, gcache.NoExpiration)
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
