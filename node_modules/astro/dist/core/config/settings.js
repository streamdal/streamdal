import { SUPPORTED_MARKDOWN_FILE_EXTENSIONS } from "./../constants.js";
import { fileURLToPath, pathToFileURL } from "url";
import jsxRenderer from "../../jsx/renderer.js";
import { markdownContentEntryType } from "../../vite-plugin-markdown/content-entry-type.js";
import { createDefaultDevConfig } from "./config.js";
import { AstroTimer } from "./timer.js";
import { loadTSConfig } from "./tsconfig.js";
function createBaseSettings(config) {
  return {
    config,
    tsConfig: void 0,
    tsConfigPath: void 0,
    adapter: void 0,
    injectedRoutes: config.experimental.assets && config.output === "server" ? [{ pattern: "/_image", entryPoint: "astro/assets/image-endpoint" }] : [],
    pageExtensions: [".astro", ".html", ...SUPPORTED_MARKDOWN_FILE_EXTENSIONS],
    contentEntryTypes: [markdownContentEntryType],
    renderers: [jsxRenderer],
    scripts: [],
    watchFiles: [],
    forceDisableTelemetry: false,
    timer: new AstroTimer()
  };
}
function createSettings(config, cwd) {
  const tsconfig = loadTSConfig(cwd);
  const settings = createBaseSettings(config);
  const watchFiles = (tsconfig == null ? void 0 : tsconfig.exists) ? [tsconfig.path, ...tsconfig.extendedPaths] : [];
  if (cwd) {
    watchFiles.push(fileURLToPath(new URL("./package.json", pathToFileURL(cwd))));
  }
  settings.tsConfig = tsconfig == null ? void 0 : tsconfig.config;
  settings.tsConfigPath = tsconfig == null ? void 0 : tsconfig.path;
  settings.watchFiles = watchFiles;
  return settings;
}
async function createDefaultDevSettings(userConfig = {}, root) {
  if (root && typeof root !== "string") {
    root = fileURLToPath(root);
  }
  const config = await createDefaultDevConfig(userConfig, root);
  return createBaseSettings(config);
}
export {
  createBaseSettings,
  createDefaultDevSettings,
  createSettings
};
