package metrics

import (
	"context"
	"fmt"
	"sync"
	"time"

	"github.com/pkg/errors"
	"github.com/relistan/go-director"

	"github.com/streamdal/dataqual/logger"
	"github.com/streamdal/dataqual/plumber"
)

const (
	DefaultCounterInterval       = time.Second
	DefaultReaperCounterInterval = 10 * time.Second
	DefaultReaperCounterTTL      = 10 * time.Second
	DefaultCounterWorkerPoolSize = 10
)

var (
	ErrMissingPlumberClient = errors.New("PlumberClient cannot be nil")
	ErrMissingEntry         = errors.New("CounterEntry cannot be nil")
	ErrEmptyEntryID         = errors.New("ID must be set")
	ErrEmptyEntryType       = errors.New("Type must be set")
)

type Metrics struct {
	*Config

	ctx    context.Context
	cancel context.CancelFunc
	wg     *sync.WaitGroup

	counterMapMutex     *sync.RWMutex
	counterTickerLooper director.Looper
	counterReaperLooper director.Looper
	counterMap          map[string]*counter
	counterIncrCh       chan *CounterEntry
	counterPublishCh    chan *CounterEntry
}

type Config struct {
	CounterInterval       time.Duration
	ReaperCounterInterval time.Duration
	ReaperCounterTTL      time.Duration
	CounterWorkerPoolSize int
	Plumber               plumber.IPlumberClient
	log                   logger.Logger
}

type CounterEntry struct {
	ID    string // uuid of the rule
	Type  string // "errors", "messages", "bytes"
	Value int64
}

func New(cfg *Config) (*Metrics, error) {
	if err := validateConfig(cfg); err != nil {
		return nil, errors.Wrap(err, "unable to validate config")
	}

	m := &Metrics{
		Config:              cfg,
		counterMap:          make(map[string]*counter, 0),
		counterMapMutex:     &sync.RWMutex{},
		counterTickerLooper: director.NewFreeLooper(director.FOREVER, make(chan error, 1)),
		counterReaperLooper: director.NewFreeLooper(director.FOREVER, make(chan error, 1)),
		counterIncrCh:       make(chan *CounterEntry, 10000),
	}

	// Launch counter worker pool
	for i := 0; i < m.Config.CounterWorkerPoolSize; i++ {
		m.wg.Add(1)
		go m.runCounterWorkerPool(
			fmt.Sprintf("worker-%d", i),
			director.NewFreeLooper(director.FOREVER, make(chan error, 1)),
		)
	}

	// Launch counter ticker
	m.wg.Add(1)
	go m.runCounterTicker()

	// Launch counter reaper
	m.wg.Add(1)
	go m.runCounterReaper()

	go m.startDumper()

	return m, nil
}

func validateConfig(cfg *Config) error {
	if cfg.Plumber == nil {
		return ErrMissingPlumberClient
	}

	if cfg.CounterInterval == 0 {
		cfg.CounterInterval = DefaultCounterInterval
	}

	if cfg.ReaperCounterInterval == 0 {
		cfg.ReaperCounterInterval = DefaultReaperCounterInterval
	}

	if cfg.ReaperCounterTTL == 0 {
		cfg.ReaperCounterTTL = DefaultReaperCounterTTL
	}

	if cfg.CounterWorkerPoolSize == 0 {
		cfg.CounterWorkerPoolSize = DefaultCounterWorkerPoolSize
	}

	return nil
}

// startDumper is a goroutine which periodically dumps metrics to Plumber
func (m *Metrics) startDumper() {
	m.counterMapMutex.Lock()
	counters := m.counterMap
	for k, _ := range m.counterMap {
		m.counterMap[k].count = 0
	}
	m.counterMapMutex.Unlock()

	for name, c := range counters {
		m.Plumber.SendMetrics(context.Background(), name, float64(c.count))
	}
}

func (m *Metrics) Incr(ctx context.Context, entry *CounterEntry) error {
	if err := m.validateCounterEntry(entry); err != nil {
		return errors.Wrap(err, "unable to validate counter entry")
	}

	// counterIncrCh is a buffered channel (10k by default) so Incr() shouldn't
	// generally block. If it does, it is because the worker pool is lagging behind.
	m.counterIncrCh <- entry

	return nil
}

func (m *Metrics) validateCounterEntry(entry *CounterEntry) error {
	if entry == nil {
		return ErrMissingEntry
	}

	if entry.Type == "" {
		return ErrEmptyEntryType
	}

	return nil
}

func (m *Metrics) newCounter(e *CounterEntry) *counter {
	m.counterMapMutex.Lock()
	defer m.counterMapMutex.Unlock()

	m.counterMap[CompositeID(e)] = &counter{
		entry:      e,
		countMutex: &sync.RWMutex{},
	}

	return m.counterMap[CompositeID(e)]
}

