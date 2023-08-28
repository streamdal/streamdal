import { markdownConfigDefaults } from "@astrojs/markdown-remark";
import { BUNDLED_THEMES } from "shiki";
import { z } from "zod";
import { appendForwardSlash, prependForwardSlash, trimSlashes } from "../path.js";
const ASTRO_CONFIG_DEFAULTS = {
  root: ".",
  srcDir: "./src",
  publicDir: "./public",
  outDir: "./dist",
  base: "/",
  trailingSlash: "ignore",
  build: {
    format: "directory",
    client: "./dist/client/",
    server: "./dist/server/",
    assets: "_astro",
    serverEntry: "entry.mjs"
  },
  server: {
    host: false,
    port: 3e3,
    streaming: true,
    open: false
  },
  integrations: [],
  markdown: {
    drafts: false,
    ...markdownConfigDefaults
  },
  vite: {},
  legacy: {},
  experimental: {
    assets: false
  }
};
const AstroConfigSchema = z.object({
  root: z.string().optional().default(ASTRO_CONFIG_DEFAULTS.root).transform((val) => new URL(val)),
  srcDir: z.string().optional().default(ASTRO_CONFIG_DEFAULTS.srcDir).transform((val) => new URL(val)),
  publicDir: z.string().optional().default(ASTRO_CONFIG_DEFAULTS.publicDir).transform((val) => new URL(val)),
  outDir: z.string().optional().default(ASTRO_CONFIG_DEFAULTS.outDir).transform((val) => new URL(val)),
  site: z.string().url().optional(),
  base: z.string().optional().default(ASTRO_CONFIG_DEFAULTS.base),
  trailingSlash: z.union([z.literal("always"), z.literal("never"), z.literal("ignore")]).optional().default(ASTRO_CONFIG_DEFAULTS.trailingSlash),
  output: z.union([z.literal("static"), z.literal("server")]).optional().default("static"),
  adapter: z.object({ name: z.string(), hooks: z.object({}).passthrough().default({}) }).optional(),
  integrations: z.preprocess(
    // preprocess
    (val) => Array.isArray(val) ? val.flat(Infinity).filter(Boolean) : val,
    // validate
    z.array(z.object({ name: z.string(), hooks: z.object({}).passthrough().default({}) })).default(ASTRO_CONFIG_DEFAULTS.integrations)
  ),
  build: z.object({
    format: z.union([z.literal("file"), z.literal("directory")]).optional().default(ASTRO_CONFIG_DEFAULTS.build.format),
    client: z.string().optional().default(ASTRO_CONFIG_DEFAULTS.build.client).transform((val) => new URL(val)),
    server: z.string().optional().default(ASTRO_CONFIG_DEFAULTS.build.server).transform((val) => new URL(val)),
    assets: z.string().optional().default(ASTRO_CONFIG_DEFAULTS.build.assets),
    assetsPrefix: z.string().optional(),
    serverEntry: z.string().optional().default(ASTRO_CONFIG_DEFAULTS.build.serverEntry)
  }).optional().default({}),
  server: z.preprocess(
    // preprocess
    // NOTE: Uses the "error" command here because this is overwritten by the
    // individualized schema parser with the correct command.
    (val) => typeof val === "function" ? val({ command: "error" }) : val,
    // validate
    z.object({
      open: z.boolean().optional().default(ASTRO_CONFIG_DEFAULTS.server.open),
      host: z.union([z.string(), z.boolean()]).optional().default(ASTRO_CONFIG_DEFAULTS.server.host),
      port: z.number().optional().default(ASTRO_CONFIG_DEFAULTS.server.port),
      headers: z.custom().optional()
    }).optional().default({})
  ),
  image: z.object({
    service: z.union([
      z.literal("astro/assets/services/sharp"),
      z.literal("astro/assets/services/squoosh"),
      z.string()
    ])
  }).default({
    service: "astro/assets/services/squoosh"
  }),
  markdown: z.object({
    drafts: z.boolean().default(false),
    syntaxHighlight: z.union([z.literal("shiki"), z.literal("prism"), z.literal(false)]).default(ASTRO_CONFIG_DEFAULTS.markdown.syntaxHighlight),
    shikiConfig: z.object({
      langs: z.custom().array().default([]),
      theme: z.enum(BUNDLED_THEMES).or(z.custom()).default(ASTRO_CONFIG_DEFAULTS.markdown.shikiConfig.theme),
      wrap: z.boolean().or(z.null()).default(ASTRO_CONFIG_DEFAULTS.markdown.shikiConfig.wrap)
    }).default({}),
    remarkPlugins: z.union([
      z.string(),
      z.tuple([z.string(), z.any()]),
      z.custom((data) => typeof data === "function"),
      z.tuple([z.custom((data) => typeof data === "function"), z.any()])
    ]).array().default(ASTRO_CONFIG_DEFAULTS.markdown.remarkPlugins),
    rehypePlugins: z.union([
      z.string(),
      z.tuple([z.string(), z.any()]),
      z.custom((data) => typeof data === "function"),
      z.tuple([z.custom((data) => typeof data === "function"), z.any()])
    ]).array().default(ASTRO_CONFIG_DEFAULTS.markdown.rehypePlugins),
    remarkRehype: z.custom((data) => data instanceof Object && !Array.isArray(data)).optional().default(ASTRO_CONFIG_DEFAULTS.markdown.remarkRehype),
    gfm: z.boolean().default(ASTRO_CONFIG_DEFAULTS.markdown.gfm),
    smartypants: z.boolean().default(ASTRO_CONFIG_DEFAULTS.markdown.smartypants)
  }).default({}),
  vite: z.custom((data) => data instanceof Object && !Array.isArray(data)).default(ASTRO_CONFIG_DEFAULTS.vite),
  experimental: z.object({
    assets: z.boolean().optional().default(ASTRO_CONFIG_DEFAULTS.experimental.assets)
  }).optional().default({}),
  legacy: z.object({}).optional().default({})
});
function createRelativeSchema(cmd, fileProtocolRoot) {
  const AstroConfigRelativeSchema = AstroConfigSchema.extend({
    root: z.string().default(ASTRO_CONFIG_DEFAULTS.root).transform((val) => new URL(appendForwardSlash(val), fileProtocolRoot)),
    srcDir: z.string().default(ASTRO_CONFIG_DEFAULTS.srcDir).transform((val) => new URL(appendForwardSlash(val), fileProtocolRoot)),
    publicDir: z.string().default(ASTRO_CONFIG_DEFAULTS.publicDir).transform((val) => new URL(appendForwardSlash(val), fileProtocolRoot)),
    outDir: z.string().default(ASTRO_CONFIG_DEFAULTS.outDir).transform((val) => new URL(appendForwardSlash(val), fileProtocolRoot)),
    build: z.object({
      format: z.union([z.literal("file"), z.literal("directory")]).optional().default(ASTRO_CONFIG_DEFAULTS.build.format),
      client: z.string().optional().default(ASTRO_CONFIG_DEFAULTS.build.client).transform((val) => new URL(val, fileProtocolRoot)),
      server: z.string().optional().default(ASTRO_CONFIG_DEFAULTS.build.server).transform((val) => new URL(val, fileProtocolRoot)),
      assets: z.string().optional().default(ASTRO_CONFIG_DEFAULTS.build.assets),
      assetsPrefix: z.string().optional(),
      serverEntry: z.string().optional().default(ASTRO_CONFIG_DEFAULTS.build.serverEntry)
    }).optional().default({}),
    server: z.preprocess(
      // preprocess
      (val) => {
        if (typeof val === "function") {
          const result = val({ command: cmd === "dev" ? "dev" : "preview" });
          if (val.port)
            result.port = val.port;
          if (val.host)
            result.host = val.host;
          return result;
        } else {
          return val;
        }
      },
      // validate
      z.object({
        host: z.union([z.string(), z.boolean()]).optional().default(ASTRO_CONFIG_DEFAULTS.server.host),
        port: z.number().optional().default(ASTRO_CONFIG_DEFAULTS.server.port),
        open: z.boolean().optional().default(ASTRO_CONFIG_DEFAULTS.server.open),
        headers: z.custom().optional(),
        streaming: z.boolean().optional().default(true)
      }).optional().default({})
    )
  }).transform((config) => {
    if (!config.build.server.toString().startsWith(config.outDir.toString()) && config.build.server.toString().endsWith("dist/server/")) {
      config.build.server = new URL("./dist/server/", config.outDir);
    }
    if (!config.build.client.toString().startsWith(config.outDir.toString()) && config.build.client.toString().endsWith("dist/client/")) {
      config.build.client = new URL("./dist/client/", config.outDir);
    }
    const trimmedBase = trimSlashes(config.base);
    const sitePathname = config.site && new URL(config.site).pathname;
    if (!trimmedBase.length && sitePathname && sitePathname !== "/") {
      config.base = sitePathname;
      console.warn(`The site configuration value includes a pathname of ${sitePathname} but there is no base configuration.

A future version of Astro will stop using the site pathname when producing <link> and <script> tags. Set your site's base with the base configuration.`);
    }
    if (trimmedBase.length && config.trailingSlash === "never") {
      config.base = prependForwardSlash(trimmedBase);
    } else {
      config.base = prependForwardSlash(appendForwardSlash(trimmedBase));
    }
    return config;
  });
  return AstroConfigRelativeSchema;
}
export {
  AstroConfigSchema,
  createRelativeSchema
};
