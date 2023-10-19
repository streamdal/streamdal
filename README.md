# Streamdal Go SDK


[![Master build status](https://github.com/streamdal/go-sdk/workflows/main/badge.svg)](https://github.com/streamdal/go-sdk/actions/workflows/main-test.yml)
[![Test Coverage](https://api.codeclimate.com/v1/badges/7202de86dc937056673b/test_coverage)](https://codeclimate.com/github/streamdal/go-sdk/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/7202de86dc937056673b/maintainability)](https://codeclimate.com/github/streamdal/go-sdk/maintainability)


## Shim usage

Streamdal maintains forks of popular messaging libraries with this SDK already integrated into them. These shims
are designed to allow usage if this SDK with minimal changes to your existing codebase.

To use these shims, you can specify the following environment variables, which will be read by the SDK at runtime

| Envar                        | Required | Description                                                                                                                             | Default          |
|------------------------------|----------|-----------------------------------------------------------------------------------------------------------------------------------------|------------------|
| `STREAMDAL_URL`              | Yes      | URL to a running Streamdal server instance in your infrastructure                                                                       | `localhost:9090` |
| `STREAMDAL_TOKEN`            | Yes      | Token to use when authenticating with the plumber server, configured via plumber server                                                 | `streamdal`      |
| `STREAMDAL_DRY_RUN`          | No       | `true` or `false`. Dry run mode will simply log the rules that would have been applied to the message, but will not actually apply them | `false`          |
| `STREAMDAL_STEP_TIMEOUT`     | No       | Timeout for wasm execution in milliseconds                                                                                              | `10`             |
| `STREAMDAL_PIPELINE_TIMEOUT` | No       | Timeout for entire pipeline execution in milliseconds                                                                                   | `100`            |
| `STREAMDAL_DATA_SOURCE`      | No       | Data source to use when applying rules. This is used to determine which rulesets to apply to the message.                               | `kafka`          |


### Example Usage

```go
package main

import (
	"context"
	"fmt"
	"time"

	"github.com/streamdal/go-sdk"
)

func main() {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	sc, err := streamdal.New(&streamdal.Config{
		ServerURL:       "localhost:9090",
		ServerToken:     "streamdal",
		StepTimeout:     time.Millisecond * 10,
		PipelineTimeout: time.Millisecond * 100,
		DryRun:          false,
		ServiceName:     "billing-svc",
		ShutdownCtx:     ctx,
	})
	if err != nil {
		panic(err)
	}

	resp, err := sc.Process(ctx, &streamdal.ProcessRequest{
		OperationType: streamdal.OperationTypeConsumer,
		OperationName: "new-order-topic",
		ComponentName: "kafka",
		Data:          []byte(`{"object": {"field": true}}`),
	})
	if err != nil {
		panic(err)
	}

	fmt.Printf("%#v\n", resp)
}

```

### Metrics

Metrics are published to Streamdal server and are available in Prometheus format at http://streamdal_server_url:8080/v1/metrics

| Metric                                       | Description                                      | Labels                                                                        |
|----------------------------------------------|--------------------------------------------------|-------------------------------------------------------------------------------|
| `streamdal_counter_consume_bytes`     | Number of bytes consumed by the client     | `service`, `component_name`, `operation_name`, `pipeline_id`, `pipeline_name` |
| `streamdal_counter_consume_errors`    | Number of errors encountered while consuming payloads | `service`, `component_name`, `operation_name`, `pipeline_id`, `pipeline_name` |
| `streamdal_counter_consume_processed` | Number of payloads processed by the client | `service`, `component_name`, `operation_name`, `pipeline_id`, `pipeline_name` |
| `streamdal_counter_produce_bytes`     | Number of bytes produced by the client     | `service`, `component_name`, `operation_name`, `pipeline_id`, `pipeline_name` |
| `streamdal_counter_produce_errors`    | Number of errors encountered while producing payloads | `service`, `component_name`, `operation_name`, `pipeline_id`, `pipeline_name` |
| `streamdal_counter_produce_processed` | Number of payloads processed by the client | `service`, `component_name`, `operation_name`, `pipeline_id`, `pipeline_name` |
| `streamdal_counter_notify`            | Number of notifications sent to the server | `service`, `component_name`, `operation_name`, `pipeline_id`, `pipeline_name` |
