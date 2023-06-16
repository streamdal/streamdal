package metrics

import (
	"sync"
	"time"
)

type counter struct {
	entry       *CounterEntry
	count       int64
	countMutex  *sync.RWMutex
	lastUpdated time.Time
}

// getValue increases the total for a getValue counter
func (c *counter) incr(entry *CounterEntry) {
	c.countMutex.Lock()
	defer c.countMutex.Unlock()

	c.count += entry.Value
	c.lastUpdated = time.Now().UTC()
}

func (c *counter) getLastUpdated() time.Time {
	c.countMutex.RLock()
	defer c.countMutex.RUnlock()

	return c.lastUpdated
}

// getValue returns the total for a getValue counter
func (c *counter) getValue() int64 {
	c.countMutex.RLock()
	defer c.countMutex.RUnlock()

	return c.count
}

func (c *counter) getEntry() CounterEntry {
	e := c.entry
	e.Value = c.getValue()
	return *e
}

func (c *counter) reset() {
	c.countMutex.Lock()
	defer c.countMutex.Unlock()

	c.count = 0
}
