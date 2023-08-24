import { GetAllResponse } from "snitch-protos/protos/sp_external.ts";
import { OperationType } from "snitch-protos/protos/sp_common.ts";
import { DetectiveType } from "snitch-protos/protos/steps/sp_steps_detective.ts";
import { ClientType } from "snitch-protos/protos/sp_info.ts";
import { audienceKey } from "./utils.ts";

export const dummyPipelines = [{
  id: "1234-1234-123456",
  name: "Best pipeline",
  steps: [
    {
      name: "Best step",
      onSuccess: [],
      onFailure: [1],
      step: {
        oneofKind: "detective",
        detective: {
          path: "object.field",
          args: [],
          negate: false,
          type: 1004,
        },
      },
      WasmId: "",
      WasmBytes: [],
      WasmFunction: "",
    },
    {
      name: "Another pretty good step",
      onSuccess: [],
      onFailure: [1],
      step: {
        oneofKind: "detective",
        detective: {
          path: "object.field",
          args: [],
          negate: false,
          type: 1006,
        },
      },
      WasmId: "",
      WasmBytes: [],
      WasmFunction: "",
    },
    {
      name: "A step we probably don't even need",
      onSuccess: [],
      onFailure: [1],
      step: {
        oneofKind: "detective",
        detective: {
          path: "object.field",
          args: [],
          negate: false,
          type: 1006,
        },
      },
      WasmId: "",
      WasmBytes: [],
      WasmFunction: "",
    },
  ],
}, {
  id: "5432-5432-32432",
  name: "Another pipeline",
  steps: [
    {
      name: "Another step",
      onSuccess: [],
      onFailure: [1],
      step: {
        oneofKind: "detective",
        detective: {
          path: "object.field",
          args: [],
          negate: false,
          type: 1006,
        },
      },
      WasmId: "",
      WasmBytes: [],
      WasmFunction: "",
    },
  ],
}];

export const testKafkaAudiences = [{
  serviceName: "Test-Kafka-Service",
  componentName: "kafka",
  operationType: OperationType.CONSUMER,
  operationName: "consume-kafka",
}, {
  serviceName: "Test-Kafka-Service",
  componentName: "kafka",
  operationType: OperationType.PRODUCER,
  operationName: "produce-kafka",
}, {
  serviceName: "Test-Kafka-Service",
  componentName: "kafka",
  operationType: OperationType.PRODUCER,
  operationName: "produce-kafka-two-long-name",
}, {
  serviceName: "Test-Kafka-Service",
  componentName: "kafka",
  operationType: OperationType.PRODUCER,
  operationName: "produce-kafka-three",
}, {
  serviceName: "Test-Kafka-Service",
  componentName: "kafka",
  operationType: OperationType.PRODUCER,
  operationName: "produce-kafka-four",
}];

export const testPostgreSQLAudiences = [{
  serviceName: "Test-PostgreSQL",
  componentName: "postgresql",
  operationType: OperationType.CONSUMER,
  operationName: "consume-postgresql",
}, {
  serviceName: "Test-PostgreSQL",
  componentName: "postgresql",
  operationType: OperationType.CONSUMER,
  operationName: "consume-postgresql-two",
}, {
  serviceName: "Test-PostgreSQL",
  componentName: "postgresql",
  operationType: OperationType.CONSUMER,
  operationName: "consume-postgresql-three",
}, {
  serviceName: "Test-PostgreSQL",
  componentName: "postgresql",
  operationType: OperationType.PRODUCER,
  operationName: "produce-postgresql",
}, {
  serviceName: "Test-PostgreSQL",
  componentName: "postgresql",
  operationType: OperationType.PRODUCER,
  operationName: "produce-postgresql-another",
}];

export const dummyAudiences = [
  ...testKafkaAudiences,
  ...testPostgreSQLAudiences,
];

export const dummyLive = [{
  audiences: [dummyAudiences[0]],
  client: {
    clientType: ClientType.SDK,
    libraryName: "snitch-node-client",
    libraryVersion: "0.0.1",
    language: "typescript",
    arch: "m1",
    os: "osx",
  },
}];

export const dummyConfig = {
  [audienceKey(dummyAudiences[0])]: "86ecfa45-dc2e-4035-bdad-c285ad13cc8e",
};

export const dummyServiceMap: GetAllResponse = {
  audiences: dummyAudiences,
  live: dummyLive,
  config: dummyConfig,
  pipelines: {
    "1234-1234-123456": {
      audiences: dummyAudiences,
      paused: [dummyAudiences[0]],
      pipeline: {
        id: "1234-1234-123456",
        name: "Best pipeline",
        steps: [
          {
            name: "Best step",
            onSuccess: [],
            onFailure: [1],
            step: {
              oneofKind: "detective",
              detective: {
                path: "object.field",
                args: [],
                type: DetectiveType.NUMERIC_EQUAL_TO,
              },
            },
          },
        ],
      },
    },
    "5555-4444-3333": {
      audiences: dummyAudiences,
      paused: [dummyAudiences[2]],
      pipeline: {
        id: "5555-4444-3333",
        name: "Substandard pipeline",
        steps: [
          {
            name: "Ok pipeline step",
            onSuccess: [],
            onFailure: [1],
            step: {
              oneofKind: "detective",
              detective: {
                path: "object.field",
                args: [],
                type: DetectiveType.HOSTNAME,
              },
            },
          },
        ],
      },
    },
  },
};
