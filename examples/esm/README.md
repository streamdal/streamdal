# Example app that uses Streamdal's Snitch Node Client SDK with esm modules

## Getting started

You must have a Snitch Server running locally or deployed. For running locally see:
[snitch-server](https://github.com/streamdal/snitch-server), for deplying to your cloud or 
infrastructure, see: [snitch](https://github.com/streamdal/snitch).

You can supply the necessary configs to the snitch node client either as constructor args in code 
or as env vars. Constructor args take precedence over env vars. For env vars you can start by 
copying `example.env` -> `.env` and setting values there. For constructor args, see `configs` in 
`/examples/src/index.ts`:

```typescript
const config: SnitchConfigs = {
  snitchUrl: "localhost:9091",
  snitchToken: "1234",
  serviceName: "test-service-name",
  pipelineTimeout: "100",
  stepTimeout: "10",
  dryRun: "false",
};
```

See `.src/index.ts` for full example client.

Then install deps and run as usual:

`npm install`

`npm start`

## WASM
In order to run pipelines with a minimal amount of overhead, the Snitch node client ships
and executes pipeline rules as WASM. If you are using Node version < 20.* you'll need to enable
WASM functionality in your node app by supplying the flag, see:

```
node --experimental-wasi-unstable-preview1 ./build/sandbox/index.js
```

More info: [Node WASM Modules](https://nodejs.org/api/all.html#all_esm_wasm-modules)


