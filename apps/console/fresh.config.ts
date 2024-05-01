import { defineConfig } from "$fresh/server.ts";
import tailwind from "$fresh/plugins/tailwind.ts";
import { PORT } from "./lib/configs.ts";
export default defineConfig({
  port: PORT,
  plugins: [tailwind()],
});
