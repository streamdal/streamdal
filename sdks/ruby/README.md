# Streamdal Ruby SDK
[![Release](https://github.com/streamdal/streamdal/actions/workflows/sdks-ruby-release.yml/badge.svg)](https://github.com/streamdal/streamdal/actions/workflows/sdks-ruby-release.yml)
[![Pull Request](https://github.com/streamdal/streamdal/actions/workflows/sdks-ruby-pr.yml/badge.svg)](https://github.com/streamdal/streamdal/blob/main/.github/workflows/sdks-ruby-pr.yml)
[![Discord](https://img.shields.io/badge/Community-Discord-4c57e8.svg)](https://discord.gg/streamdal)

_**Golang SDK for [Streamdal](https://streamdal.com).**_

<sub>For more details, see the main
[streamdal repo](https://github.com/streamdal/streamdal).</sub>

---

### Documentation

See https://docs.streamdal.com

### Installation

```bash
gem install streamdal
```

### Example Usage

```ruby
require 'streamdal'

# Create a new client
logger = Logger.new(STDOUT)
logger.level = Logger::INFO

client = Streamdal::Client.new({
                                 streamdal_url: "localhost:8082",
                                 streamdal_token:"<server-token>",
                                 service_name: "demo",
                                 log: logger,
                                 dry_run: false
                               })

# Define the audience
audience = Streamdal::Audience.new(Streamdal::OPERATION_TYPE_CONSUMER, "consume", "kafka-consumer")

while true
  sleep(1)
  resp = client.process('{"email": "someuser@streamdal.com"}', audience)
  puts "Response: "
  puts "-----------------------------------"
  puts resp.inspect.gsub(/\\n/, "\n")
  puts "-----------------------------------"
end
```

A demo application is available in the `demo` directory. To run the demo, execute the following commands:

```bash
rake setup
rake run
```

### Configuration

All configuration can be passed via `Streamdal::Config` struct. Some values can be set via environment variables in
order to support 12-Factor and usage of this SDK inside shims where `Streamdal::Config` cannot be set.

| Config Parameter | Environment Variable       | Description                                                                      | Default       |
|------------------|----------------------------|----------------------------------------------------------------------------------|---------------|
| streamdal_url    | STREAMDAL_URL              | URL pointing to your instance of streamdal server's gRPC API. Ex: localhost:8082 | *empty*       |
| streamdal_token  | STREAMDAL_TOKEN            | API token set in streamdal server                                                | *empty*       |
| service_name     | STREAMDAL_SERVICE_NAME     | Identifies this service in the streamdal console                                 | *empty*       |
| pipeline_timeout | STREAMDAL_PIPELINE_TIMEOUT | Maximum time a pipeline can run before giving up                                 | 100ms         |
| step_timeout     | STREAMDAL_STEP_TIMEOUT     | Maximum time a pipeline step can run before giving up                            | 10ms          |
| dry_run          | STREAMDAL_DRY_RUN          | If true, no data will be modified                                                | *false*       |
| log              |                            | An optional custom logger                                                        |               |
| client_type      |                            | 1 = CLIENT_TYPE_SDK, 2 = CLIENT_TYPE_SHIM                                        | ClientTypeSDK |

### Metrics

Metrics are published to Streamdal server and are available in Prometheus format at http://streamdal_server_url:8081/metrics

| Metric                                       | Description                                      | Labels                                                                        |
|----------------------------------------------|--------------------------------------------------|-------------------------------------------------------------------------------|
| `streamdal_counter_consume_bytes`     | Number of bytes consumed by the client     | `service`, `component_name`, `operation_name`, `pipeline_id`, `pipeline_name` |
| `streamdal_counter_consume_errors`    | Number of errors encountered while consuming payloads | `service`, `component_name`, `operation_name`, `pipeline_id`, `pipeline_name` |
| `streamdal_counter_consume_processed` | Number of payloads processed by the client | `service`, `component_name`, `operation_name`, `pipeline_id`, `pipeline_name` |
| `streamdal_counter_produce_bytes`     | Number of bytes produced by the client     | `service`, `component_name`, `operation_name`, `pipeline_id`, `pipeline_name` |
| `streamdal_counter_produce_errors`    | Number of errors encountered while producing payloads | `service`, `component_name`, `operation_name`, `pipeline_id`, `pipeline_name` |
| `streamdal_counter_produce_processed` | Number of payloads processed by the client | `service`, `component_name`, `operation_name`, `pipeline_id`, `pipeline_name` |
| `streamdal_counter_notify`            | Number of notifications sent to the server | `service`, `component_name`, `operation_name`, `pipeline_id`, `pipeline_name` |

## Release

Any push or merge to the `main` branch with any changes in `/sdks/ruby/*`
will automatically tag and release a new console version with `sdks/ruby/vX.Y.Z`.

<sub>(1) If you'd like to skip running the release action on push/merge to `main`,
include `norelease` anywhere in the commit message.</sub>