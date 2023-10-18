import {
  Audience,
  OperationType,
  Streamdal,
  StreamdalConfigs,
  StreamdalResponse,
} from "../../../src/streamdal.js";

const exampleData = {
  boolean_t: true,
  boolean_f: false,
  object: {
    ipv4_address: "127.0.0.1",
    ipv6_address: "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
    mac_address: "00-B0-D0-63-C2-26",
    uuid_dash: "550e8400-e29b-41d4-a716-446655440000",
    uuid_colon: "550e8400:e29b:41d4:a716:446655440000",
    uuid_stripped: "550e8400e29b41d4a716446655440000",
    number_as_string: "1234",
    field: "value",
    empty_string: "",
    null_field: null,
    empty_array: [],
  },
  array: ["value1", "value2"],
  number_int: 100,
  number_float: 100.1,
  timestamp_unix_str: "1614556800",
  timestamp_unix_num: 1614556800,
  timestamp_unix_nano_str: "1614556800000000000",
  timestamp_unix_nano_num: 1614556800000000000,
  timestamp_rfc3339: "2023-06-29T12:34:56Z",
};

const config: StreamdalConfigs = {
  streamdalUrl: "localhost:9090",
  streamdalToken: "1234",
  serviceName: "test-service-name",
  pipelineTimeout: "100",
  stepTimeout: "10",
  dryRun: false,
};

const audience: Audience = {
  serviceName: "test-service-name",
  componentName: "kafka",
  operationType: OperationType.CONSUMER,
  operationName: "test-kafka-consumer",
};

export const example = async () => {
  const streamdal = new Streamdal(config);
  const result: StreamdalResponse = await streamdal.processPipeline({
    audience,
    data: new TextEncoder().encode(JSON.stringify(exampleData)),
  });

  if (result.error) {
    console.error("Pipeline error", result.message);
    //
    // Optionally explore more detailed step status information
    console.dir(result.stepStatuses);
  } else {
    console.info("Pipeline success!");
    //
    // Process data, which may or may not have been altered depending on your pipeline
    // doStuff(result.data);
  }
};

void example();
