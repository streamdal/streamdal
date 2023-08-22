# Streamdal's Snitch Node Client SDK

## Getting started

Optionally copy `example.env` -> `.env` and specify any custom env vars. 

To use the sdk in your node app:

`npm install @streamdal/node-sdk-client`

Then construct an instance of `"@streamdal/snitch-node-client/snitch.js"` and use that
to process your data:

```typescript

const config: SnitchConfigs = {
  snitchUrl: "localhost:9091",
  snitchToken: "1234",
  serviceName: "test-service-name",
  pipelineTimeout: "100",
  stepTimeout: "10",
  dryRun: "false",
};

const audience: Audience = {
  serviceName: "test-service-name",
  componentName: "kafka",
  operationType: OperationType.CONSUMER,
  operationName: "test-kafka-consumer",
};

export const example = async () => {
  const snitch = new Snitch(config);
  const result = await snitch.processPipeline({
    audience,
    data: new TextEncoder().encode(JSON.stringify(exampleData)),
  });

  console.log("snitch response");
  console.dir(result, {depth: 20});
};

```
*see ./examples for a runnable example that can be used as a starter*

## Development  

To do development on the `snitch-node-client`, you can run it locally:

`npm install`
`npm start`

See `./src/interanl/index.ts` for an entry point for local dev.

Optionally install and run the [snitch-server](https://github.com/streamdal/snitch-server)

