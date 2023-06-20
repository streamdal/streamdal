# Data Rules SDK

---

[![Master build status](https://github.com/streamdal/dataqual/workflows/master/badge.svg)](https://github.com/streamdal/dataqual/actions/workflows/master-test.yaml)

## Shim usage

Streamdal maintains forks of popular messaging libraries with this SDK already integrated into them. These shims
are designed to allow usage if this SDK with minimal changes to your existing codebase.

To use these shims, you can specify the following environment variables, which will be read by the SDK at runtime

| Envar | Required | Description | Default |
| --- | --- | --- |----|
| `PLUMBER_URL` | Yes | URL to a running plumber server instance in your infrastructure | `localhost:9090` |
| `PLUMBER_TOKEN` | No | Token to use when authenticating with the plumber server, configured via plumber server | `streamdal` |
| `DATAQUAL_DRY_RUN` | No | `true` or `false`. Dry run mode will simply log the rules that would have been applied to the message, but will not actually apply them | `false` |
| `DATAQUAL_WASM_TIMEOUT` | No | Timeout for wasm execution in milliseconds | `1s` |

When using these shims, message rules which cause a message to be dropped during publish or consumption will return
the error `dataqual.ErrMessageDropped`. This should be handled by your code if necessary.

### Golang Shims

* Kafka
  * `segmentio/kafka-go`: https://github.com/streamdal/segmentio-kafka-go
  * `Shopify/sarama`: https://github.com/streamdal/shopify-sarama


* RabbitMQ
  * `streadway/amqp`: https://github.com/streamdal/rabbitmq-amqp091-go
  * `rabbitmq/amqp091-go`: https://github.com/streamdal/rabbitmq-amqp091-go


### Direct library usage

```go
package main

import (
	"context"
	"time"

	"github.com/streamdal/dataqual"
)

func main() {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	dq, err := dataqual.New(&dataqual.Config{
		PlumberURL:   "localhost:9090",
		PlumberToken: "streadmal",
		WasmTimeout:  time.Millisecond * 200,
		DryRun:       false,
		DataSource:   "kafka",
		ShutdownCtx:  ctx,
	})
	if err != nil {
		panic(err)
	}

	modifiedData, err := dq.ApplyRules(ctx, dataqual.Publish, "my-kafka-topic", []byte(`{"payload": {...}}`))
	if err != nil {
		if err == dataqual.ErrMessageDropped {
			// message was dropped, perform some logging
		} else {
			panic(err)
		}
	}

	// Publish message to Kafka here
	// ...
}
```

### Metrics

The SDK ships metrics to Plumber which are then exposed via promethus endpoint at `http://<plumber>:9191/metrics`

| Metric                                   | Description                                                                                  |
|------------------------------------------|----------------------------------------------------------------------------------------------|
| `dataqual_rule_failure_count_<RULE_ID>`  | Total number of times a rule triggered a failure mode                                        |
| `dataqual_rule_failure_bytes_<RULE_ID>`  | Total number of bytes a rule triggered a failure mode                                        |
| `dataqual_publish_kafka_events`          | Total number of kafka events processed by the SDK                                            |
| `dataqual_publish_kafka_bytes`           | Total number of bytes processed by the SDK                                                   |
| `dataqual_consume_kafka_events`          | Total number of kafka events consumed by the SDK                                             |
| `dataqual_consume_kafka_bytes`           | Total number of kafka bytes consumed by the SDK                                              |
| `dataqual_publish_rabbitmq_events`       | Total number of rabbitmq events processed by the SDK                                         |
| `dataqual_publish_rabbitmq_bytes`        | Total number of rabbitmq bytes processed by the SDK                                          |
| `dataqual_consume_rabbitmq_events`       | Total number of rabbitmq events consumed by the SDK                                          |
| `dataqual_consume_rabbitmq_bytes`        | Total number of rabbitmq bytes consumed by the SDK                                           |
| `dataqual_publish_kafka_size_exceeded`   | Total number of published kafka events ignored due to size exceeding the event size limit    |
| `dataqual_consume_kafka_size_exceeded`   | Total number of consumed kafka events ignored due to size exceeding the event size limit     |
| `dataqual_publish_rabbitmq_size_exceeded` | Total number of published rabbitmq events ignored due to size exceeding the event size limit |
| `dataqual_consume_rabbitmq_size_exceeded` | Total number of consumed rabbitmq ignored due to size exceeding the event size limit         |