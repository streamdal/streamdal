// eslint-disable-next-line @typescript-eslint/no-var-requires
const { ExecStatus, OperationType, Streamdal } = require("@streamdal/node-sdk");

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

const config = {
  streamdalUrl: "localhost:8082",
  streamdalToken: "1234",
  serviceName: "test-service-name",
  pipelineTimeout: "100",
  stepTimeout: "10",
  dryRun: false,
  quiet: true,
};

const audience = {
  serviceName: "test-service-name",
  componentName: "kafka",
  operationType: OperationType.CONSUMER,
  operationName: "test-kafka-consumer",
};

const streamdal = new Streamdal(config);

export const example = async () => {
  const result = await streamdal.process({
    audience,
    data: new TextEncoder().encode(JSON.stringify(exampleData)),
  });

  if (result.status === ExecStatus.ERROR) {
    console.error("Pipeline error", result.statusMessage);
    //
    // Optionally explore more detailed step status information
    console.dir(result.pipelineStatus);
  } else {
    console.info("Pipeline success!");
    //
    // Process data, which may or may not have been altered depending on your pipeline
    // doStuff(result.data);
  }
};

void example();
