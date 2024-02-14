Streamdal Python SDK
====================
[![Release](https://github.com/streamdal/streamdal/actions/workflows/sdks-python-release.yml/badge.svg)](https://github.com/streamdal/streamdal/actions/workflows/sdks-python-release.yml)
[![Pull Request](https://github.com/streamdal/streamdal/actions/workflows/sdks-python-pr.yml/badge.svg)](https://github.com/streamdal/streamdal/blob/main/.github/workflows/sdks-python-pr.yml)
[![Discord](https://img.shields.io/badge/Community-Discord-4c57e8.svg)](https://discord.gg/streamdal)

<!-- TODO: UPDATE CODECLIMATE LINKS -->
<!-- [![Test Coverage](https://api.codeclimate.com/v1/badges/75e54383c741bd7c1bca/test_coverage)](https://codeclimate.com/github/streamdal/python-sdk/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/75e54383c741bd7c1bca/maintainability)](https://codeclimate.com/github/streamdal/python-sdk/maintainability) -->

_**Python SDK for [Streamdal](https://streamdal.com).**_

<sub>For more details, see the main
[streamdal repo](https://github.com/streamdal/streamdal).</sub>

---

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
import json
from streamdal import (OPERATION_TYPE_CONSUMER, ProcessRequest, StreamdalClient, StreamdalConfig, EXEC_STATUS_TRUE)

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
        data=b'{"object": {"email": "user@streamdal.com"}}',
    )
)

# Check that process() completed successfully
if res.status == EXEC_STATUS_TRUE:
    print("Success processed payload")
    data = json.loads(res.data)
    print("Response:", json.dumps(data, indent=2))
else:
    print("Failed to process payload")
    print("Error:", res.status_message)
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

## Release

Any push or merge to the `main` branch with any changes in `/sdks/python/*`
will automatically tag and release a new console version with `sdks/python/vX.Y.Z`.

<sub>(1) If you'd like to skip running the release action on push/merge to `main`,
include `norelease` anywhere in the commit message.</sub>
