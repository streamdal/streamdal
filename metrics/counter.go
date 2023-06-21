package metrics

import (
	"fmt"
	"sync"
	"time"

	"github.com/streamdal/dataqual/types"
)

type counter struct {
	entry       *types.CounterEntry
	count       int64
	countMutex  *sync.RWMutex
	lastUpdated time.Time
}

// getValue increases the total for a getValue counter
func (c *counter) incr(entry *types.CounterEntry) {
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

func (c *counter) getEntry() types.CounterEntry {
	e := c.entry
	e.Value = c.getValue()
	return *e
}

func CompositeID(e *types.CounterEntry) string {
	// Global counter
	if e.RuleID == "" {
		return fmt.Sprintf("%s-%s", e.Name, e.Type)
	}

	// Rule specific counter
	return fmt.Sprintf("%s-%s-%s", e.Name, e.Type, e.RuleID)
}

func (c *counter) reset() {
	c.countMutex.Lock()
	defer c.countMutex.Unlock()

	c.count = 0
}
