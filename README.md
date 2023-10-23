# Streamdal Python SDK


[![Master build status](https://github.com/streamdal/python-sdk/actions/workflows/main.yml/badge.svg)](https://github.com/streamdal/python-sdk/actions/workflows/main.yml)
[![Test Coverage](https://api.codeclimate.com/v1/badges/056c5faddeefeed37fcb/test_coverage)](https://codeclimate.com/github/streamdal/python-sdk/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/056c5faddeefeed37fcb/maintainability)](https://codeclimate.com/github/streamdal/python-sdk/maintainability)

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
from streamdal import (MODE_CONSUMER, ProcessRequest, StreamdalClient, StreamdalConfig)


def main():
    client = StreamdalClient(
        cfg=StreamdalConfig(
            service_name="order-ingest",
            dry_run=True,
            streamdal_url="streamdal-server.dev.svc.cluster.local:9090",
            streamdal_token="1234",
        )
    )

    res = client.process(
        ProcessRequest(
            operation_type=MODE_CONSUMER,
            operation_name="new-order-topic",
            component_name="kafka",
            data=b'{"object": {"field": true}}',
        )
    )

    pprint.pprint(res)


if __name__ == "__main__":
    main()
```
