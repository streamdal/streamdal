import { defineConfig } from "astro/config";
import preact from "@astrojs/preact";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { links } from "./src/util";
// https://astro.build/config
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  integrations: [
    // Enable Preact to support Preact JSX components.
    preact({
      compat: true,
    }),
    mdx(),
    tailwind(),
    sitemap({
      customPages: links,
    }),
  ],
  site: `https://docs.streamdal.com`,
  output: "server",
  adapter: cloudflare(),
});
