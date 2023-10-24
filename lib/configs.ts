import { load } from "$std/dotenv/mod.ts";

const env = await load();

//
// fresh session needs an "APP_KEY" in the deno env
Deno.env.set("APP_KEY", env["APP_KEY"] ?? crypto.randomUUID());
export const GRPC_URL = env["STREAMDAL_GRPC_WEB_URL"] ??
  Deno.env.get("STREAMDAL_GRPC_WEB_URL") ?? "http://localhost:9091";
export const GRPC_TOKEN = env["STREAMDAL_GRPC_AUTH_TOKEN"] ??
  Deno.env.get("STREAMDAL_GRPC_AUTH_TOKEN");
export const PRODUCTION = env["STREAMDAL_PRODUCTION"] ??
  Deno.env.get("STREAMDAL_PRODUCTION");
export const DEMO = env["STREAMDAL_DEMO"] ?? Deno.env.get("STREAMDAL_DEMO");
