Streamdal Node SDK
==================
[![Release](https://github.com/streamdal/streamdal/actions/workflows/sdks-node-release.yml/badge.svg)](https://github.com/streamdal/streamdal/actions/workflows/sdks-node-release.yml)
[![Pull Request](https://github.com/streamdal/streamdal/actions/workflows/sdks-node-pr.yml/badge.svg)](https://github.com/streamdal/streamdal/blob/main/.github/workflows/sdks-node-pr.yml)
[![Discord](https://img.shields.io/badge/Community-Discord-4c57e8.svg)](https://discord.gg/streamdal)

_**Node SDK for [Streamdal](https://streamdal.com).**_

<sub>For more details, see the main
[streamdal repo](https://github.com/streamdal/streamdal).</sub>

---

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
  const streamdal = await registerStreamdal(config);
  const result = await streamdal.process({
    audience,
    data: new TextEncoder().encode(JSON.stringify(exampleData)),
  });

  console.log("streamdal response");
  console.dir(result, {depth: 20});
};

```
*See [./examples](./examples) for runnable examples that can be used as a starters.*

## Documentation

See https://docs.streamdal.com

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

## Release

Any push or merge to the `main` branch with any changes in `/sdks/node/*`
will automatically tag and release a new console version with `sdks/node/vX.Y.Z`.

<sub>(1) If you'd like to skip running the release action on push/merge to `main`,
include `norelease` anywhere in the commit message.</sub>

<sub>(2) The `package.json` file will will also be bumped as part of the release
to reflect the new version.</sub>
