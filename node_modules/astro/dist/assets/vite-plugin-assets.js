import { bold } from "kleur/colors";
import MagicString from "magic-string";
import mime from "mime/lite.js";
import fs from "node:fs/promises";
import { Readable } from "node:stream";
import { fileURLToPath } from "node:url";
import { normalizePath } from "vite";
import { error } from "../core/logger/core.js";
import { appendForwardSlash, joinPaths, prependForwardSlash } from "../core/path.js";
import { VIRTUAL_MODULE_ID, VIRTUAL_SERVICE_ID } from "./consts.js";
import { isESMImportedImage } from "./internal.js";
import { isLocalService } from "./services/service.js";
import { emitESMImage } from "./utils/emitAsset.js";
import { imageMetadata } from "./utils/metadata.js";
import { getOrigQueryParams } from "./utils/queryParams.js";
import { hashTransform, propsToFilename } from "./utils/transformToPath.js";
const resolvedVirtualModuleId = "\0" + VIRTUAL_MODULE_ID;
function assets({
  settings,
  logging,
  mode
}) {
  var _a;
  let resolvedConfig;
  globalThis.astroAsset = {};
  const UNSUPPORTED_ADAPTERS = /* @__PURE__ */ new Set([
    "@astrojs/cloudflare",
    "@astrojs/deno",
    "@astrojs/netlify/edge-functions",
    "@astrojs/vercel/edge"
  ]);
  const adapterName = (_a = settings.config.adapter) == null ? void 0 : _a.name;
  if (["astro/assets/services/sharp", "astro/assets/services/squoosh"].includes(
    settings.config.image.service
  ) && adapterName && UNSUPPORTED_ADAPTERS.has(adapterName)) {
    error(
      logging,
      "assets",
      `The currently selected adapter \`${adapterName}\` does not run on Node, however the currently used image service depends on Node built-ins. ${bold(
        "Your project will NOT be able to build."
      )}`
    );
  }
  return [
    // Expose the components and different utilities from `astro:assets` and handle serving images from `/_image` in dev
    {
      name: "astro:assets",
      config() {
        return {
          resolve: {
            alias: [
              {
                find: /^~\/assets\/(.+)$/,
                replacement: fileURLToPath(new URL("./assets/$1", settings.config.srcDir))
              }
            ]
          }
        };
      },
      async resolveId(id) {
        if (id === VIRTUAL_SERVICE_ID) {
          return await this.resolve(settings.config.image.service);
        }
        if (id === VIRTUAL_MODULE_ID) {
          return resolvedVirtualModuleId;
        }
      },
      load(id) {
        if (id === resolvedVirtualModuleId) {
          return `
					export { getImage, getConfiguredImageService, isLocalService } from "astro/assets";
					export { default as Image } from "astro/components/Image.astro";
				`;
        }
      },
      // Handle serving images during development
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          var _a2;
          if ((_a2 = req.url) == null ? void 0 : _a2.startsWith("/_image")) {
            if (!isLocalService(globalThis.astroAsset.imageService)) {
              return next();
            }
            const url = new URL(req.url, "file:");
            const filePath = url.searchParams.get("href");
            if (!filePath) {
              return next();
            }
            const filePathURL = new URL("." + filePath, settings.config.root);
            const file = await fs.readFile(filePathURL);
            let meta = getOrigQueryParams(filePathURL.searchParams);
            if (!meta) {
              meta = await imageMetadata(filePathURL, file);
              if (!meta) {
                return next();
              }
            }
            const transform = await globalThis.astroAsset.imageService.parseURL(url);
            if (transform === void 0) {
              error(logging, "image", `Failed to parse transform for ${url}`);
            }
            let data = file;
            let format = meta.format;
            if (transform) {
              const result = await globalThis.astroAsset.imageService.transform(file, transform);
              data = result.data;
              format = result.format;
            }
            res.setHeader("Content-Type", mime.getType(format) ?? `image/${format}`);
            res.setHeader("Cache-Control", "max-age=360000");
            const stream = Readable.from(data);
            return stream.pipe(res);
          }
          return next();
        });
      },
      buildStart() {
        if (mode != "build") {
          return;
        }
        globalThis.astroAsset.addStaticImage = (options) => {
          if (!globalThis.astroAsset.staticImages) {
            globalThis.astroAsset.staticImages = /* @__PURE__ */ new Map();
          }
          const hash = hashTransform(options, settings.config.image.service);
          let filePath;
          if (globalThis.astroAsset.staticImages.has(hash)) {
            filePath = globalThis.astroAsset.staticImages.get(hash).path;
          } else {
            if (!isESMImportedImage(options.src)) {
              return options.src;
            }
            filePath = prependForwardSlash(
              joinPaths(settings.config.build.assets, propsToFilename(options, hash))
            );
            globalThis.astroAsset.staticImages.set(hash, { path: filePath, options });
          }
          if (settings.config.build.assetsPrefix) {
            return joinPaths(settings.config.build.assetsPrefix, filePath);
          } else {
            return prependForwardSlash(joinPaths(settings.config.base, filePath));
          }
        };
      },
      // In build, rewrite paths to ESM imported images in code to their final location
      async renderChunk(code) {
        const assetUrlRE = /__ASTRO_ASSET_IMAGE__([a-z\d]{8})__(?:_(.*?)__)?/g;
        let match;
        let s;
        while (match = assetUrlRE.exec(code)) {
          s = s || (s = new MagicString(code));
          const [full, hash, postfix = ""] = match;
          const file = this.getFileName(hash);
          const prefix = settings.config.build.assetsPrefix ? appendForwardSlash(settings.config.build.assetsPrefix) : resolvedConfig.base;
          const outputFilepath = prefix + normalizePath(file + postfix);
          s.overwrite(match.index, match.index + full.length, outputFilepath);
        }
        if (s) {
          return {
            code: s.toString(),
            map: resolvedConfig.build.sourcemap ? s.generateMap({ hires: true }) : null
          };
        } else {
          return null;
        }
      }
    },
    // Return a more advanced shape for images imported in ESM
    {
      name: "astro:assets:esm",
      enforce: "pre",
      configResolved(viteConfig) {
        resolvedConfig = viteConfig;
      },
      async load(id) {
        if (/\.(jpeg|jpg|png|tiff|webp|gif|svg)$/.test(id)) {
          const meta = await emitESMImage(id, this.meta.watchMode, this.emitFile, settings);
          return `export default ${JSON.stringify(meta)}`;
        }
      }
    }
  ];
}
export {
  assets as default
};
