package metrics

import (
	"context"
	"fmt"
	"strings"
	"sync"
	"time"

	"github.com/pkg/errors"
	"github.com/relistan/go-director"

	"github.com/streamdal/snitch-go-client/logger"
	"github.com/streamdal/snitch-go-client/server"
	"github.com/streamdal/snitch-go-client/types"
)

//go:generate go run github.com/maxbrunsfeld/counterfeiter/v6 . IMetrics
type IMetrics interface {
	Incr(ctx context.Context, entry *types.CounterEntry) error
}

const (
	DefaultCounterInterval       = time.Second
	DefaultReaperCounterInterval = 10 * time.Second
	DefaultReaperCounterTTL      = 10 * time.Second
	DefaultCounterWorkerPoolSize = 10
)

var (
	ErrMissingPlumberClient = errors.New("PlumberClient cannot be nil")
	ErrMissingEntry         = errors.New("CounterEntry cannot be nil")
	ErrEmptyName            = errors.New("Name must be set")
	ErrMissingShutdownCtx   = errors.New("ShutdownCtx cannot be nil")
)

type Metrics struct {
	*Config

	wg                  *sync.WaitGroup
	counterMapMutex     *sync.RWMutex
	counterTickerLooper director.Looper
	counterReaperLooper director.Looper
	counterMap          map[string]*counter
	counterIncrCh       chan *types.CounterEntry
	counterPublishCh    chan *types.CounterEntry
}

type Config struct {
	CounterInterval       time.Duration
	ReaperCounterInterval time.Duration
	ReaperCounterTTL      time.Duration
	CounterWorkerPoolSize int
	ServerClient          server.IServerClient
	ShutdownCtx           context.Context
	Log                   logger.Logger
}

func New(cfg *Config) (*Metrics, error) {
	if err := validateConfig(cfg); err != nil {
		return nil, errors.Wrap(err, "unable to validate config")
	}

	m := &Metrics{
		Config:              cfg,
		counterMap:          make(map[string]*counter),
		counterMapMutex:     &sync.RWMutex{},
		counterTickerLooper: director.NewFreeLooper(director.FOREVER, make(chan error, 1)),
		counterReaperLooper: director.NewFreeLooper(director.FOREVER, make(chan error, 1)),
		counterIncrCh:       make(chan *types.CounterEntry, 10000),
		counterPublishCh:    make(chan *types.CounterEntry, 10000),
		wg:                  &sync.WaitGroup{},
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

	return m, nil
}

func validateConfig(cfg *Config) error {
	if cfg.ServerClient == nil {
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

	if cfg.Log == nil {
		cfg.Log = &logger.NoOpLogger{}
	}

	if cfg.ShutdownCtx == nil {
		return ErrMissingShutdownCtx
	}

	return nil
}

func (m *Metrics) Incr(ctx context.Context, entry *types.CounterEntry) error {
	if err := m.validateCounterEntry(entry); err != nil {
		return errors.Wrap(err, "unable to validate counter entry")
	}

	// counterIncrCh is a buffered channel (10k by default) so Incr() shouldn't
	// generally block. If it does, it is because the worker pool is lagging behind.
	m.counterIncrCh <- entry

	return nil
}

func (m *Metrics) validateCounterEntry(entry *types.CounterEntry) error {
	if entry == nil {
		return ErrMissingEntry
	}

	if entry.Name == "" {
		return ErrEmptyName
	}

	return nil
}

func (m *Metrics) newCounter(e *types.CounterEntry) *counter {
	m.counterMapMutex.Lock()
	defer m.counterMapMutex.Unlock()

	c := &counter{
		entry:      e,
		countMutex: &sync.RWMutex{},
	}

	m.counterMap[CompositeID(e)] = c

	return c
}

func (m *Metrics) getCounter(e *types.CounterEntry) (*counter, bool) {
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

	localCounters := make(map[string]*counter)

	for counterID, counter := range m.counterMap {
		localCounters[counterID] = counter
	}

	return localCounters
}

func (m *Metrics) incr(_ context.Context, entry *types.CounterEntry) error {
	// No need to validate - no way to reach here without validate
	c, ok := m.getCounter(entry)
	if ok {
		c.incr(entry)
		return nil
	}

	c = m.newCounter(entry)
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
			m.Log.Debugf("received publish for counter '%s', getValue: %d", entry.Name, entry.Value)
			err = m.ServerClient.SendMetrics(context.Background(), entry)
			if err != nil && strings.Contains(err.Error(), "connection refused") {
				// Snitch server went away, log, sleep, and wait for reconnect
				m.Log.Warn("failed to send metrics, snitch server went away, waiting for reconnect")
				time.Sleep(time.Second * 5)
				return nil
			}
		case <-m.ShutdownCtx.Done():
			m.Log.Debugf("received notice to shutdown")
			looper.Quit()
			shutdown = true

			return nil
		}

		if err != nil {
			m.Log.Errorf("worker pool error: %s", err)
		}

		return nil
	})

	m.Log.Debugf("exiting runCounterWorkerPool")
}

func (m *Metrics) runCounterTicker() {
	defer m.wg.Done()

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
		case <-m.ShutdownCtx.Done():
			m.Log.Debugf("received notice to shutdown")
			m.counterTickerLooper.Quit()
			shutdown = true
		}

		return nil
	})

	m.Log.Debugf("exiting runCounterTicker()")
}

func (m *Metrics) runCounterReaper() {
	defer m.wg.Done()

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
					m.Log.Debugf("skipping reaping for zero counter '%s'", counter.entry)
					continue
				}

				if time.Now().Sub(counter.getLastUpdated()) < m.Config.ReaperCounterTTL {
					m.Log.Debugf("skipping reaping for non-stale counter '%s'", counter.entry)
					continue
				}

				m.Log.Debugf("reaped stale counter '%s'", counter.entry)

				m.counterMapMutex.Lock()
				delete(m.counterMap, counterID)
				m.counterMapMutex.Unlock()
			}
		case <-m.ShutdownCtx.Done():
			m.Log.Debugf("received notice to shutdown")
			m.counterReaperLooper.Quit()
			shutdown = true

			return nil
		}

		return nil
	})

	m.Log.Debugf("exiting runCounterReaper()")
}
