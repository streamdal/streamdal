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

export const dummyServiceMap = {
  serviceMap: {
    "Test Service Name": {
      name: "Test Service Name",
      description: "This is a test service",
      pipelines: [
        {
          audience: {
            serviceName: "Test Service Name",
            componentName: "kafka",
            operationType: 1,
            operationName: "consumer-name",
          },
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
                    negate: false,
                    type: 1006,
                  },
                },
                WasmId: "",
                WasmBytes: [],
                WasmFunction: "",
              },
            ],
          },
        },
        {
          audience: {
            serviceName: "Test Service Name",
            componentName: "kafka",
            operationType: 2,
            operationName: "producer-name",
          },
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
                    negate: false,
                    type: 1006,
                  },
                },
                WasmId: "",
                WasmBytes: [],
                WasmFunction: "",
              },
            ],
          },
        },
        {
          audience: {
            serviceName: "Test Service Name",
            componentName: "kafka",
            operationType: 1,
            operationName: "consumer-billing",
          },
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
                    negate: false,
                    type: 1006,
                  },
                },
                WasmId: "",
                WasmBytes: [],
                WasmFunction: "",
              },
            ],
          },
        },
      ],
      consumers: [],
      producers: [],
      clients: [],
    },
  },
};
