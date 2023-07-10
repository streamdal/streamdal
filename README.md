# Snitch Console

The Snitch Console is a Deno + Fresh project, see:
https://fresh.deno.dev/docs/getting-started

### Usage

Make sure to install Deno: https://deno.land/manual/getting_started/installation

Optionally, copy `example.env` -> `.env` and set environment variables as
needed. By default the console will access the API runningn on
`http://localhost:9191`

Then start the project:

```
deno task start
```

This will watch the project directory and restart as necessary.

If you make any significant Deno lib and/or configuration changes and your IDE
gets confused, you can force update the Deno lib cache with
`deno cache --reload main.ts`

#### Temporary Notes

Currently, the console only runs against Plumber branch `blinktag/wasm`
(https://github.com/streamdal/plumber/tree/blinktag/wasm). To populate that with
test data, fetch: http://localhost:9191/v1/temp-populate
