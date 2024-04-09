#!/usr/bin/env -S deno run --allow-read --allow-write --allow-run

// @ts-check
// Type checks every JavaScript module in the project.

import { expandGlob } from "$std/fs/mod.ts";

let hasErrors = false;

console.log("Checking all ts & tsx files...");
for await (
  const { path } of expandGlob("**\/*.{ts,tsx}", {
    exclude: ["fresh.config.ts", "fresh.gen.ts", "twind.config.ts"],
  })
) {
  console.log("checking:", path);
  const command = new Deno.Command(Deno.execPath(), {
    args: [
      "check",
      "--import-map",
      "deno.json",
      path,
    ],
  });

  const { code, stdout, stderr } = command.outputSync();
  await Deno.stdout.write(code ? stderr : stdout);

  if (code) {
    hasErrors = true;
  }
}

console.log("Check complete");
if (hasErrors) {
  console.error("errors found");
  Deno.exit(1);
} else {
  console.log("no errors found");
  Deno.exit(0);
}
