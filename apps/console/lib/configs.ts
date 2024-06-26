import { load } from "$std/dotenv/mod.ts";

const env = await load();

//
// fresh session needs an "APP_KEY" in the deno env
Deno.env.set(
  "APP_KEY",
  env["STREAMDAL_CONSOLE_SESSION_KEY"] ?? crypto.randomUUID(),
);
export const PORT = Number(
  env["STREAMDAL_CONSOLE_PORT"] ??
    Deno.env.get("STREAMDAL_CONSOLE_PORT") ??
    8080,
);
export const REST_URL = env["STREAMDAL_SERVER_REST_URL"] ??
  Deno.env.get("STREAMDAL_SERVER_REST_URL");
export const REST_TOKEN = env["STREAMDAL_SERVER_REST_AUTH"] ??
  Deno.env.get("STREAMDAL_SERVER_REST_AUTH");
export const GRPC_URL = env["STREAMDAL_CONSOLE_GRPC_WEB_URL"] ??
  Deno.env.get("STREAMDAL_CONSOLE_GRPC_WEB_URL") ??
  "http://localhost:8083";
export const GRPC_TOKEN = env["STREAMDAL_CONSOLE_GRPC_AUTH_TOKEN"] ??
  Deno.env.get("STREAMDAL_CONSOLE_GRPC_AUTH_TOKEN");
export const PRODUCTION = env["STREAMDAL_CONSOLE_PRODUCTION"] === "true" ||
  Deno.env.get("STREAMDAL_CONSOLE_PRODUCTION") === "true";
export const DEMO = env["STREAMDAL_CONSOLE_DEMO"] === "true" ||
  Deno.env.get("STREAMDAL_CONSOLE_DEMO") === "true";
export const SENTRY_KEY = env["STREAMDAL_CONSOLE_SENTRY_KEY"];
export const GOOGLE_ANALYTICS_KEY =
  env["STREAMDAL_CONSOLE_GOOGLE_ANALYTICS_KEY"] ||
  Deno.env.get("STREAMDAL_CONSOLE_GOOGLE_ANALYTICS_KEY");
