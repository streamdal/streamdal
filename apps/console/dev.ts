#!/usr/bin/env -S deno run -A --watch=static/,routes/

import dev from "$fresh/dev.ts";
import config from "./fresh.config.ts";
import { PRODUCTION } from "./lib/configs.ts";

if (PRODUCTION) {
  console.debug = () => null;
}

await dev(import.meta.url, "./main.ts", config);
