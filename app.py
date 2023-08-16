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
from snitch_protos import protos


def main():
    logging.basicConfig()
    print("starting")
    client = SnitchClient(
        cfg=SnitchConfig(
            service_name="snitchtest",
            dry_run=True,
            grpc_url="localhost",
            grpc_port=9090,
            grpc_token="1234",
            audiences=[
                protos.Audience(
                    service_name="snitchtest",
                    operation_name="opname",
                    component_name="comname",
                    operation_type=MODE_CONSUMER,
                )
            ],
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

    i = 0
    while not client.cfg.exit.is_set():
        if i % 2 == 0:
            req = ProcessRequest(
                operation_type=MODE_CONSUMER,
                operation_name="opname",
                component_name="comname",
                data=b'{"object": {"field": true}}',
            )
            res = client.process(req)

            print("processed message")

        # print("waiting")
        time.sleep(1)
        i += 1

    print("done")


if __name__ == "__main__":
    main()
