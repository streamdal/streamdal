// Package types contains commonly used types that are shared between
// various components of Streamdal server.
package types

const (
	PubSubChangesTopic = "changes"
	UibffEndpoint      = "https://api.streamdal.com"

	// Telemetry constants

	// GaugeServerUptime tracks how long this server instance has been running
	// Labels = install_id, node_id
	GaugeServerUptime = "uptime_seconds"

	// GaugeServerCreated is a UNIX timestamp for when server was first created
	// Labels = install_id, node_id
	GaugeServerCreated = "timestamp_created_seconds"

	// GaugeServerStart is a UNIX timestamp for when server was started
	// Labels = install_id, node_id
	GaugeServerStart = "timestamp_start_seconds"

	// GaugeTimestampPing is a UNIX timestamp that shows the last time the server pinged the telemetry server
	// Labels = install_id, node_id
	GaugeTimestampPing = "timestamp_ping_seconds"

	// GaugeUsageNumServices track number of unique services.
	// Labels = install_id
	GaugeUsageNumServices = "usage_num_services"

	// GaugeUsageNumConsumers tracks the number of unique consumers.
	// Labels = install_id, status=active|inactive
	GaugeUsageNumConsumers = "usage_num_consumers"

	// GaugeUsageNumProducers tracks the number of unique producers.
	// Labels = install_id, status=active|inactive
	GaugeUsageNumProducers = "usage_num_producers"

	// GaugeUsageNumbDataSources tracks the number of unique data sources.
	// Labels = install_id
	GaugeUsageNumbDataSources = "usage_num_data_sources"

	// GaugeUsageRegistrationsTotal tracks the number of total registrations. Registrations should occur only on redeploy
	// If we are seeing constant re-registrations, it might mean that client is misconfigured/not instrumented correctly.
	// Labels = install_id, os=$os, sdk=$sdk_name, arch=$arch, version=$sdk_version
	GaugeUsageRegistrationsTotal = "usage_registrations_total"

	// GaugeUsageRegistrationsActive tracks the number of active registrations. Helps us determine how "active" a deployment
	// is at anytime. Ideally, this should only increase over time which indicates further adoption in the org.
	// Similarly, if active is at 0 but was >0 in the past (>24 hours), this might indicate that users ran into problems
	// and did not retry the platform.
	// Labels = install_id, os=$os, sdk=$sdk_name, arch=$arch, version=$sdk_version
	GaugeUsageRegistrationsActive = "usage_registrations_active"

	// GaugeUsageNumPipelines tracks the number of pipelines.
	// Labels = install_id, status=attached|detached
	GaugeUsageNumPipelines = "usage_num_pipelines"

	// GaugeUsageNumSteps tracks the number of steps a specific pipeline has
	// Labels = install_id, pipeline_id, step_type=detective|transform|kv|http, subtype=string_contains_any|replace_value|...
	GaugeUsageNumSteps = "usage_num_steps"

	// GaugeUsageThroughputEventsPerSecond tracks the rate in events/s for a particular deployment
	// Labels = install_id, op=producer|consumer
	GaugeUsageThroughputEventsPerSecond = "usage_throughput_events_per_second"

	// GaugeUsageThroughputBytesPerSecond tracks the rate in bytes/s for a particular deployment
	// Labels = install_id, op=producer|consumer
	GaugeUsageThroughputBytesPerSecond = "usage_throughput_bytes_per_second"

	// CounterErrorsTotal tracks any errors that occur in the server
	// Labels: install_id, type=soft|hard|panic, source=server, location=$code_location
	CounterErrorsTotal = "errors_total"
)
