import { ExecStatus } from "@streamdal/protos/protos/sp_sdk";

import {
  Audience,
  OperationType,
  registerStreamdal,
  StreamdalConfigs,
  StreamdalRegistration,
} from "../index.js";
import { onboardingExample } from "./billing.js";

export const QUIET = true;

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
  streamdalUrl: "localhost:8082",
  streamdalToken: "1234",
  serviceName: "test-service",
  pipelineTimeout: "100",
  stepTimeout: "10",
  dryRun: false,
};

const serviceBConfig: StreamdalConfigs = {
  streamdalUrl: "localhost:8082",
  streamdalToken: "1234",
  serviceName: "another-test-service",
  pipelineTimeout: "100",
  stepTimeout: "10",
  dryRun: false,
};

const serviceCConfig: StreamdalConfigs = {
  streamdalUrl: "localhost:8082",
  streamdalToken: "1234",
  serviceName: "third-service",
  pipelineTimeout: "100",
  stepTimeout: "10",
  dryRun: false,
};

const audienceAConsumer: Audience = {
  componentName: "kafka",
  operationType: OperationType.CONSUMER,
  operationName: "kafka-consumer",
};

const audienceAProducer: Audience = {
  componentName: "kafka",
  operationType: OperationType.PRODUCER,
  operationName: "kafka-producer",
};

const audienceBConsumer: Audience = {
  componentName: "another-kafka",
  operationType: OperationType.CONSUMER,
  operationName: "test-kafka-consumer",
};

const audienceBProducer: Audience = {
  componentName: "another-kafka",
  operationType: OperationType.PRODUCER,
  operationName: "test-kafka-producer",
};

const audienceCConsumer: Audience = {
  componentName: "third-kafka",
  operationType: OperationType.CONSUMER,
  operationName: "kafka-consumer",
};

const audienceCProducer: Audience = {
  componentName: "third-kafka",
  operationType: OperationType.PRODUCER,
  operationName: "kafka-consumer",
};

const logPipeline = async (
  streamdal: StreamdalRegistration,
  audience: Audience,
  input: any
) => {
  if (QUIET) {
    console.debug = () => null;
    // console.dir = () => null;
  }
  console.debug("--------------------------------");
  console.debug("pipeline request start", new Date());
  console.debug(
    `sending pipeline request for ${audience.operationName} - ${OperationType[
      audience.operationType
    ].toLowerCase()}`
  );
  const { status, statusMessage, metadata } = await streamdal.process({
    audience: audience,
    data: new TextEncoder().encode(JSON.stringify(input)),
  });
  console.debug("metadata:", metadata);
  //
  // no active pipeline messages are technically errors
  // but more informational
  console.debug("result status", ExecStatus[status]);
  statusMessage && console.debug("status message", statusMessage);
  console.debug("result data:");
  try {
    // data && data.length > 0
    //   ? console.dir(JSON.parse(new TextDecoder().decode(data)), { depth: 20 })
    //   : console.debug("no data returned");
  } catch (e) {
    console.error("could not parse data", e);
  }
  console.debug("pipeline status:");
  // console.dir(pipelineStatus, { depth: 20 });
  console.debug("pipeline request done", new Date());
  console.debug("--------------------------------");
  console.debug("\n");
};

export const runPipeline = (
  streamdal: StreamdalRegistration,
  audience: Audience,
  input: any,
  interval = 0
) =>
  interval
    ? setInterval(() => {
        void logPipeline(streamdal, audience, input);
      }, interval)
    : void logPipeline(streamdal, audience, input);

export const randomPipeline = (
  streamdal: StreamdalRegistration,
  audience: Audience,
  input: any
) => {
  runPipeline(streamdal, audience, input);
  setTimeout(
    () => randomPipeline(streamdal, audience, input),
    Math.floor(Math.random() * (3000 - 250) + 3000)
  );
};

