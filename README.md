# Streamdal's Node SDK

## Getting started

Optionally copy `example.env` -> `.env` and specify any custom env vars. 

To use the sdk in your node app:

`npm install @streamdal/node-sdk`

Then construct an instance of `"@streamdal/node-sdk/streamdal.js"` and use that
to process your data:

```typescript

const config: StreamdalConfigs = {
  streamdalUrl: "localhost:8082",
  streamdalToken: "1234",
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
  const streamdal = new Streamdal(config);
  const result = await streamdal.processPipeline({
    audience,
    data: new TextEncoder().encode(JSON.stringify(exampleData)),
  });

  console.log("streamdal response");
  console.dir(result, {depth: 20});
};

```
*See [./examples](./examples) for runnable examples that can be used as a starters.*

## Wasm
In order to run pipelines with a minimal amount of overhead, the Streamdal node sdk ships 
and executes pipeline rules as WASM. If you are using Node version < 20.* you'll need to enable 
WASM functionality in your node app by supplying the flag, see:

```
node --experimental-wasi-unstable-preview1 ./build/sandbox/index.js
```

More info: [Node WASM Modules](https://nodejs.org/api/all.html#all_esm_wasm-modules)

## Development  

To do development on the `node-sdk`, you can run it locally:

`npm install`
`npm run sandbox`

See `./src/sandbox/index.ts` for an entry point for local dev.

Optionally install and run the Streamdal [server](https://github.com/streamdal/server)

### Releasing

1. `npm version [<newversion> | major | minor | patch]`
2. git push the updated package.json and generated version tag: `git push && git push origin <tag_name>`
3. Generate a release from the tag with user-friendly release notes:
   https://github.com/streamdal/node-sdk/releases

