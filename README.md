# Snitch Console

Snitch console allows you visualize interact with your services, build and
attach pipelines to consumers and producers and monitor their operations.

![Snitch Console](./console-screenshot.png)

### Development

The Snitch Console is a Deno + Fresh project that uses Preact, ReactFlow and
Twind: https://fresh.deno.dev/docs/getting-started

Make sure to install Deno: https://deno.land/manual/getting_started/installation

Optionally, copy `example.env` -> `.env` and set environment variables as
needed. By default the console will access the GRPC WEB API running on
`http://localhost:9091`

Then start the project:

```
deno task start
```

This will watch the project directory and restart as necessary.

If you make any significant Deno lib and/or configuration changes and your IDE
gets confused, you can force update the Deno lib cache with
`deno cache --reload main.ts`

### Server

This console needs a snitch-server to run against. See
[snitch-server](https://github.com/streamdal/snitch-server) for instructions on
running it locally.

### Versions

Update `verstion.ts` to display a new version in the app. See:
`https://deno.land/x/version_ts@0.2.2` to make this a little easier.

### Running (non-development)

If you just want to run the console and the server together for non-development
purposes, you can bring them both up with docker, see:
https://github.com/streamdal/snitch/tree/main/docker/local
