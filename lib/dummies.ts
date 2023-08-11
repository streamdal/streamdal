import { GetAllResponse } from "snitch-protos/protos/external.ts";
import { OperationType } from "snitch-protos/protos/common.ts";
import { DetectiveType } from "snitch-protos/protos/steps/detective.ts";

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

export const audiences = [{
  serviceName: "Test Service Name",
  componentName: "kafka",
  operationType: OperationType.CONSUMER,
  operationName: "consume-kafka",
}, {
  serviceName: "Test Service Name",
  componentName: "kafka",
  operationType: OperationType.PRODUCER,
  operationName: "produce-kafka",
}, {
  serviceName: "Test Service Name",
  componentName: "kafka",
  operationType: OperationType.PRODUCER,
  operationName: "produce-kafka-two",
}];

export const dummyServiceMap: GetAllResponse = {
  audiences,
  live: [],
  pipelines: {
    "1234-1234-123456": {
      audiences,
      paused: audiences,
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
      audiences,
      paused: audiences,
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
