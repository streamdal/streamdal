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