package metrics

import (
	"github.com/charmbracelet/log"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
)

const (
	appPrefix = "log_processor"
)

type Prometheus struct {
	*Metrics
}

type Metrics struct {
	MessagesProcessedTotal         prometheus.Counter
	MessagesProcessedPerSecond     prometheus.Gauge
	MessagesProcessedErrorsTotal   prometheus.Counter
	UptimeSecondsTotal             prometheus.Counter
	IncomingConnectionsTotal       prometheus.Counter
	IncomingConnectionsActiveTotal prometheus.Counter
	OutgoingConnectionsTotal       prometheus.Counter
	OutgoingConnectionsActiveTotal prometheus.Counter
	ListenerGoroutines             prometheus.Gauge
	ListenerProcessedTotal         prometheus.Counter
	ListenerProcessedPerSecond     prometheus.Gauge
	ListenerErrorsTotal            prometheus.Counter
	ProcessorGoroutines            prometheus.Gauge
	ProcessorProcessedTotal        prometheus.Counter
	ProcessorProcessedPerSecond    prometheus.Gauge
	ProcessorErrorsTotal           prometheus.Counter
	SenderGoroutines               prometheus.Gauge
	SenderProcessedTotal           prometheus.Counter
	SenderProcessedPerSecond       prometheus.Gauge
	SenderErrorsTotal              prometheus.Counter

	log *log.Logger
}

func New() *Metrics {
	m := generateMetrics()
	m.log = log.With("pkg", "metrics")

	return m
}

func generateMetrics() *Metrics {
	return &Metrics{
		MessagesProcessedTotal: promauto.NewCounter(prometheus.CounterOpts{
			Name: appPrefix + "_messages_processed_total",
			Help: "Total number of processed events",
		}),

		MessagesProcessedPerSecond: promauto.NewGauge(prometheus.GaugeOpts{
			Name: appPrefix + "_messages_processed_per_second",
			Help: "Number of messages log-processor is processing per second",
		}),

		MessagesProcessedErrorsTotal: promauto.NewCounter(prometheus.CounterOpts{
			Name: appPrefix + "_messages_processed_errors",
			Help: "Total number of errors encountered during processing",
		}),

		UptimeSecondsTotal: promauto.NewCounter(prometheus.CounterOpts{
			Name: appPrefix + "_uptime_seconds_total",
			Help: "How long log-processor has been running",
		}),

		IncomingConnectionsTotal: promauto.NewCounter(prometheus.CounterOpts{
			Name: appPrefix + "_incoming_connections_total",
			Help: "Total number of incoming connections",
		}),

		IncomingConnectionsActiveTotal: promauto.NewCounter(prometheus.CounterOpts{
			Name: appPrefix + "_incoming_connections_active_total",
			Help: "Active incoming connections",
		}),

		OutgoingConnectionsTotal: promauto.NewCounter(prometheus.CounterOpts{
			Name: appPrefix + "_outgoing_connections_total",
			Help: "Total number of outgoing connections",
		}),

		OutgoingConnectionsActiveTotal: promauto.NewCounter(prometheus.CounterOpts{
			Name: appPrefix + "_outgoing_connections_active_total",
			Help: "Active outgoing connections",
		}),

		// Listener metrics

		ListenerGoroutines: promauto.NewGauge(prometheus.GaugeOpts{
			Name: appPrefix + "_listener_goroutines",
			Help: "Number of goroutines used for listeners",
		}),

		ListenerProcessedTotal: promauto.NewCounter(prometheus.CounterOpts{
			Name: appPrefix + "_listener_processed_total",
			Help: "Total number of messages processed by listeners",
		}),

		ListenerProcessedPerSecond: promauto.NewGauge(prometheus.GaugeOpts{
			Name: appPrefix + "_listener_processed_per_second",
			Help: "Number of messages processed by listeners per second",
		}),

		ListenerErrorsTotal: promauto.NewCounter(prometheus.CounterOpts{
			Name: appPrefix + "_listener_errors_total",
			Help: "Total number of errors encountered by listeners",
		}),

		// Processor

		ProcessorGoroutines: promauto.NewGauge(prometheus.GaugeOpts{
			Name: appPrefix + "_processor_goroutines",
			Help: "Number of goroutines used for processors",
		}),

		ProcessorProcessedTotal: promauto.NewCounter(prometheus.CounterOpts{
			Name: appPrefix + "_processor_processed_total",
			Help: "Total number of messages processed by processors",
		}),

		ProcessorProcessedPerSecond: promauto.NewGauge(prometheus.GaugeOpts{
			Name: appPrefix + "_processor_processed_per_second",
			Help: "Number of messages processed by processors per second",
		}),

		ProcessorErrorsTotal: promauto.NewCounter(prometheus.CounterOpts{
			Name: appPrefix + "_processor_errors_total",
			Help: "Total number of errors encountered by processors",
		}),

		// Sender metrics

		SenderGoroutines: promauto.NewGauge(prometheus.GaugeOpts{
			Name: appPrefix + "_sender_goroutines",
			Help: "Number of goroutines used for senders",
		}),

		SenderProcessedTotal: promauto.NewCounter(prometheus.CounterOpts{
			Name: appPrefix + "_sender_processed_total",
			Help: "Total number of messages processed by senders",
		}),

		SenderProcessedPerSecond: promauto.NewGauge(prometheus.GaugeOpts{
			Name: appPrefix + "_sender_processed_per_second",
			Help: "Number of messages processed by senders per second",
		}),

		SenderErrorsTotal: promauto.NewCounter(prometheus.CounterOpts{
			Name: appPrefix + "_sender_errors_total",
			Help: "Total number of errors encountered by senders",
		}),
	}
}
