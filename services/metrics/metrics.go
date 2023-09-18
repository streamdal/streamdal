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

	"github.com/redis/go-redis/v9"

	"github.com/pkg/errors"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"github.com/relistan/go-director"
	"github.com/sirupsen/logrus"

	"github.com/streamdal/snitch-protos/build/go/protos"
)

const (
	// namespace is the prometheus namespace for all metrics
	namespace = "streamdal"

	// subsystem is the prometheus subsystem for all metrics
	subsystem = "snitch"

	// counterDumperInterval is how often we will dump metrics to RedisBackend
	counterDumperInterval = time.Second * 10
)

// defaultCounter is used to define counters
type defaultCounter struct {
	Name        string
	Description string
	Labels      []string
}

// storeCounter is used to cache counters in RedisBackend

var defaultCounters = []*defaultCounter{
	{
		Name:        "counter_consume_bytes",
		Description: "Total number of bytes passed through consume pipelines",
		Labels:      []string{"service", "component", "pipeline_name", "pipeline_id", "operation"},
	},
	{
		Name:        "counter_consume_processed",
		Description: "Total number of payloads processed by consume pipelines",
		Labels:      []string{"service", "component", "pipeline_name", "pipeline_id", "operation"},
	},
	{
		Name:        "counter_consume_errors",
		Description: "Number of errors encountered by consume pipelines",
		Labels:      []string{"service", "component", "pipeline_name", "pipeline_id", "operation"},
	},
	{
		Name:        "counter_produce_bytes",
		Description: "Total number of bytes passed through produce pipelines",
		Labels:      []string{"service", "component", "pipeline_name", "pipeline_id", "operation"},
	},
	{
		Name:        "counter_produce_processed",
		Description: "Total number of payloads processed by produce pipelines",
		Labels:      []string{"service", "component", "pipeline_name", "pipeline_id", "operation"},
	},
	{
		Name:        "counter_produce_errors",
		Description: "Number of errors encountered by produce pipelines",
		Labels:      []string{"service", "component", "pipeline_name", "pipeline_id", "operation"},
	},
	{
		Name:        "counter_notify",
		Description: "Number of errors encountered by produce pipelines",
		Labels:      []string{"service", "component", "pipeline_name", "pipeline_id", "operation"},
	},
}

type IMetrics interface {
	FetchCounters(ctx context.Context) ([]*protos.Metric, error)

	GetAllRateCounters(_ context.Context) map[string]*RateCounter

	HandleMetricsRequest(ctx context.Context, req *protos.MetricsRequest) error

	IncreaseRate(ctx context.Context, t RateCounterType, aud *protos.Audience, value int64)
}

type Metrics struct {
	*Config
	VecCounters     map[string]*prometheus.CounterVec
	VecCountersMtx  *sync.RWMutex
	rateCounters    map[string]*RateCounter
	rateCountersMtx *sync.RWMutex
	log             *logrus.Entry
}

type Config struct {
	RedisBackend *redis.Client
	ShutdownCtx  context.Context
}

func New(cfg *Config) (*Metrics, error) {
	if err := validateConfig(cfg); err != nil {
		return nil, errors.Wrap(err, "invalid config")
	}

	m := &Metrics{
		Config:          cfg,
		VecCounters:     make(map[string]*prometheus.CounterVec),
		VecCountersMtx:  &sync.RWMutex{},
		rateCounters:    make(map[string]*RateCounter),
		rateCountersMtx: &sync.RWMutex{},
		log:             logrus.WithField("service", "metrics"),
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
	counters := make([]*protos.Metric, 0)

	resp := m.RedisBackend.Get(context.Background(), "counters")
	data, err := resp.Bytes()
	if err != nil {
		if err == redis.Nil {
			// No counter key yet
			return nil
		}
		return errors.Wrap(err, "unable to get counters from store")
	}

	if err := json.Unmarshal(data, &counters); err != nil {
		return errors.Wrap(err, "unable to unmarshal counters")
	}

	for _, counter := range counters {
		c := m.getVecCounter(context.Background(), counter.Name)
		if c == nil {
			m.log.Errorf("unable to find counter: %s", counter.Name)
			continue
		}

		withLabels, err := c.GetMetricWith(counter.Labels)
		if err != nil {
			m.log.Errorf("unable to get metric with labels: %v", counter.Labels)
			continue
		}

		m.log.Debugf("loaded counter '%s' from store with value '%2f'", counter.Name, counter.Value)

		withLabels.Add(counter.Value)
	}

	m.log.Debug("loaded counters from store")

	return nil
}

func validateConfig(cfg *Config) error {
	if cfg.RedisBackend == nil {
		return errors.New("nats backend is required")
	}

	if cfg.ShutdownCtx == nil {
		return errors.New("shutdown context is required")
	}

	return nil
}

func (m *Metrics) HandleMetricsRequest(ctx context.Context, req *protos.MetricsRequest) error {
	for _, metric := range req.Metrics {
		// Update rate counter
		if shouldRecordMetric(metric.Name) {
			m.increaseRate(ctx, metric)
			return nil
		}

		// Update increment counter
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

func (m *Metrics) increaseRate(ctx context.Context, metric *protos.Metric) {
	// Get counter based on audience. We need to build audience from labels

	counter := m.GetRateCounter(ctx, metric.Audience)

	m.log.Debugf("increasing rate counter '%s' by '%d'", metric.Name, int64(metric.Value))

	switch metric.Name {
	case "counter_consume_bytes_rate":
		fallthrough
	case "counter_produce_bytes_rate":
		counter.Bytes.Incr(int64(metric.Value))
	case "counter_consume_processed_rate":
		fallthrough
	case "counter_produce_processed_rate":
		counter.Processed.Incr(int64(metric.Value))
	}
}

func shouldRecordMetric(name string) bool {
	return strings.HasSuffix(name, "_rate")
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
			m.log.Error(errors.Wrap(err, "failed to dump counters"))
		}

		return nil
	})
}

func (m *Metrics) FetchCounters(ctx context.Context) ([]*protos.Metric, error) {
	client := http.DefaultClient

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, "http://localhost:8080/metrics", nil)
	if err != nil {
		return nil, errors.Wrap(err, "unable to create request")
	}

	resp, err := client.Do(req)
	if err != nil {
		return nil, errors.Wrap(err, "unable to get metrics")
	}

	defer resp.Body.Close()

	content, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, errors.Wrap(err, "unable to read response body")
	}

	lines := strings.Split(string(content), "\n")

	counters := make([]*protos.Metric, 0)
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

	return counters, nil
}

func (m *Metrics) dumpCounters() error {
	counters, err := m.FetchCounters(context.Background())

	data, err := json.Marshal(counters)
	if err != nil {
		return errors.Wrap(err, "unable to marshal counters")
	}

	resp := m.RedisBackend.Set(context.Background(), "counters", data, 0)
	if _, err := resp.Result(); err != nil {
		return errors.Wrap(err, "unable to put counters to store")
	}

	return nil
}

// parseMetricString parses a prometheus metric string into a protos.Metric struct for caching in RedisBackend
func parseMetricString(input string) (*protos.Metric, error) {
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

	if _, err := fmt.Sscanf(parts[len(parts)-1], "%g", &value); err != nil {
		return nil, errors.Wrapf(err, "unable to parse value '%v'", parts)
	}

	if value == 0 {
		return nil, errors.New("value is zero")
	}

	name := input[:strings.Index(input, "{")]

	return &protos.Metric{
		Name:   strings.Replace(name, "streamdal_snitch_", "", 1),
		Labels: labels,
		Value:  value,
	}, nil
}
