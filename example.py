import pprint
import logging

from snitchpy import (
    Audience,
    SnitchClient,
    SnitchConfig,
    ProcessRequest,
    MODE_CONSUMER,
)


def main():
    logging.basicConfig()
    client = SnitchClient(
        cfg=SnitchConfig(
            service_name="snitchtest",
            dry_run=True,
            snitch_url="snitch-server.dev.svc.cluster.local:9090",
            snitch_token="1234",
            audiences=[
                Audience(
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

    # while not client.cfg.exit.is_set():
    #     time.sleep(2)
    #     req = ProcessRequest(
    #         operation_type=MODE_CONSUMER,
    #         operation_name="opname",
    #         component_name="comname",
    #         data=b'{"object": {"field": true}}',
    #     )
    #     res = client.process(req)
    #
    #     pprint.pprint(res)

    print("done")


if __name__ == "__main__":
    main()
