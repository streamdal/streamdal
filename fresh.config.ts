import { defineConfig } from "$fresh/server.ts";
import twindPlugin from "$fresh/plugins/twind.ts";
import twindConfig from "./twind.config.ts";
export default defineConfig({
  port: 3000,
  plugins: [twindPlugin(twindConfig)],
});
