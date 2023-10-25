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

Metrics are published to Streamdal server and are available in Prometheus format at http://streamdal_server_url:8080/metrics

| Metric                                       | Description                                      | Labels                                                                        |
|----------------------------------------------|--------------------------------------------------|-------------------------------------------------------------------------------|
| `streamdal_counter_consume_bytes`     | Number of bytes consumed by the client     | `service`, `component_name`, `operation_name`, `pipeline_id`, `pipeline_name` |
| `streamdal_counter_consume_errors`    | Number of errors encountered while consuming payloads | `service`, `component_name`, `operation_name`, `pipeline_id`, `pipeline_name` |
| `streamdal_counter_consume_processed` | Number of payloads processed by the client | `service`, `component_name`, `operation_name`, `pipeline_id`, `pipeline_name` |
| `streamdal_counter_produce_bytes`     | Number of bytes produced by the client     | `service`, `component_name`, `operation_name`, `pipeline_id`, `pipeline_name` |
| `streamdal_counter_produce_errors`    | Number of errors encountered while producing payloads | `service`, `component_name`, `operation_name`, `pipeline_id`, `pipeline_name` |
| `streamdal_counter_produce_processed` | Number of payloads processed by the client | `service`, `component_name`, `operation_name`, `pipeline_id`, `pipeline_name` |
| `streamdal_counter_notify`            | Number of notifications sent to the server | `service`, `component_name`, `operation_name`, `pipeline_id`, `pipeline_name` |
