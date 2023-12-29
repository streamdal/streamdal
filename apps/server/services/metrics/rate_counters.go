package metrics

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/paulbellamy/ratecounter"

	"github.com/streamdal/streamdal/libs/protos/build/go/protos"
)

type RateCounter struct {
	Bytes     *ratecounter.RateCounter `json:"bytes"`
	Processed *ratecounter.RateCounter `json:"processed"`
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

	ret := make(map[string]*RateCounter)
	for k, v := range m.rateCounters {
		ret[k] = v
	}

	return ret
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
