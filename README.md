# Streamdal's Snitch Node Data Quality SDK

## Getting started

Optionally copy `example.env` -> `.env` and specify any custom env vars. 

To use the sdk in your node app:

`npm install @streamdal/node-sdk-client`

Then import `"@streamdal/snitch-node-client/process.js"` and invoke the `process` command
like so:

```typescript
  process(audience, data)
```

To do development on the `snitch-node-client`:

`npm install`
`npm start`

Optionally install and run the [snitch-server](https://github.com/streamdal/snitch-server)

