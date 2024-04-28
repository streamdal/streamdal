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
	StreamdalProcessTotal          prometheus.Counter
	StreamdalProcessPerSecond      prometheus.Gauge
	StreamdalProcessErrorsTotal    prometheus.Counter
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
		StreamdalProcessTotal: promauto.NewCounter(prometheus.CounterOpts{
			Name: appPrefix + "_streamdal_process_total",
			Help: "Total number of processed with Streamdal client",
		}),

		StreamdalProcessPerSecond: promauto.NewGauge(prometheus.GaugeOpts{
			Name: appPrefix + "_streamdal_process_per_second",
			Help: "Number of messages processed per second by Streamdal client",
		}),

		StreamdalProcessErrorsTotal: promauto.NewCounter(prometheus.CounterOpts{
			Name: appPrefix + "_streamdal_process_errors_total",
			Help: "Total number of errors encountered during Streamdal process call",
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

		// DONE
		ListenerGoroutines: promauto.NewGauge(prometheus.GaugeOpts{
			Name: appPrefix + "_listener_goroutines",
			Help: "Number of goroutines used for listeners",
		}),

		// DONE
		ListenerProcessedTotal: promauto.NewCounter(prometheus.CounterOpts{
			Name: appPrefix + "_listener_processed_total",
			Help: "Total number of messages processed by listeners",
		}),

		ListenerProcessedPerSecond: promauto.NewGauge(prometheus.GaugeOpts{
			Name: appPrefix + "_listener_processed_per_second",
			Help: "Number of messages processed by listeners per second",
		}),

		// DONE
		ListenerErrorsTotal: promauto.NewCounter(prometheus.CounterOpts{
			Name: appPrefix + "_listener_errors_total",
			Help: "Total number of errors encountered by listeners",
		}),

		// Processor

		// DONE
		ProcessorGoroutines: promauto.NewGauge(prometheus.GaugeOpts{
			Name: appPrefix + "_processor_goroutines",
			Help: "Number of goroutines used for processors",
		}),

		// DONE
		ProcessorProcessedTotal: promauto.NewCounter(prometheus.CounterOpts{
			Name: appPrefix + "_processor_processed_total",
			Help: "Total number of messages processed by processors",
		}),

		ProcessorProcessedPerSecond: promauto.NewGauge(prometheus.GaugeOpts{
			Name: appPrefix + "_processor_processed_per_second",
			Help: "Number of messages processed by processors per second",
		}),

		// DONE
		ProcessorErrorsTotal: promauto.NewCounter(prometheus.CounterOpts{
			Name: appPrefix + "_processor_errors_total",
			Help: "Total number of errors encountered by processors",
		}),

		// Sender metrics

		// DONE
		SenderGoroutines: promauto.NewGauge(prometheus.GaugeOpts{
			Name: appPrefix + "_sender_goroutines",
			Help: "Number of goroutines used for senders",
		}),

		// DONE
		SenderProcessedTotal: promauto.NewCounter(prometheus.CounterOpts{
			Name: appPrefix + "_sender_processed_total",
			Help: "Total number of messages processed by senders",
		}),

		SenderProcessedPerSecond: promauto.NewGauge(prometheus.GaugeOpts{
			Name: appPrefix + "_sender_processed_per_second",
			Help: "Number of messages processed by senders per second",
		}),

		// DONE
		SenderErrorsTotal: promauto.NewCounter(prometheus.CounterOpts{
			Name: appPrefix + "_sender_errors_total",
			Help: "Total number of errors encountered by senders",
		}),
	}
}