func (m *Metrics) getCounter(e *CounterEntry) (*counter, bool) {
	m.counterMapMutex.RLock()
	defer m.counterMapMutex.RUnlock()

	if counter, ok := m.counterMap[CompositeID(e)]; ok {
		return counter, true
	}

	return nil, false
}

// getCounters fetches active counters
func (m *Metrics) getCounters() map[string]*counter {
	m.counterMapMutex.RLock()
	defer m.counterMapMutex.RUnlock()

	localCounters := make(map[string]*counter, 0)

	for counterID, counter := range m.counterMap {
		localCounters[counterID] = counter
	}

	return localCounters
}

func (m *Metrics) incr(_ context.Context, entry *CounterEntry) error {
	// No need to validate - no way to reach here without validation
	c, ok := m.getCounter(entry)
	if !ok {
		c = m.newCounter(entry)
	}

	c.incr(entry)

	return nil
}

// runCounterWorkerPool is responsible for listening for Incr() requests and
// flush requests (from ticker runner).
func (m *Metrics) runCounterWorkerPool(_ string, looper director.Looper) {
	defer m.wg.Done()

	var (
		err      error
		shutdown bool
	)

	looper.Loop(func() error {
		// Give looper a moment to catch up
		if shutdown {
			time.Sleep(100 * time.Millisecond)
			return nil
		}

		select {
		case entry := <-m.counterIncrCh: // Coming from user doing Incr() // buffered chan
			err = m.incr(context.Background(), entry)
		case entry := <-m.counterPublishCh: // Coming from ticker runner
			m.log.Debugf("received publish for counter '%s', getValue: %d", entry.Type, entry.Value)
			err = m.publishCounter(context.Background(), entry)
		case <-m.ctx.Done():
			m.log.Debugf("received notice to shutdown")
			looper.Quit()
			shutdown = true

			return nil
		}

		if err != nil {
			m.log.Error("worker pool error: %s", err)
		}

		return nil
	})

	m.log.Debugf("exiting runCounterWorkerPool")
}

func (m *Metrics) runCounterTicker() {
	defer m.wg.Done()

	m.log.Debugf("starting runCounterTicker()")

	var shutdown bool

	ticker := time.NewTicker(m.Config.CounterInterval)

	m.counterTickerLooper.Loop(func() error {
		// Give looper a moment to catch up
		if shutdown {
			time.Sleep(100 * time.Millisecond)
			return nil
		}

		select {
		case <-ticker.C:
			counters := m.getCounters()

			for _, counter := range counters {
				counterValue := counter.getValue()

				// Do not publish zero values
				if counterValue == 0 {
					continue
				}

				// Get CounterEntry w/ overwritten value
				entry := counter.getEntry()

				// Reset counter back to 0
				counter.reset()

				// If this blocks, it indicates that worker pool is lagging behind
				m.counterPublishCh <- &entry
			}
		case <-m.ctx.Done():
			m.log.Debugf("received notice to shutdown")
			m.counterTickerLooper.Quit()
			shutdown = true
		}

		return nil
	})

	m.log.Debugf("exiting runCounterTicker()")
}

func (m *Metrics) runCounterReaper() {
	defer m.wg.Done()

	m.log.Debugf("starting runCounterReaper()")

	var shutdown bool

	ticker := time.NewTicker(m.Config.ReaperCounterInterval)

	m.counterReaperLooper.Loop(func() error {
		if shutdown {
			time.Sleep(100 * time.Millisecond)
			return nil
		}

		select {
		case <-ticker.C:
			counters := m.getCounters()

			for counterID, counter := range counters {
				// Do not reap active counters
				if counter.getValue() != 0 {
					m.log.Debugf("skipping reaping for zero counter '%s'", counter.entry)
					continue
				}

				if time.Now().Sub(counter.getLastUpdated()) < m.Config.ReaperCounterTTL {
					m.log.Debugf("skipping reaping for non-stale counter '%s'", counter.entry)
					continue
				}

				m.log.Debugf("reaped stale counter '%s'", counter.entry)

				m.counterMapMutex.Lock()
				delete(m.counterMap, counterID)
				m.counterMapMutex.Unlock()
			}
		case <-m.ctx.Done():
			m.log.Debugf("received notice to shutdown")
			m.counterReaperLooper.Quit()
			shutdown = true

			return nil
		}

		return nil
	})

	m.log.Debugf("exiting runCounterReaper()")
}

func (m *Metrics) publishCounter(ctx context.Context, entry *CounterEntry) error {
	return m.Plumber.SendMetrics(ctx, entry.Type, float64(entry.Value))
}
