
# Streamdal's Node SDK

[![Master build status](https://github.com/streamdal/streamdal/actions/workflows/sdks-node-release.yml/badge.svg)](https://github.com/streamdal/streamdal/actions/workflows/sdks-node-release.yml)
[![Github](https://img.shields.io/github/license/streamdal/streamdal)](LICENSE)
[![Discord](https://img.shields.io/badge/Community-Discord-4c57e8.svg)](https://discord.gg/streamdal)

## Getting started

Optionally copy `example.env` -> `.env` and specify any custom env vars. 

To use the sdk in your node app:

`npm install @streamdal/node-sdk`

Then construct an instance of `Streamdal` from `"@streamdal/node-sdk"` and use that
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
  const result = await streamdal.process({
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

Optionally install and run the Streamdal [server](https://github.com/streamdal/streamdal/tree/main/apps/server)

### Releasing

Any push or merge to main will automatically tag
and release a new version to npm. The package.json file will
will also be bumped to reflect the new version. If you'd like 
to skip release on the push/merge to main, include "norelease" 
anywhere in the commit message.

