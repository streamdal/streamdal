# Streamdal Python SDK


[![Master build status](https://github.com/streamdal/python-sdk/actions/workflows/main.yml/badge.svg)](https://github.com/streamdal/python-sdk/actions/workflows/main.yml)
[![Test Coverage](https://api.codeclimate.com/v1/badges/75e54383c741bd7c1bca/test_coverage)](https://codeclimate.com/github/streamdal/python-sdk/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/75e54383c741bd7c1bca/maintainability)](https://codeclimate.com/github/streamdal/python-sdk/maintainability)
[![GitHub](https://img.shields.io/github/license/streamdal/python-sdk)](https://github.com/streamdal/python-sdk)

python-sdk is the python client SDK for Streamdal's open source observability server https://github.com/streamdal/server

### Documentation

See https://docs.streamdal.com

### Installation
```
python -m pip install streamdal
```

### Requirements

* [python](https://www.python.org/) >= 3.8


### Example Usage

```python
import pprint
from streamdal import (OPERATION_TYPE_CONSUMER, ProcessRequest, StreamdalClient, StreamdalConfig)

client = StreamdalClient(
    cfg=StreamdalConfig(
        service_name="order-ingest",
        streamdal_url="streamdal-server.svc.cluster.local:8082",
        streamdal_token="1234",
    )
)

res = client.process(
    ProcessRequest(
        operation_type=OPERATION_TYPE_CONSUMER,
        operation_name="new-order-topic",
        component_name="kafka",
        data=b'{"object": {"field": true}}',
    )
)

if res.error:
    print(res.error_message)
else:
    pprint.pprint(res.data)
```

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


### License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details
