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


