package metrics

import (
	"fmt"
	"strings"
	"sync"
	"time"

	"github.com/streamdal/snitch-go-client/types"
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
	labelVals := make([]string, 0)
	for _, v := range e.Labels {
		labelVals = append(labelVals, v)
	}
	labels := strings.Join(labelVals, "-")

	// Global counter
	if e.RuleID == "" {
		return fmt.Sprintf("%s-%s-%s", e.Name, e.Type, labels)
	}

	// Rule specific counter
	return fmt.Sprintf("%s-%s-%s-%s", e.Name, e.Type, e.RuleID, labels)
}

func (c *counter) reset() {
	c.countMutex.Lock()
	defer c.countMutex.Unlock()

	c.count = 0
}
