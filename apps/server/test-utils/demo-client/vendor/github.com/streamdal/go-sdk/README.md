# Streamdal Go SDK


[![Master build status](https://github.com/streamdal/go-sdk/workflows/main/badge.svg)](https://github.com/streamdal/go-sdk/actions/workflows/main-test.yml)
[![Test Coverage](https://api.codeclimate.com/v1/badges/7202de86dc937056673b/test_coverage)](https://codeclimate.com/github/streamdal/go-sdk/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/018c12aaebba74deb05e/maintainability)](https://codeclimate.com/github/streamdal/go-sdk/maintainability)
[![Go Report Card](https://goreportcard.com/badge/github.com/streamdal/go-sdk)](https://goreportcard.com/report/github.com/streamdal/go-sdk)
[![GitHub](https://img.shields.io/github/license/streamdal/go-sdk)](https://github.com/streamdal/go-sdk)

### Documentation

See https://docs.streamdal.com

### Installation

```bash
go get github.com/streamdal/go-sdk
```

### Example Usage

```go
package main

import (
	"context"
	"fmt"

	"github.com/streamdal/go-sdk"
)

func main() {
	sc, _ := streamdal.New(&streamdal.Config{
		ServerURL:       "streamdal-server.svc.cluster.local:8082",
		ServerToken:     "1234",
		ServiceName:     "billing-svc",
		ShutdownCtx:     context.Background(),
	})
	
	resp := sc.Process(context.Background(), &streamdal.ProcessRequest{
		OperationType: streamdal.OperationTypeConsumer,
		OperationName: "new-order-topic",
		ComponentName: "kafka",
		Data:          []byte(`{"object": {"field": true}}`),
	})

	if resp.Error != nil {
		fmt.Println(resp.ErrorMessage)
		return
    }
	
	println(string(resp.Data))
}

```

### Configuration

All configuration can be passed via `streamdal.Config{}`. Some values can be set via environment variables in 
order to support 12-Factor and usage of this SDK inside shims where `streamdal.Config{}` cannot be set.

| Config Parameter | Environment Variable       | Description                                                                      | Default       |
|------------------|----------------------------|----------------------------------------------------------------------------------|---------------|
| ServerURL        | STREAMDAL_URL              | URL pointing to your instance of streamdal server's gRPC API. Ex: localhost:8082 | *empty*       |
| ServerToken      | STREAMDAL_TOKEN            | API token set in streamdal server                                                | *empty*       |
| ServiceName      | STREAMDAL_SERVICE_NAME     | Identifies this service in the streamdal console                                 | *empty*       |
| PipelineTimeout  | STREAMDAL_PIPELINE_TIMEOUT | Maximum time a pipeline can run before giving up                                 | 100ms         |
| StepTimeout      | STREAMDAL_STEP_TIMEOUT     | Maximum time a pipeline step can run before giving up                            | 10ms          |
| DryRun           | STREAMDAL_DRY_RUN          | If true, no data will be modified                                                | *false*       |
| Logger           |                            | An optional custom logger                                                        |               |
| ClientType       |                            | 1 = ClientTypeSDK, 2 = ClientTypeShim                                            | ClientTypeSDK |
| ShutdownCtx      | -                          | Your application's main context which will receive shutdown signals              |               |

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
