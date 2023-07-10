# Snitch Console

The Snitch Console is a Deno + Fresh project, see:
https://fresh.deno.dev/docs/getting-started

### Usage

Make sure to install Deno: https://deno.land/manual/getting_started/installation

Then start the project:

```
deno task start
```

This will watch the project directory and restart as necessary.

Currently this POC only runs against a hard coded reference to plumber running
locally on `http://localhost:9191`. You'll need to checkout and run plumber
branch `blinktag/wasm`. Once you have plumber running locally with
`go run main.go server`, you can populate seed data and metrics with:
http://localhost:9191/v1/temp-populate

If you make any significant Deno lib and/or configuration changes and your IDE
gets confused, you can force update the Deno lib cache with
`deno cache --reload main.ts`
