package metrics

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/paulbellamy/ratecounter"

	"github.com/streamdal/protos/build/go/protos"
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
	audStr := groupAudienceToStr(aud)

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

// groupAudienceToStr returns a string representation of an audience, but without the audience's operation name
// this is used to group rates so we may display a single number on the graph edge in the UI
func groupAudienceToStr(audience *protos.Audience) string {
	if audience == nil {
		return ""
	}

	str := strings.ToLower(fmt.Sprintf("%s/%s/%s", audience.ServiceName, audience.OperationType, audience.ComponentName))

	return str
}
