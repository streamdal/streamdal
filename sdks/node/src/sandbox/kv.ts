import { Audience } from "@streamdal/protos/protos/sp_common";

import {
  ExecStatus,
  OperationType,
  registerStreamdal,
  StreamdalConfigs,
} from "../streamdal.js";
import { loadData } from "./billing.js";

const serviceKVConfig: StreamdalConfigs = {
  streamdalUrl: "localhost:8082",
  streamdalToken: "1234",
  serviceName: "kv-service",
  pipelineTimeout: "100",
  stepTimeout: "10",
  dryRun: false,
};

const KVProducer: Audience = {
  serviceName: "kv-service",
  componentName: "postgresql",
  operationType: OperationType.PRODUCER,
  operationName: "import",
};

/**
 * 1. run this
 * 2. go to the console, create a pipeline with a "Key/Value" step type,
 *    choose type "Exists", mode "Dynamic", and use "event_id" for key.
 * 3. Add the following key via the server rest api:
 *
 *    curl --header "Content-Type: application/json" \
 *      -H "Authorization: Bearer 1234" \
 *      --request POST \
 *      --data '{"kvs": [{"key": "eaab67a7-f8af-48b9-b65f-1f0f15de9956","value": "eaab67a7-f8af-48b9-b65f-1f0f15de9956"}]}' \
 *      "http://localhost:8081/api/v1/kv"
 */
export const kvExample = async () => {
  const kvService = await registerStreamdal(serviceKVConfig);
  const kvData = loadData("./src/sandbox/assets/sample-welcome-producer.json");
  const key0 = kvData[0];
  const key1 = kvData[1];

  //
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  setInterval(async () => {
    const result = await kvService.process({
      audience: KVProducer,
      data: new TextEncoder().encode(JSON.stringify(key0)),
    });

    //
    // Key exists, this will result in a pipeline step running without error
    // if this is part of multi-step or multi-pipeline you will need to inspect pipelineStatus
    console.debug(
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      `key ${key0.event_id} exists:`,
      result.status === ExecStatus.TRUE
    );
  }, 1000);

  //
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  setInterval(async () => {
    const result = await kvService.process({
      audience: KVProducer,
      data: new TextEncoder().encode(JSON.stringify(key1)),
    });

    //
    // Key does not exist, this will result in an error
    // if this is part of multi-step or multi-pipeline you will need to inspect pipelineStatus
    console.debug(
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      `key ${key1.event_id} exists:`,
      result.status === ExecStatus.FALSE
    );
  }, 1000);
};
