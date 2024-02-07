import logging
import json
import time
import logging.config

from streamdal import (
    Audience,
    StreamdalClient,
    StreamdalConfig,
    ProcessRequest,
    OPERATION_TYPE_CONSUMER,
    EXEC_STATUS_TRUE,
)


def main():
    logging.basicConfig()
    client = StreamdalClient(
        cfg=StreamdalConfig(
            service_name="service",
            dry_run=False,
            streamdal_url="localhost:8082",
            streamdal_token="1234",
            audiences=[
                Audience(
                    operation_name="demo-operation",
                    component_name="kafka",
                    operation_type=OPERATION_TYPE_CONSUMER,
                )
            ],
        )
    )

    while not client.cfg.exit.is_set():
        time.sleep(5)
        req = ProcessRequest(
            operation_type=OPERATION_TYPE_CONSUMER,
            operation_name="demo-operation",
            component_name="kafka",
            data=b'{"object": {"email": "mark@streamdal.com"}}',
        )
        res = client.process(req)

        # Check that process() completed successfully
        if res.status == EXEC_STATUS_TRUE:
            print("Success processed payload")
            data = json.loads(res.data)
            print("Response:", json.dumps(data, indent=2))
        else:
            print("Failed to process payload")
            print("Error:", res.status_message)

    print("done")


if __name__ == "__main__":
    main()
