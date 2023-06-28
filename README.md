# Data Rules SDK

---

[![Master build status](https://github.com/streamdal/snitch-go-client/workflows/master/badge.svg)](https://github.com/streamdal/snitch-go-client/actions/workflows/master-test.yaml)

## Shim usage

Streamdal maintains forks of popular messaging libraries with this SDK already integrated into them. These shims
are designed to allow usage if this SDK with minimal changes to your existing codebase.

To use these shims, you can specify the following environment variables, which will be read by the SDK at runtime

| Envar                 | Required | Description | Default |
|-----------------------| --- | --- |----|
| `PLUMBER_URL`         | Yes | URL to a running plumber server instance in your infrastructure | `localhost:9090` |
| `PLUMBER_TOKEN`       | No | Token to use when authenticating with the plumber server, configured via plumber server | `streamdal` |
| `SNITCH_DRY_RUN`      | No | `true` or `false`. Dry run mode will simply log the rules that would have been applied to the message, but will not actually apply them | `false` |
| `SNITCH_WASM_TIMEOUT` | No | Timeout for wasm execution in milliseconds | `1s` |

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

	"github.com/streamdal/snitch-go-client"
)

func main() {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	sc, err := snitch.New(&snitch.Config{
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

	modifiedData, err := sc.ApplyRules(ctx, snitch.Publish, "my-kafka-topic", []byte(`{"payload": {...}}`))
	if err != nil {
		if err == sc.ErrMessageDropped {
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


| Metric                             | Description                                                    | Labels                                                                |
|------------------------------------|----------------------------------------------------------------|-----------------------------------------------------------------------|
| `plumber_dataqual_pubish`          | Total number of messages published                             | `type` = "bytes" OR "count", `data_source` = "kafka", "rabbitmq" ,etc |
| `plumber_dataqual_consume`         | Total number of messages consumed                              | `type` = "bytes" OR "count", `data_source` = "kafka", "rabbitmq" ,etc |
| `plumber_dataqual_size_exceeded`   | Total number of messages ignored due to exceeding size limit   | `data_source` = "kafka", "rabbitmq" ,etc                              |
| `plumber_dataqual_rule`            | Number of events and bytes count for each rule ran             | `type` = "bytes" OR "count", `ruleset_id` = UUID, `rule_id` = UUID    |
| `plumber_dataqual_failure_trigger` | Number of events and bytes count that triggered a failure mode | `type` = "bytes" OR "count", `ruleset_id` = UUID, `rule_id` = UUID    |

The SDK ships metrics to Plumber which are then exposed via promethus endpoint at `http://<plumber>:9191/metrics`
