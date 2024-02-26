import { readFileSync } from "node:fs";

import { Audience } from "@streamdal/protos/protos/sp_common";

import {
  OperationType,
  registerStreamdal,
  StreamdalConfigs,
  StreamdalRegistration,
} from "../index.js";
import { QUIET, runPipeline } from "./index.js";

const serviceBillingConfig: StreamdalConfigs = {
  streamdalUrl: "localhost:8082",
  streamdalToken: "1234",
  serviceName: "billing-service",
  pipelineTimeout: "100",
  stepTimeout: "10",
  dryRun: false,
};

const serviceSignupConfig: StreamdalConfigs = {
  streamdalUrl: "localhost:8082",
  streamdalToken: "1234",
  serviceName: "signup-service",
  pipelineTimeout: "100",
  stepTimeout: "10",
  dryRun: false,
};

const serviceWelcomeConfig: StreamdalConfigs = {
  streamdalUrl: "localhost:8082",
  streamdalToken: "1234",
  serviceName: "welcome-service",
  pipelineTimeout: "100",
  stepTimeout: "10",
  dryRun: false,
};

const billingConsumer: Audience = {
  serviceName: "billing-service",
  componentName: "kafka",
  operationType: OperationType.CONSUMER,
  operationName: "processor",
};

const billingProducer: Audience = {
  serviceName: "billing-service",
  componentName: "stripe",
  operationType: OperationType.PRODUCER,
  operationName: "stripe-register",
};

const signupProducer: Audience = {
  serviceName: "signup-service",
  componentName: "kafka",
  operationType: OperationType.PRODUCER,
  operationName: "recorder",
};

const signupProducer1: Audience = {
  serviceName: "signup-service",
  componentName: "database",
  operationType: OperationType.PRODUCER,
  operationName: "verifier",
};

const welcomeConsumer: Audience = {
  serviceName: "welcome-service",
  componentName: "kafka",
  operationType: OperationType.CONSUMER,
  operationName: "reader",
};

const welcomeProducer: Audience = {
  serviceName: "welcome-service",
  componentName: "aws-ses",
  operationType: OperationType.PRODUCER,
  operationName: "emailer",
};

const parseJson = (d: string): any => {
  try {
    return d ? JSON.parse(d) : null;
  } catch (e) {
    console.error("error parsing sample data to json", e);
  }
  return null;
};

export const loadData = (path: string): any[] => {
  try {
    const data = readFileSync(path).toString();

    const parsed = data
      .split(/\r?\n/)
      .map((d): any => parseJson(d))
      .filter((d) => d);
    return parsed;
  } catch (e) {
    console.error("error loading sample data", e);
  }
  return [];
};

export const randomPipelineAndData = (
  streamdal: StreamdalRegistration,
  audience: Audience,
  input: any[]
) => {
  runPipeline(
    streamdal,
    audience,
    input[Math.floor(Math.random() * input.length)]
  );
  setTimeout(
    () => randomPipelineAndData(streamdal, audience, input),
    Math.floor(Math.random() * (3000 - 100) + 100)
  );
};

export const billingExample = async () => {
  const streamdal = await registerStreamdal({
    ...serviceBillingConfig,
    quiet: QUIET,
  });

  const bcData = loadData("./src/sandbox/assets/sample-billing-consumer.json");
  const bpData = loadData("./src/sandbox/assets/sample-billing-producer.json");

  randomPipelineAndData(streamdal, billingConsumer, bcData);
  randomPipelineAndData(streamdal, billingProducer, bpData);
};

export const signupExample = async () => {
  const streamdal = await registerStreamdal({
    ...serviceSignupConfig,
    quiet: QUIET,
  });

  const sData = loadData("./src/sandbox/assets/sample.json");
  const spData = loadData("./src/sandbox/assets/sample-signup-producer.json");

  randomPipelineAndData(streamdal, signupProducer, spData);
  randomPipelineAndData(streamdal, signupProducer1, sData);
};

export const singleSignupExample = async () => {
  const streamdal = await registerStreamdal({
    ...serviceSignupConfig,
    quiet: QUIET,
  });

  const spData = loadData("./src/sandbox/assets/sample-signup-producer.json");

  randomPipelineAndData(streamdal, signupProducer, spData);
};

export const welcomeExample = async () => {
  const streamdal = await registerStreamdal(serviceWelcomeConfig);

  const sData = loadData("./src/sandbox/assets/sample.json");
  const wpData = loadData("./src/sandbox/assets/sample-welcome-producer.json");

  randomPipelineAndData(streamdal, welcomeConsumer, sData);
  randomPipelineAndData(streamdal, welcomeProducer, wpData);
};

export const singleWelcomeExample = async () => {
  const streamdal = await registerStreamdal({
    ...serviceWelcomeConfig,
    quiet: QUIET,
  });
  const wpData = loadData("./src/sandbox/assets/sample-welcome-producer.json");
  randomPipelineAndData(streamdal, welcomeProducer, wpData);
};

export const onboardingExample = () => {
  void signupExample();
  void billingExample();
  void welcomeExample();
};
