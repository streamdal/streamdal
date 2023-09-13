package metrics

import (
	"context"
	"time"

	"github.com/paulbellamy/ratecounter"

	"github.com/streamdal/snitch-protos/build/go/protos"

	"github.com/streamdal/snitch-server/util"
)

// TODO: needed?
const (
	RateBytes     RateCounterType = "bytes"
	RateProcessed RateCounterType = "processed"
)

type RateCounter struct {
	Bytes     *ratecounter.RateCounter `json:"bytes"`
	Processed *ratecounter.RateCounter `json:"processed"`
}

type RateCounterType string

func (m *Metrics) IncreaseRate(ctx context.Context, t RateCounterType, aud *protos.Audience, value int64) {
	counter := m.GetRateCounter(ctx, aud)
	if t == RateBytes {
		counter.Bytes.Incr(value)
	} else {
		counter.Processed.Incr(value)
	}
}

func (m *Metrics) GetRateCounter(_ context.Context, aud *protos.Audience) *RateCounter {
	audStr := util.AudienceToStr(aud)

	m.rateCountersMtx.RLock()
	counter, ok := m.rateCounters[audStr]
	m.rateCountersMtx.RUnlock()

	if ok {
		return counter
	}

	// No counter yet, create one
	m.rateCountersMtx.Lock()
	defer m.rateCountersMtx.Unlock()
	counter = &RateCounter{
		Bytes:     ratecounter.NewRateCounter(10 * time.Second).WithResolution(100),
		Processed: ratecounter.NewRateCounter(10 * time.Second).WithResolution(100),
	}
	m.rateCounters[audStr] = counter

	return counter
}

func (m *Metrics) GetAllRateCounters(_ context.Context) map[string]*RateCounter {
	m.rateCountersMtx.RLock()
	defer m.rateCountersMtx.RUnlock()

	return m.rateCounters
}
