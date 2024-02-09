package metrics

import (
	"sync"
	"time"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"

	"github.com/streamdal/go-sdk/types"
	"github.com/streamdal/streamdal/libs/protos/build/go/protos"
)

var _ = Describe("Counter", func() {
	var c *counter

	BeforeEach(func() {
		c = &counter{
			countMutex: &sync.RWMutex{},
			entry: &types.CounterEntry{
				Name:     types.ConsumeBytes,
				Labels:   map[string]string{},
				Audience: &protos.Audience{},
			},
		}
	})

	Context("incr", func() {
		It("should increase the total for a counter", func() {
			c.incr(&types.CounterEntry{Value: 1})
			Expect(c.getValue()).To(Equal(int64(1)))
		})
	})

	Context("getLastUpdated", func() {
		It("should return the last updated time", func() {
			now := time.Now().UTC()
			time.Sleep(10 * time.Millisecond)
			c.incr(&types.CounterEntry{Value: 1})
			Expect(c.getLastUpdated().UnixNano()).To(BeNumerically(">", now.UnixNano(), 0))
		})
	})

	Context("getValue", func() {
		It("should return the total for a counter", func() {
			c.incr(&types.CounterEntry{Value: 11})
			Expect(c.getValue()).To(Equal(int64(11)))
		})
	})

	Context("getEntry", func() {
		It("should return counter entry with current value", func() {
			c.incr(&types.CounterEntry{Value: 11})
			entry := c.getEntry()
			Expect(entry).ToNot(BeNil())
			Expect(entry.Value).To(Equal(int64(11)))
		})
	})

	Context("reset", func() {
		It("should reset counter value to zero", func() {
			c.incr(&types.CounterEntry{Value: 11})
			c.reset()
			Expect(c.getValue()).To(Equal(int64(0)))
		})
	})
})
