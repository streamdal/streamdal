package metrics

import (
	"context"
	"sync"

	"github.com/pkg/errors"
	"github.com/prometheus/client_golang/prometheus"

	"github.com/streamdal/snitch-protos/build/go/protos"
)

const (
	Namespace = "streamdal"
	Subsystem = "snitch"
)

type defaultCounter struct {
	Name        string
	Description string
	Labels      []string
}

var defaultCounters = []*defaultCounter{
	{
		Name:        "counter_consume_bytes",
		Description: "Total number of bytes passed through consume pipelines",
		Labels:      []string{"service", "component_name", "pipeline_name", "pipeline_id", "operation_name"},
	},
	{
		Name:        "counter_consume_processed",
		Description: "Total number of payloads processed by consume pipelines",
		Labels:      []string{"service", "component_name", "pipeline_name", "pipeline_id", "operation_name"},
	},
	{
		Name:        "counter_consume_errors",
		Description: "Number of errors encountered by consume pipelines",
		Labels:      []string{"service", "component_name", "pipeline_name", "pipeline_id", "operation_name"},
	},
	{
		Name:        "counter_produce_bytes",
		Description: "Total number of bytes passed through produce pipelines",
		Labels:      []string{"service", "component_name", "pipeline_name", "pipeline_id", "operation_name"},
	},
	{
		Name:        "counter_produce_processed",
		Description: "Total number of payloads processed by produce pipelines",
		Labels:      []string{"service", "component_name", "pipeline_name", "pipeline_id", "operation_name"},
	},
	{
		Name:        "counter_produce_errors",
		Description: "Number of errors encountered by produce pipelines",
		Labels:      []string{"service", "component_name", "pipeline_name", "pipeline_id", "operation_name"},
	},
	{
		Name:        "counter_notify",
		Description: "Number of errors encountered by produce pipelines",
		Labels:      []string{"service", "component_name", "pipeline_name", "pipeline_id", "operation_name", "config_id", "config_name"},
	},
}

type IMetrics interface {
	HandleMetricsRequest(ctx context.Context, req *protos.MetricsRequest) error
}

type Metrics struct {
	*Config
	VecCounters    map[string]*prometheus.CounterVec
	VecCountersMtx *sync.RWMutex
}

type Config struct {
	// TODO
}

func New(cfg *Config) (*Metrics, error) {
	if err := validateConfig(cfg); err != nil {
		return nil, errors.Wrap(err, "invalid config")
	}

	for _, counter := range defaultCounters {
		prometheus.NewCounterVec(prometheus.CounterOpts{
			Namespace: Namespace,
			Subsystem: Subsystem,
			Name:      counter.Name,
			Help:      counter.Description,
		}, counter.Labels)
	}

	return &Metrics{
		Config:         cfg,
		VecCounters:    make(map[string]*prometheus.CounterVec),
		VecCountersMtx: &sync.RWMutex{},
	}, nil
}

func validateConfig(cfg *Config) error {
	// TODO
	return nil
}

func (m *Metrics) HandleMetricsRequest(ctx context.Context, req *protos.MetricsRequest) error {
	for _, metric := range req.Metrics {
		counter := m.getVecCounter(ctx, metric.Name)
		if counter == nil {
			return errors.Errorf("unable to find counter: %s", metric.Name)
		}

		counter.With(metric.Labels).Add(metric.Value)
	}

	return nil
}

func (m *Metrics) getVecCounter(ctx context.Context, name string) *prometheus.CounterVec {
	m.VecCountersMtx.RLock()
	defer m.VecCountersMtx.RUnlock()

	if c, ok := m.VecCounters[name]; ok {
		return c
	}

	return nil
}