export const exampleStaggered = async () => {
  const streamdalA = await registerStreamdal(serviceAConfig);
  const streamdalB = await registerStreamdal(serviceBConfig);

  randomPipeline(streamdalA, audienceAConsumer, exampleData);
  runPipeline(streamdalA, audienceAProducer, exampleData, 4000);
  runPipeline(streamdalB, audienceBConsumer, exampleData, 8000);
  runPipeline(streamdalB, audienceBProducer, exampleData, 12000);
};

export const tailFriendly = async () => {
  const streamdalA = await registerStreamdal(serviceAConfig);
  const streamdalB = await registerStreamdal(serviceBConfig);

  runPipeline(streamdalA, audienceAConsumer, exampleData);

  runPipeline(
    streamdalA,
    { ...audienceAConsumer, operationName: "kafka-consumer-two" },
    exampleData
  );

  runPipeline(
    streamdalA,
    { ...audienceAConsumer, operationName: "kafka-consumer-three" },
    exampleData
  );

  runPipeline(
    streamdalA,
    { ...audienceAConsumer, componentName: "another-kafka" },
    exampleData
  );

  runPipeline(streamdalA, audienceAProducer, exampleData);
  runPipeline(streamdalB, audienceBConsumer, exampleData, 1);
  runPipeline(streamdalB, audienceBProducer, exampleData);

  runPipeline(
    streamdalB,
    { ...audienceBProducer, componentName: "kafka" },
    exampleData
  );
};

export const highVolumeTail = async () => {
  const streamdalA = await registerStreamdal(serviceAConfig);
  const streamdalB = await registerStreamdal(serviceBConfig);

  runPipeline(streamdalA, audienceAConsumer, exampleData, 500);

  runPipeline(
    streamdalA,
    { ...audienceAConsumer, operationName: "kafka-consumer-two" },
    exampleData,
    500
  );

  runPipeline(
    streamdalA,
    { ...audienceAConsumer, operationName: "kafka-consumer-three" },
    exampleData,
    1000
  );

  runPipeline(
    streamdalA,
    { ...audienceAConsumer, componentName: "another-kafka" },
    exampleData,
    500
  );

  runPipeline(
    streamdalA,
    { ...audienceAConsumer, componentName: "another-kafka" },
    exampleData
  );

  runPipeline(streamdalA, audienceAProducer, exampleData, 2000);
  runPipeline(streamdalB, audienceBConsumer, exampleData, 250);
  runPipeline(streamdalB, audienceBProducer, exampleData, 500);

  runPipeline(
    streamdalB,
    { ...audienceBProducer, componentName: "kafka" },
    exampleData,
    500
  );
};

export const throughputFriendly = async () => {
  const streamdalA = await registerStreamdal(serviceAConfig);
  const streamdalB = await registerStreamdal(serviceBConfig);

  randomPipeline(streamdalA, audienceAConsumer, exampleData);

  randomPipeline(
    streamdalA,
    { ...audienceAConsumer, operationName: "kafka-consumer-two" },
    exampleData
  );

  randomPipeline(
    streamdalA,
    { ...audienceAConsumer, operationName: "kafka-consumer-three" },
    exampleData
  );

  randomPipeline(
    streamdalA,
    { ...audienceAConsumer, componentName: "another-kafka" },
    exampleData
  );

  randomPipeline(streamdalA, audienceAProducer, exampleData);
  randomPipeline(streamdalB, audienceBConsumer, exampleData);
  randomPipeline(streamdalB, audienceBProducer, exampleData);

  randomPipeline(
    streamdalB,
    { ...audienceBProducer, componentName: "kafka" },
    exampleData
  );
};

export const tailFast = async () => {
  const streamdalB = await registerStreamdal(serviceBConfig);
  runPipeline(streamdalB, audienceBConsumer, exampleData, 100);
};

export const exampleConcurrent = async () => {
  const streamdalA = await registerStreamdal(serviceAConfig);
  const streamdalB = await registerStreamdal(serviceBConfig);
  runPipeline(streamdalA, audienceAConsumer, exampleData, 4000);

  runPipeline(streamdalA, audienceAProducer, exampleData);
  runPipeline(streamdalB, audienceBConsumer, exampleData);
  runPipeline(streamdalB, audienceBProducer, exampleData);
};

