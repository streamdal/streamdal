package metrics

import (
	"context"
	"sync"
	"time"

	"github.com/streamdal/streamdal/libs/protos/build/go/protos"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
	"github.com/relistan/go-director"

	"github.com/streamdal/streamdal/sdks/go/logger/loggerfakes"
	"github.com/streamdal/streamdal/sdks/go/server/serverfakes"
	"github.com/streamdal/streamdal/sdks/go/types"
)

var _ = Describe("Metrics", func() {
	Context("compositeID", func() {
		It("should return a composite ID for a counter", func() {
			c := &counter{
				countMutex: &sync.RWMutex{},
				entry: &types.CounterEntry{
					Name:     types.ConsumeBytes,
					Labels:   map[string]string{},
					Audience: &protos.Audience{},
				},
			}

			c.entry.Name = types.ConsumeBytes
			c.entry.Labels = map[string]string{
				"foo": "bar",
			}
			Expect(compositeID(c.entry)).To(Equal("counter_consume_bytes-bar"))
		})
	})

	Context("validateConfig", func() {
		It("should return missing client", func() {
			err := validateConfig(nil)
			Expect(err).To(Equal(ErrMissingConfig))
		})

		It("should return missing context", func() {
			err := validateConfig(&Config{
				ServerClient: &serverfakes.FakeIServerClient{},
				ShutdownCtx:  nil,
			})
			Expect(err).To(Equal(ErrMissingShutdownCtx))
		})

		It("should return missing client", func() {
			err := validateConfig(&Config{
				ServerClient: nil,
				ShutdownCtx:  context.Background(),
			})
			Expect(err).To(Equal(ErrMissingServerClient))
		})

		It("should return nil on valid config", func() {
			err := validateConfig(&Config{
				ServerClient: &serverfakes.FakeIServerClient{},
				ShutdownCtx:  context.Background(),
			})
			Expect(err).To(BeNil())
		})
	})

	Context("validateCounterEntry", func() {
		It("should return missing entry", func() {
			err := validateCounterEntry(nil)
			Expect(err).To(Equal(ErrMissingEntry))
		})

		It("should return empty name", func() {
			err := validateCounterEntry(&types.CounterEntry{
				Name: "",
			})
			Expect(err).To(Equal(ErrEmptyName))
		})
	})

	Context("newCounter", func() {
		It("should return a new counter", func() {
			m := &Metrics{
				Config: &Config{
					ServerClient: &serverfakes.FakeIServerClient{},
				},
				counterMap:      make(map[string]*counter),
				counterMapMutex: &sync.RWMutex{},
			}
			counter := m.newCounter(&types.CounterEntry{
				Name: types.ConsumeBytes,
			})
			Expect(counter).ToNot(BeNil())
			Expect(counter.getEntry().Name).To(Equal(types.ConsumeBytes))
		})
	})

	Context("getCounters", func() {
		It("should return a map of counters", func() {
			m := &Metrics{
				Config: &Config{
					ServerClient: &serverfakes.FakeIServerClient{},
				},
				counterMap:      make(map[string]*counter),
				counterMapMutex: &sync.RWMutex{},
			}

			entry := &types.CounterEntry{
				Name:   types.ConsumeBytes,
				Labels: map[string]string{},
			}

			m.newCounter(entry)
			counters := m.getCounters()
			Expect(len(counters)).To(Equal(1))
			Expect(counters).To(HaveKey(compositeID(entry)))
		})
	})

	Context("Incr", func() {
		It("increments counter", func() {
			m := &Metrics{
				Config: &Config{
					ServerClient: &serverfakes.FakeIServerClient{},
					ShutdownCtx:  context.Background(),
					Log:          &loggerfakes.FakeLogger{},
				},
				counterMap:      make(map[string]*counter),
				counterMapMutex: &sync.RWMutex{},
				wg:              &sync.WaitGroup{},
				counterIncrCh:   make(chan *types.CounterEntry, 1),
			}

			entry := &types.CounterEntry{
				Name:   types.ConsumeBytes,
				Labels: map[string]string{},
				Value:  1,
			}

			err := m.Incr(context.Background(), entry)
			Expect(err).To(BeNil())

			m.wg.Add(1)

			looper := director.NewFreeLooper(1, make(chan error, 1))

			go m.runCounterWorkerPool("", looper)

			time.Sleep(time.Second)

			counters := m.getCounters()
			Expect(len(counters)).To(Equal(1))
			Expect(counters).To(HaveKey(compositeID(entry)))
			Expect(counters[compositeID(entry)].getValue()).To(Equal(int64(1)))
		})
	})

	Context("runCounterTicker", func() {
		It("resets counter to zero after interval", func() {
			m := &Metrics{
				Config: &Config{
					ServerClient: &serverfakes.FakeIServerClient{},
					ShutdownCtx:  context.Background(),
					Log:          &loggerfakes.FakeLogger{},
					IncrInterval: time.Millisecond,
				},
				counterMap:      make(map[string]*counter),
				counterMapMutex: &sync.RWMutex{},
				wg:              &sync.WaitGroup{},
				counterIncrCh:   make(chan *types.CounterEntry, 1),
			}

			entry := &types.CounterEntry{
				Name:   types.ConsumeBytes,
				Labels: map[string]string{},
				Value:  1,
			}

			err := m.Incr(context.Background(), entry)
			Expect(err).To(BeNil())

			m.wg.Add(1)

			looper := director.NewFreeLooper(1, make(chan error, 1))

			go m.runCounterWorkerPool("", looper)

			time.Sleep(time.Second)

			counters := m.getCounters()
			Expect(len(counters)).To(Equal(1))
			Expect(counters).To(HaveKey(compositeID(entry)))
			Expect(counters[compositeID(entry)].getValue()).To(Equal(int64(1)))

			m.wg.Add(1)
			m.counterTickerLooper = director.NewFreeLooper(1, make(chan error, 1))
			go m.runCounterTicker()

			time.Sleep(time.Second)

			counters = m.getCounters()
			Expect(counters[compositeID(entry)].getValue()).To(Equal(int64(0)))
		})
	})

	Context("runCounterReaper", func() {
		It("removes counter after interval", func() {

			entry := &types.CounterEntry{
				Name:   types.ConsumeBytes,
				Labels: map[string]string{},
				Value:  1,
			}

			m := &Metrics{
				Config: &Config{
					ServerClient:   &serverfakes.FakeIServerClient{},
					ShutdownCtx:    context.Background(),
					Log:            &loggerfakes.FakeLogger{},
					IncrInterval:   time.Millisecond,
					ReaperInterval: time.Millisecond,
					ReaperTTL:      0,
				},
				counterMap: map[string]*counter{
					compositeID(entry): {
						entry:      entry,
						count:      0,
						countMutex: &sync.RWMutex{},
					},
				},
				counterMapMutex: &sync.RWMutex{},
				wg:              &sync.WaitGroup{},
				counterIncrCh:   make(chan *types.CounterEntry, 1),
			}

			err := m.Incr(context.Background(), entry)
			Expect(err).To(BeNil())

			m.wg.Add(1)
			m.counterReaperLooper = director.NewFreeLooper(1, make(chan error, 1))
			go m.runCounterReaper()

			time.Sleep(time.Second)

			// We should have removed the counter at this point
			counters := m.getCounters()
			Expect(len(counters)).To(Equal(0))
		})

		It("shuts down worker on context cancel", func() {
			ctx, cancel := context.WithCancel(context.Background())
			defer cancel()

			m := &Metrics{
				Config: &Config{
					ServerClient:   &serverfakes.FakeIServerClient{},
					ShutdownCtx:    ctx,
					Log:            &loggerfakes.FakeLogger{},
					IncrInterval:   time.Millisecond,
					ReaperInterval: time.Millisecond,
					ReaperTTL:      0,
				},
				counterMap:      map[string]*counter{},
				counterMapMutex: &sync.RWMutex{},
				wg:              &sync.WaitGroup{},
				counterIncrCh:   make(chan *types.CounterEntry, 1),
			}

			m.wg.Add(1)
			m.counterReaperLooper = director.NewFreeLooper(director.FOREVER, make(chan error, 1))
			go m.runCounterReaper()

			time.Sleep(time.Millisecond * 200)

			cancel()

			time.Sleep(time.Millisecond * 200)

			err := m.counterReaperLooper.Wait()
			Expect(err).To(BeNil())

		})
	})

	Context("New", func() {
		It("Starts up and shuts down", func() {
			ctx, cancel := context.WithCancel(context.Background())
			defer cancel()

			m, err := New(&Config{
				ServerClient:   &serverfakes.FakeIServerClient{},
				ShutdownCtx:    ctx,
				Log:            &loggerfakes.FakeLogger{},
				IncrInterval:   time.Millisecond,
				ReaperInterval: time.Millisecond,
				ReaperTTL:      0,
			})
			Expect(err).To(BeNil())

			Expect(m).ToNot(BeNil())
			cancel()
			m.wg.Wait()
		})
	})
})
