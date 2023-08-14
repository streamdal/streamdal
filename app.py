import pprint
import time
import logging

import snitchpy
from snitchpy import (
    SnitchClient,
    SnitchConfig,
    ProcessRequest,
    MODE_CONSUMER,
)


def main():
    logging.basicConfig()
    print("starting")
    client = SnitchClient(
        cfg=SnitchConfig(
            service_name="snitchtest",
            dry_run=False,
            grpc_url="localhost",
            grpc_port=9090,
            grpc_token="1234",
        )
    )

    req = ProcessRequest(
        operation_type=MODE_CONSUMER,
        operation_name="opname",
        component_name="comname",
        data=b'{"object": {"field": true}}',
    )

    res = client.process(req)

    pprint.pprint(res)

    while not client.cfg.exit.is_set():
        print("waiting")
        time.sleep(1)

    print("done")


if __name__ == "__main__":
    main()