export const exampleMultipleGroup = async () => {
  const streamdalA = await registerStreamdal(serviceAConfig);
  const streamdalB = await registerStreamdal(serviceBConfig);

  runPipeline(streamdalA, audienceAConsumer, exampleData);
  runPipeline(
    streamdalA,
    { ...audienceAConsumer, operationName: "kafka-consumer-two" },
    exampleData
  );
  runPipeline(streamdalA, audienceAProducer, exampleData);
  runPipeline(streamdalB, audienceBConsumer, exampleData);
  runPipeline(streamdalB, audienceBProducer, exampleData);
  runPipeline(
    streamdalB,
    { ...audienceBProducer, operationName: "kafka-producer-two" },
    exampleData
  );
};

export const exampleMultipleComponentsPerService = async () => {
  const streamdalA = await registerStreamdal(serviceAConfig);
  const streamdalB = await registerStreamdal(serviceBConfig);

  runPipeline(streamdalA, audienceAConsumer, exampleData);
  runPipeline(
    streamdalA,
    { ...audienceAConsumer, componentName: "another-kafka" },
    exampleData
  );
  runPipeline(streamdalA, audienceAProducer, exampleData);
  runPipeline(streamdalB, audienceBConsumer, exampleData);
  runPipeline(streamdalB, audienceBProducer, exampleData);
  runPipeline(
    streamdalB,
    { ...audienceBProducer, componentName: "kafka" },
    exampleData
  );
};

export const exampleSimple = async () => {
  const streamdalA = await registerStreamdal(serviceAConfig);
  runPipeline(streamdalA, audienceAConsumer, exampleData);
};

export const exampleStaggeredMultipleComponentsPerServiceAndPerGroup =
  async () => {
    const streamdalA = await registerStreamdal(serviceAConfig);
    const streamdalB = await registerStreamdal(serviceBConfig);
    const streamdalC = await registerStreamdal(serviceCConfig);

    runPipeline(streamdalA, audienceAConsumer, exampleData, 2000);

    runPipeline(
      streamdalA,
      { ...audienceAConsumer, operationName: "kafka-consumer-two" },
      exampleData,
      4000
    );

    runPipeline(
      streamdalA,
      { ...audienceAConsumer, operationName: "kafka-consumer-three" },
      exampleData,
      6000
    );

    runPipeline(
      streamdalA,
      { ...audienceAConsumer, componentName: "another-kafka" },
      exampleData,
      8000
    );

    runPipeline(streamdalA, audienceAProducer, exampleData, 10000);
    runPipeline(streamdalB, audienceBConsumer, exampleData, 12000);
    runPipeline(streamdalB, audienceBProducer, exampleData, 14000);
    runPipeline(
      streamdalB,
      { ...audienceBProducer, componentName: "kafka" },
      exampleData,
      16000
    );

    runPipeline(streamdalC, audienceCConsumer, exampleData, 2000);
    runPipeline(streamdalC, audienceCProducer, exampleData, 2000);
  };

export const openAIExample = async () => {
  const openAIPromptConfig: StreamdalConfigs = {
    streamdalUrl: "localhost:8082",
    streamdalToken: "1234",
    serviceName: "chat-gpt",
    pipelineTimeout: "100",
    stepTimeout: "10",
    dryRun: false,
  };

  const openAIProducer: Audience = {
    componentName: "chat-gpt",
    operationType: OperationType.PRODUCER,
    operationName: "customer-service-prompt",
  };

  const openAI = await registerStreamdal(openAIPromptConfig);

  runPipeline(
    openAI,
    openAIProducer,
    {
      role: "user",
      content: `Can you write an email for me to a customer to apologize for a lost order. Customer email is jacob@streamdal.com?`,
    },
    1000
  );
};

//
// void kvExample();
// void singleWelcomeExample();
// void singleSignupExample();
// void openAIExample();
onboardingExample();
