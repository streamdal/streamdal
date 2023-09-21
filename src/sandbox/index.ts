import { Audience } from "@streamdal/snitch-protos/protos/sp_common";

import { OperationType, Snitch, SnitchConfigs } from "../snitch.js";

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

const serviceAConfig: SnitchConfigs = {
  snitchUrl: "localhost:9091",
  snitchToken: "1234",
  serviceName: "test-service",
  pipelineTimeout: "100",
  stepTimeout: "10",
  dryRun: false,
};

const serviceBConfig: SnitchConfigs = {
  snitchUrl: "localhost:9091",
  snitchToken: "1234",
  serviceName: "another-test-service",
  pipelineTimeout: "100",
  stepTimeout: "10",
  dryRun: false,
};

const serviceCConfig: SnitchConfigs = {
  snitchUrl: "localhost:9091",
  snitchToken: "1234",
  serviceName: "third-service",
  pipelineTimeout: "100",
  stepTimeout: "10",
  dryRun: false,
};

const audienceAConsumer: Audience = {
  serviceName: "test-service",
  componentName: "kafka",
  operationType: OperationType.CONSUMER,
  operationName: "kafka-consumer",
};

const audienceAProducer: Audience = {
  serviceName: "test-service",
  componentName: "kafka",
  operationType: OperationType.PRODUCER,
  operationName: "kafka-producer",
};

const audienceBConsumer: Audience = {
  serviceName: "another-test-service",
  componentName: "another-kafka",
  operationType: OperationType.CONSUMER,
  operationName: "test-kafka-consumer",
};

const audienceBProducer: Audience = {
  serviceName: "another-test-service",
  componentName: "another-kafka",
  operationType: OperationType.PRODUCER,
  operationName: "test-kafka-producer",
};

const audienceCConsumer: Audience = {
  serviceName: "third-service",
  componentName: "third-kafka",
  operationType: OperationType.CONSUMER,
  operationName: "kafka-consumer",
};

const audienceCProducer: Audience = {
  serviceName: "third-service",
  componentName: "third-kafka",
  operationType: OperationType.PRODUCER,
  operationName: "kafka-consumer",
};

const logTest = async (snitch: any, audience: Audience, input: any) => {
  console.log("--------------------------------");
  console.log(new Date());
  console.log(
    `sending pipeline request for ${audience.serviceName} - ${OperationType[
      audience.operationType
    ].toLowerCase()}`
  );
  const { error, message, data } = await snitch.processPipeline({
    audience: audience,
    data: new TextEncoder().encode(JSON.stringify(input)),
  });
  console.log("error", error);
  console.log("message", message);
  console.log("data:");
  console.dir(JSON.parse(new TextDecoder().decode(data)), { depth: 20 });
  console.log("pipeline request done");
  console.log("--------------------------------");
  console.log("\n");
};

// eslint-disable-next-line @typescript-eslint/require-await
export const exampleStaggered = async () => {
  const snitchA = new Snitch(serviceAConfig);
  const snitchB = new Snitch(serviceBConfig);

  setInterval(() => {
    void logTest(snitchA, audienceAConsumer, exampleData);
  }, 2000);

  setTimeout(() => {
    void logTest(snitchA, audienceAProducer, exampleData);
  }, 4000);

  setTimeout(() => {
    void logTest(snitchB, audienceBConsumer, exampleData);
  }, 8000);

  setTimeout(() => {
    void logTest(snitchB, audienceBProducer, exampleData);
  }, 12000);
};

// eslint-disable-next-line @typescript-eslint/require-await
export const tailFriendly = async () => {
  const snitchB = new Snitch(serviceBConfig);

  setInterval(() => {
    void logTest(snitchB, audienceBConsumer, exampleData);
  }, 1000);
};

// eslint-disable-next-line @typescript-eslint/require-await
export const tailFast = async () => {
  const snitchB = new Snitch(serviceBConfig);

  setInterval(() => {
    void logTest(snitchB, audienceBConsumer, exampleData);
  }, 100);
};

// eslint-disable-next-line @typescript-eslint/require-await
export const exampleConcurrent = async () => {
  const snitchA = new Snitch(serviceAConfig);
  const snitchB = new Snitch(serviceBConfig);
  setInterval(() => {
    void logTest(snitchA, audienceAConsumer, exampleData);
  }, 4000);

  void logTest(snitchA, audienceAProducer, exampleData);
  void logTest(snitchB, audienceBConsumer, exampleData);
  void logTest(snitchB, audienceBProducer, exampleData);
};

// eslint-disable-next-line @typescript-eslint/require-await
export const exampleMultipleGroup = async () => {
  const snitchA = new Snitch(serviceAConfig);
  const snitchB = new Snitch(serviceBConfig);

  void logTest(snitchA, audienceAConsumer, exampleData);
  void logTest(
    snitchA,
    { ...audienceAConsumer, operationName: "kafka-consumer-two" },
    exampleData
  );
  void logTest(snitchA, audienceAProducer, exampleData);
  void logTest(snitchB, audienceBConsumer, exampleData);
  void logTest(snitchB, audienceBProducer, exampleData);
  void logTest(
    snitchB,
    { ...audienceBProducer, operationName: "kafka-producer-two" },
    exampleData
  );
};

// eslint-disable-next-line @typescript-eslint/require-await
export const exampleMultipleComponentsPerService = async () => {
  const snitchA = new Snitch(serviceAConfig);
  const snitchB = new Snitch(serviceBConfig);

  void logTest(snitchA, audienceAConsumer, exampleData);
  void logTest(
    snitchA,
    { ...audienceAConsumer, componentName: "another-kafka" },
    exampleData
  );
  void logTest(snitchA, audienceAProducer, exampleData);
  void logTest(snitchB, audienceBConsumer, exampleData);
  void logTest(snitchB, audienceBProducer, exampleData);
  void logTest(
    snitchB,
    { ...audienceBProducer, componentName: "kafka" },
    exampleData
  );
};

export const exampleStaggeredMultipleComponentsPerServiceAndPerGroup =
  // eslint-disable-next-line @typescript-eslint/require-await
  async () => {
    const snitchA = new Snitch(serviceAConfig);
    const snitchB = new Snitch(serviceBConfig);
    const snitchC = new Snitch(serviceCConfig);

    setInterval(() => {
      void logTest(snitchA, audienceAConsumer, exampleData);
    }, 2000);

    setInterval(() => {
      void logTest(
        snitchA,
        { ...audienceAConsumer, operationName: "kafka-consumer-two" },
        exampleData
      );
    }, 4000);

    setInterval(() => {
      void logTest(
        snitchA,
        { ...audienceAConsumer, operationName: "kafka-consumer-three" },
        exampleData
      );
    }, 6000);

    setInterval(() => {
      void logTest(
        snitchA,
        { ...audienceAConsumer, componentName: "another-kafka" },
        exampleData
      );
    }, 8000);

    setInterval(() => {
      void logTest(snitchA, audienceAProducer, exampleData);
    }, 10000);

    setInterval(() => {
      void logTest(snitchB, audienceBConsumer, exampleData);
    }, 12000);

    setInterval(() => {
      void logTest(snitchB, audienceBProducer, exampleData);
    }, 14000);

    setInterval(() => {
      void logTest(
        snitchB,
        { ...audienceBProducer, componentName: "kafka" },
        exampleData
      );
    }, 16000);

    setInterval(() => {
      void logTest(snitchC, audienceCConsumer, exampleData);
    }, 2000);

    setInterval(() => {
      void logTest(snitchC, audienceCProducer, exampleData);
    }, 2000);
  };

void exampleStaggered();
