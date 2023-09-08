# Snitch Console

The Snitch Console is a Deno + Fresh project, see:
https://fresh.deno.dev/docs/getting-started

### Usage

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
