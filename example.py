import pprint
import logging
import time
import logging.config


from streamdal import (
    Audience,
    StreamdalClient,
    StreamdalConfig,
    ProcessRequest,
    MODE_CONSUMER,
)


def main():
    logging.basicConfig()
    client = StreamdalClient(
        cfg=StreamdalConfig(
            service_name="service",
            dry_run=True,
            streamdal_url="localhost:9090",
            streamdal_token="1234",
            audiences=[
                Audience(
                    operation_name="demo-operation",
                    component_name="kafka",
                    operation_type=MODE_CONSUMER,
                )
            ],
        )
    )

    # req = ProcessRequest(
    #     operation_type=MODE_CONSUMER,
    #     operation_name="opname",
    #     component_name="comname",
    #     data=b'{"object": {"field": true}}',
    # )
    #
    # res = client.process(req)
    #
    # pprint.pprint(res)

    while not client.cfg.exit.is_set():
        time.sleep(5)
        req = ProcessRequest(
            operation_type=MODE_CONSUMER,
            operation_name="demo-operation",
            component_name="kafka",
            data=b'{"object": {"field": true}}',
        )
        res = client.process(req)

        pprint.pprint(res)

    print("done")


if __name__ == "__main__":
    main()
