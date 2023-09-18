# snitchpy


[![Master build status](https://github.com/streamdal/snitch-python-client/actions/workflows/main.yml/badge.svg)](https://github.com/streamdal/snitch-python-client/actions/workflows/main.yml)
[![Test Coverage](https://api.codeclimate.com/v1/badges/056c5faddeefeed37fcb/test_coverage)](https://codeclimate.com/github/streamdal/snitch-python-client/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/056c5faddeefeed37fcb/maintainability)](https://codeclimate.com/github/streamdal/snitch-python-client/maintainability)

snitchpy is the python client SDK for Streamdal's open source Snitch server https://github.com/streamdal/snitch

### Documentation

See https://docs.snitch.build

### Installation
```
python -m pip install snitchpy
```

### Requirements

* [python](https://www.python.org/) >= 3.8


### Example Usage

```python
import pprint
from snitchpy import (MODE_CONSUMER, ProcessRequest, SnitchClient, SnitchConfig)

def main():
    client = SnitchClient(
        cfg=SnitchConfig(
            service_name="order-ingest",
            dry_run=True,
            snitch_url="snitch-server.dev.svc.cluster.local:9090",
            snitch_token="1234",
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

### License

MIT License

Copyright (c) 2023 Batch.sh Inc. D.B.A. Streamdal.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
