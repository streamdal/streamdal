# Snitch Go Client


[![Master build status](https://github.com/streamdal/snitch-go-client/workflows/main/badge.svg)](https://github.com/streamdal/snitch-go-client/actions/workflows/main-test.yml)
[![Test Coverage](https://api.codeclimate.com/v1/badges/7202de86dc937056673b/test_coverage)](https://codeclimate.com/github/streamdal/snitch-go-client/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/7202de86dc937056673b/maintainability)](https://codeclimate.com/github/streamdal/snitch-go-client/maintainability)


## Shim usage

Streamdal maintains forks of popular messaging libraries with this SDK already integrated into them. These shims
are designed to allow usage if this SDK with minimal changes to your existing codebase.

To use these shims, you can specify the following environment variables, which will be read by the SDK at runtime

| Envar                     | Required | Description                                                                                                                             | Default          |
|---------------------------|----------|-----------------------------------------------------------------------------------------------------------------------------------------|------------------|
| `SNITCH_URL`              | Yes      | URL to a running Snitch server instance in your infrastructure                                                                          | `localhost:9090` |
| `SNITCH_TOKEN`            | Yes      | Token to use when authenticating with the plumber server, configured via plumber server                                                 | `streamdal`      |
| `SNITCH_DRY_RUN`          | No       | `true` or `false`. Dry run mode will simply log the rules that would have been applied to the message, but will not actually apply them | `false`          |
| `SNITCH_STEP_TIMEOUT`     | No       | Timeout for wasm execution in milliseconds                                                                                              | `10`             |
| `SNITCH_PIPELINE_TIMEOUT` | No       | Timeout for entire pipeline execution in milliseconds                                                                                   | `100`            |
| `SNITCH_DATA_SOURCE`      | No       | Data source to use when applying rules. This is used to determine which rulesets to apply to the message.                               | `kafka`          |


### Example Usage

```go
package main

import (
	"context"
	"fmt"
	"time"

	"github.com/streamdal/snitch-go-client"
)

func main() {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	sc, err := snitch.New(&snitch.Config{
		SnitchURL:       "localhost:9090",
		SnitchToken:     "streadmal",
		StepTimeout:     time.Millisecond * 10,
		PipelineTimeout: time.Millisecond * 100,
		DryRun:          false,
		ServiceName:     "billing-svc",
		ShutdownCtx:     ctx,
	})
	if err != nil {
		panic(err)
	}

	resp, err := sc.Process(ctx, &snitch.ProcessRequest{
		OperationType: snitch.OperationTypeConsumer,
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

Metrics are published to snitch server and are available in Prometheus format at http://snitch_server_url:8080/v1/metrics

| Metric                                       | Description                                           | Labels                                                                        |
|----------------------------------------------|-------------------------------------------------------|-------------------------------------------------------------------------------|
| `streamdal_snitch_counter_consume_bytes`     | Number of bytes consumed by the snitch client         | `service`, `component_name`, `operation_name`, `pipeline_id`, `pipeline_name` |
| `streamdal_snitch_counter_consume_errors`    | Number of errors encountered while consuming payloads | `service`, `component_name`, `operation_name`, `pipeline_id`, `pipeline_name` |
| `streamdal_snitch_counter_consume_processed` | Number of payloads processed by the snitch client     | `service`, `component_name`, `operation_name`, `pipeline_id`, `pipeline_name` |
| `streamdal_snitch_counter_produce_bytes`     | Number of bytes produced by the snitch client         | `service`, `component_name`, `operation_name`, `pipeline_id`, `pipeline_name` |
| `streamdal_snitch_counter_produce_errors`    | Number of errors encountered while producing payloads | `service`, `component_name`, `operation_name`, `pipeline_id`, `pipeline_name` |
| `streamdal_snitch_counter_produce_processed` | Number of payloads processed by the snitch client     | `service`, `component_name`, `operation_name`, `pipeline_id`, `pipeline_name` |
| `streamdal_snitch_counter_notify`            | Number of notifications sent to the snitch server     | `service`, `component_name`, `operation_name`, `pipeline_id`, `pipeline_name` |


### WASM Benchmarks

***Up to date as of 2023-09-20***

All benchmarks include marshal/unmarshal of `WASMRequest` and `WASMResponse respectively`

*inferschema*

```bash
go test -bench=.

goos: darwin
goarch: arm64
pkg: github.com/streamdal/snitch-go-client
BenchmarkInferSchema_FreshSchema/small.json-8         	   16830	     72359 ns/op
BenchmarkInferSchema_FreshSchema/medium.json-8        	    2074	    574853 ns/op
BenchmarkInferSchema_FreshSchema/large.json-8         	     240	   5009645 ns/op
BenchmarkInferSchema_MatchExisting/small.json-8       	   12140	     99325 ns/op
BenchmarkInferSchema_MatchExisting/medium.json-8      	    2006	    597972 ns/op
BenchmarkInferSchema_MatchExisting/large.json-8       	     237	   5030887 ns/op
```

*transform*

```bash
```

*detective*

```bash
```

*transform*

```bash
```

*kv*

```bash
```