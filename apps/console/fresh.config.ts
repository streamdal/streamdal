import { defineConfig } from "$fresh/server.ts";
import twindPlugin from "$fresh/plugins/twind.ts";
import twindConfig from "./twind.config.ts";
import { PORT } from "./lib/configs.ts";
export default defineConfig({
  port: PORT,
  plugins: [twindPlugin(twindConfig)],
});
