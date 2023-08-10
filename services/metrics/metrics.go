package metrics

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"regexp"
	"strings"
	"sync"
	"time"

	"github.com/nats-io/nats.go"
	"github.com/pkg/errors"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"github.com/relistan/go-director"
	"github.com/sirupsen/logrus"

	"github.com/streamdal/natty"

	"github.com/streamdal/snitch-protos/build/go/protos"
)

const (
	// namespace is the prometheus namespace for all metrics
	namespace = "streamdal"

	// subsystem is the prometheus subsystem for all metrics
	subsystem = "snitch"

	// counterDumperInterval is how often we will dump metrics to NATS
	counterDumperInterval = time.Second * 10
)

// defaultCounter is used to define counters
type defaultCounter struct {
	Name        string
	Description string
	Labels      []string
}

// storeCounter is used to cache counters in NATS
type storeCounter struct {
	Name   string            `json:"name"`
	Labels map[string]string `json:"labels"`
	Value  float64           `json:"value"`
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
	log            *logrus.Entry
}

type Config struct {
	NATSBackend natty.INatty
	ShutdownCtx context.Context
}

func New(cfg *Config) (*Metrics, error) {
	if err := validateConfig(cfg); err != nil {
		return nil, errors.Wrap(err, "invalid config")
	}

	m := &Metrics{
		Config:         cfg,
		VecCounters:    make(map[string]*prometheus.CounterVec),
		VecCountersMtx: &sync.RWMutex{},
		log:            logrus.WithField("service", "metrics"),
	}

	for _, counter := range defaultCounters {
		c := promauto.NewCounterVec(prometheus.CounterOpts{
			Namespace: namespace,
			Subsystem: subsystem,
			Name:      counter.Name,
			Help:      counter.Description,
		}, counter.Labels)
		m.VecCounters[counter.Name] = c
	}

	if err := m.loadCountersFromStore(); err != nil {
		m.log.Error(err)
	}

	go m.runCounterDumper(director.NewFreeLooper(director.FOREVER, make(chan error, 1)))

	return m, nil
}

func (m *Metrics) loadCountersFromStore() error {
	counters := make([]*storeCounter, 0)

	data, err := m.NATSBackend.Get(context.Background(), "snitch_metrics", "counters.json")
	if err != nil {
		if errors.Is(err, nats.ErrKeyNotFound) {
			// No saved counters yet, ignore
			return nil
		}
		return errors.Wrap(err, "unable to get counters from store")
	}

	if err := json.Unmarshal(data, &counters); err != nil {
		return errors.Wrap(err, "unable to unmarshal counters")
	}

	for _, counter := range counters {
		c, err := m.getVecCounter(context.Background(), counter.Name).GetMetricWith(counter.Labels)
		if err != nil {
			m.log.Errorf("unable to get metric with labels: %v", counter.Labels)
			continue
		}

		m.log.Debugf("loaded counter '%s' from store with value '%2f'", counter.Name, counter.Value)

		c.Add(counter.Value)
	}

	m.log.Debug("loaded counters from store")

	return nil
}

func validateConfig(cfg *Config) error {
	if cfg.NATSBackend == nil {
		return errors.New("nats backend is required")
	}

	if cfg.ShutdownCtx == nil {
		return errors.New("shutdown context is required")
	}

	return nil
}

func (m *Metrics) HandleMetricsRequest(ctx context.Context, req *protos.MetricsRequest) error {
	for _, metric := range req.Metrics {
		counter := m.getVecCounter(ctx, metric.Name)
		if counter == nil {
			return errors.Errorf("unable to find counter: %s", metric.Name)
		}

		c, err := counter.GetMetricWith(metric.Labels)
		if err != nil {
			return errors.Wrapf(err, "unable to get metric with labels: %v", metric.Labels)
		}

		c.Add(metric.Value)
	}

	return nil
}

func (m *Metrics) getVecCounter(_ context.Context, name string) *prometheus.CounterVec {
	m.VecCountersMtx.RLock()
	defer m.VecCountersMtx.RUnlock()

	if c, ok := m.VecCounters[name]; ok {
		return c
	}

	return nil
}

func (m *Metrics) runCounterDumper(looper director.Looper) {
	var quit bool
	looper.Loop(func() error {
		time.Sleep(counterDumperInterval)
		if quit {
			time.Sleep(time.Millisecond * 50)
			return nil
		}

		select {
		case <-m.ShutdownCtx.Done():
			quit = true
			looper.Quit()
			return nil
		default:
			// NOOP
		}

		if err := m.dumpCounters(); err != nil {
			m.log.Error(err)
		}

		return nil
	})
}

func (m *Metrics) dumpCounters() error {
	client := http.DefaultClient

	req, err := http.NewRequest(http.MethodGet, "http://localhost:8080/metrics", nil)
	if err != nil {
		return errors.Wrap(err, "unable to create request")
	}

	resp, err := client.Do(req)
	if err != nil {
		return errors.Wrap(err, "unable to get metrics")
	}

	defer resp.Body.Close()

	content, err := io.ReadAll(resp.Body)
	if err != nil {
		return errors.Wrap(err, "unable to read response body")
	}

	lines := strings.Split(string(content), "\n")

	counters := make([]*storeCounter, 0)
	for _, line := range lines {
		if strings.HasPrefix(line, "streamdal_") {
			storeCounter, err := parseMetricString(line)
			if err != nil {
				m.log.Error(err)
				continue
			}

			counters = append(counters, storeCounter)
		}
	}

	data, err := json.Marshal(counters)
	if err != nil {
		return errors.Wrap(err, "unable to marshal counters")
	}

	err = m.NATSBackend.Put(context.Background(), "snitch_metrics", "counters.json", data)
	if err != nil {
		return errors.Wrap(err, "unable to put counters to store")
	}

	return nil
}

// parseMetricString parses a prometheus metric string into a storeCounter struct for caching in NATS
func parseMetricString(input string) (*storeCounter, error) {
	// Get key-value pairs
	r := regexp.MustCompile(`(\w+)="([^"]+)"`)
	matches := r.FindAllStringSubmatch(input, -1)

	labels := make(map[string]string)
	for _, match := range matches {
		labels[match[1]] = match[2]
	}

	// Parse the value
	parts := strings.Split(input, " ")
	var value float64
	if len(parts) < 2 {
		return nil, errors.New("value not found in prometheus metric")
	}

	if _, err := fmt.Sscanf(parts[1], "%g", &value); err != nil {
		return nil, err
	}

	if value == 0 {
		return nil, errors.New("value is zero")
	}

	name := input[:strings.Index(input, "{")]

	return &storeCounter{
		Name:   strings.Replace(name, "streamdal_snitch_", "", 1),
		Labels: labels,
		Value:  value,
	}, nil
}
