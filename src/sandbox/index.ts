import { Audience } from "@streamdal/protos/protos/sp_common";

import { OperationType, Streamdal, StreamdalConfigs } from "../streamdal.js";

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

const serviceAConfig: StreamdalConfigs = {
  streamdalUrl: "localhost:9090",
  streamdalToken: "1234",
  serviceName: "test-service",
  pipelineTimeout: "100",
  stepTimeout: "10",
  dryRun: false,
};

const serviceBConfig: StreamdalConfigs = {
  streamdalUrl: "localhost:9090",
  streamdalToken: "1234",
  serviceName: "another-test-service",
  pipelineTimeout: "100",
  stepTimeout: "10",
  dryRun: false,
};

const serviceCConfig: StreamdalConfigs = {
  streamdalUrl: "localhost:9090",
  streamdalToken: "1234",
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

const logTest = async (streamdal: any, audience: Audience, input: any) => {
  console.log("--------------------------------");
  console.log(new Date());
  console.log(
    `sending pipeline request for ${audience.serviceName} - ${OperationType[
      audience.operationType
    ].toLowerCase()}`
  );
  const { error, message, data } = await streamdal.processPipeline({
    audience: audience,
    data: new TextEncoder().encode(JSON.stringify(input)),
  });
  console.log("error", error);
  console.log("message", message);
  console.log("data:");
  try {
    data && data.length > 0
      ? console.dir(JSON.parse(new TextDecoder().decode(data)), { depth: 20 })
      : console.log("no data returned");
  } catch (e) {
    console.error("could not parse data", e);
  }
  console.log("pipeline request done");
  console.log("--------------------------------");
  console.log("\n");
};

const randomInterval = async (
  streamdal: any,
  audience: Audience,
  input: any
) => {
  console.log("--------------------------------");
  console.log(new Date());
  console.log(
    `sending pipeline request for ${audience.serviceName} - ${OperationType[
      audience.operationType
    ].toLowerCase()}`
  );
  const { error, message, data } = await streamdal.processPipeline({
    audience: audience,
    data: new TextEncoder().encode(JSON.stringify(input)),
  });
  console.log("error", error);
  console.log("message", message);
  console.log("data:");
  try {
    data && data.length > 0
      ? console.dir(JSON.parse(new TextDecoder().decode(data)), { depth: 20 })
      : console.log("no data returned");
  } catch (e) {
    console.error("could not parse data", e);
  }
  console.log("pipeline request done");
  console.log("--------------------------------");
  console.log("\n");
  setTimeout(
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    () => randomInterval(streamdal, audience, input),
    Math.floor(Math.random() * (3000 - 250) + 3000)
  );
};

// eslint-disable-next-line @typescript-eslint/require-await
export const exampleStaggered = async () => {
  const streamdalA = new Streamdal(serviceAConfig);
  const streamdalB = new Streamdal(serviceBConfig);

  setInterval(() => {
    void randomInterval(streamdalA, audienceAConsumer, exampleData);
  }, 2000);

  setTimeout(() => {
    void logTest(streamdalA, audienceAProducer, exampleData);
  }, 4000);

  setTimeout(() => {
    void logTest(streamdalB, audienceBConsumer, exampleData);
  }, 8000);

  setTimeout(() => {
    void logTest(streamdalB, audienceBProducer, exampleData);
  }, 12000);
};

// eslint-disable-next-line @typescript-eslint/require-await
export const tailFriendly = async () => {
  const streamdalA = new Streamdal(serviceAConfig);
  const streamdalB = new Streamdal(serviceBConfig);

  void logTest(streamdalA, audienceAConsumer, exampleData);

  void logTest(
    streamdalA,
    { ...audienceAConsumer, operationName: "kafka-consumer-two" },
    exampleData
  );

  void logTest(
    streamdalA,
    { ...audienceAConsumer, operationName: "kafka-consumer-three" },
    exampleData
  );

  void logTest(
    streamdalA,
    { ...audienceAConsumer, componentName: "another-kafka" },
    exampleData
  );

  void logTest(streamdalA, audienceAProducer, exampleData);

  setInterval(() => {
    void logTest(streamdalB, audienceBConsumer, exampleData);
  }, 1000);

  void logTest(streamdalB, audienceBProducer, exampleData);

  void logTest(
    streamdalB,
    { ...audienceBProducer, componentName: "kafka" },
    exampleData
  );
};

// eslint-disable-next-line @typescript-eslint/require-await
export const highVolumeTail = async () => {
  const streamdalA = new Streamdal(serviceAConfig);
  const streamdalB = new Streamdal(serviceBConfig);

  setInterval(() => {
    void logTest(streamdalA, audienceAConsumer, exampleData);
  }, 500);

  setInterval(() => {
    void logTest(
      streamdalA,
      { ...audienceAConsumer, operationName: "kafka-consumer-two" },
      exampleData
    );
  }, 500);

  setInterval(() => {
    void logTest(
      streamdalA,
      { ...audienceAConsumer, operationName: "kafka-consumer-three" },
      exampleData
    );
  }, 1000);

  setInterval(() => {
    void logTest(
      streamdalA,
      { ...audienceAConsumer, componentName: "another-kafka" },
      exampleData
    );
  }, 500);

  void logTest(
    streamdalA,
    { ...audienceAConsumer, componentName: "another-kafka" },
    exampleData
  );

  setInterval(() => {
    void logTest(streamdalA, audienceAProducer, exampleData);
  }, 2000);

  setInterval(() => {
    void logTest(streamdalB, audienceBConsumer, exampleData);
  }, 250);

  setInterval(() => {
    void logTest(streamdalB, audienceBProducer, exampleData);
  }, 500);

  setInterval(() => {
    void logTest(
      streamdalB,
      { ...audienceBProducer, componentName: "kafka" },
      exampleData
    );
  }, 500);
};

// eslint-disable-next-line @typescript-eslint/require-await
export const throughputFriendly = async () => {
  const streamdalA = new Streamdal(serviceAConfig);
  const streamdalB = new Streamdal(serviceBConfig);

  void randomInterval(streamdalA, audienceAConsumer, exampleData);

  void randomInterval(
    streamdalA,
    { ...audienceAConsumer, operationName: "kafka-consumer-two" },
    exampleData
  );

  void randomInterval(
    streamdalA,
    { ...audienceAConsumer, operationName: "kafka-consumer-three" },
    exampleData
  );

  void randomInterval(
    streamdalA,
    { ...audienceAConsumer, componentName: "another-kafka" },
    exampleData
  );

  void randomInterval(streamdalA, audienceAProducer, exampleData);

  void randomInterval(streamdalB, audienceBConsumer, exampleData);

  void randomInterval(streamdalB, audienceBProducer, exampleData);

  void randomInterval(
    streamdalB,
    { ...audienceBProducer, componentName: "kafka" },
    exampleData
  );
};

// eslint-disable-next-line @typescript-eslint/require-await
export const tailFast = async () => {
  const streamdalB = new Streamdal(serviceBConfig);

  setInterval(() => {
    void logTest(streamdalB, audienceBConsumer, exampleData);
  }, 100);
};

// eslint-disable-next-line @typescript-eslint/require-await
export const exampleConcurrent = async () => {
  const streamdalA = new Streamdal(serviceAConfig);
  const streamdalB = new Streamdal(serviceBConfig);
  setInterval(() => {
    void logTest(streamdalA, audienceAConsumer, exampleData);
  }, 4000);

  void logTest(streamdalA, audienceAProducer, exampleData);
  void logTest(streamdalB, audienceBConsumer, exampleData);
  void logTest(streamdalB, audienceBProducer, exampleData);
};

// eslint-disable-next-line @typescript-eslint/require-await
export const exampleMultipleGroup = async () => {
  const streamdalA = new Streamdal(serviceAConfig);
  const streamdalB = new Streamdal(serviceBConfig);

  void logTest(streamdalA, audienceAConsumer, exampleData);
  void logTest(
    streamdalA,
    { ...audienceAConsumer, operationName: "kafka-consumer-two" },
    exampleData
  );
  void logTest(streamdalA, audienceAProducer, exampleData);
  void logTest(streamdalB, audienceBConsumer, exampleData);
  void logTest(streamdalB, audienceBProducer, exampleData);
  void logTest(
    streamdalB,
    { ...audienceBProducer, operationName: "kafka-producer-two" },
    exampleData
  );
};

// eslint-disable-next-line @typescript-eslint/require-await
export const exampleMultipleComponentsPerService = async () => {
  const streamdalA = new Streamdal(serviceAConfig);
  const streamdalB = new Streamdal(serviceBConfig);

  void logTest(streamdalA, audienceAConsumer, exampleData);
  void logTest(
    streamdalA,
    { ...audienceAConsumer, componentName: "another-kafka" },
    exampleData
  );
  void logTest(streamdalA, audienceAProducer, exampleData);
  void logTest(streamdalB, audienceBConsumer, exampleData);
  void logTest(streamdalB, audienceBProducer, exampleData);
  void logTest(
    streamdalB,
    { ...audienceBProducer, componentName: "kafka" },
    exampleData
  );
};

// eslint-disable-next-line @typescript-eslint/require-await
export const exampleSimple = async () => {
  const streamdalA = new Streamdal(serviceAConfig);
  void logTest(streamdalA, audienceAConsumer, exampleData);
};

export const exampleStaggeredMultipleComponentsPerServiceAndPerGroup =
  // eslint-disable-next-line @typescript-eslint/require-await
  async () => {
    const streamdalA = new Streamdal(serviceAConfig);
    const streamdalB = new Streamdal(serviceBConfig);
    const streamdalC = new Streamdal(serviceCConfig);

    setInterval(() => {
      void logTest(streamdalA, audienceAConsumer, exampleData);
    }, 2000);

    setInterval(() => {
      void logTest(
        streamdalA,
        { ...audienceAConsumer, operationName: "kafka-consumer-two" },
        exampleData
      );
    }, 4000);

    setInterval(() => {
      void logTest(
        streamdalA,
        { ...audienceAConsumer, operationName: "kafka-consumer-three" },
        exampleData
      );
    }, 6000);

    setInterval(() => {
      void logTest(
        streamdalA,
        { ...audienceAConsumer, componentName: "another-kafka" },
        exampleData
      );
    }, 8000);

    setInterval(() => {
      void logTest(streamdalA, audienceAProducer, exampleData);
    }, 10000);

    setInterval(() => {
      void logTest(streamdalB, audienceBConsumer, exampleData);
    }, 12000);

    setInterval(() => {
      void logTest(streamdalB, audienceBProducer, exampleData);
    }, 14000);

    setInterval(() => {
      void logTest(
        streamdalB,
        { ...audienceBProducer, componentName: "kafka" },
        exampleData
      );
    }, 16000);

    setInterval(() => {
      void logTest(streamdalC, audienceCConsumer, exampleData);
    }, 2000);

    setInterval(() => {
      void logTest(streamdalC, audienceCProducer, exampleData);
    }, 2000);
  };

void throughputFriendly();
