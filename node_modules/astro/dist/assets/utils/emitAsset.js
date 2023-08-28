import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import slash from "slash";
import { imageMetadata } from "./metadata.js";
async function emitESMImage(id, watchMode, fileEmitter, settings) {
  if (!id) {
    return void 0;
  }
  const url = pathToFileURL(id);
  const meta = await imageMetadata(url);
  if (!meta) {
    return void 0;
  }
  if (!watchMode) {
    const pathname = decodeURI(url.pathname);
    const filename = path.basename(pathname, path.extname(pathname) + `.${meta.format}`);
    const handle = fileEmitter({
      name: filename,
      source: await fs.promises.readFile(url),
      type: "asset"
    });
    meta.src = `__ASTRO_ASSET_IMAGE__${handle}__`;
  } else {
    url.searchParams.append("origWidth", meta.width.toString());
    url.searchParams.append("origHeight", meta.height.toString());
    url.searchParams.append("origFormat", meta.format);
    meta.src = rootRelativePath(settings.config, url);
  }
  return meta;
}
function rootRelativePath(config, url) {
  const basePath = fileURLToNormalizedPath(url);
  const rootPath = fileURLToNormalizedPath(config.root);
  return prependForwardSlash(basePath.slice(rootPath.length));
}
function prependForwardSlash(filePath) {
  return filePath[0] === "/" ? filePath : "/" + filePath;
}
function fileURLToNormalizedPath(filePath) {
  return slash(fileURLToPath(filePath) + filePath.search).replace(/\\/g, "/");
}
function emoji(char, fallback) {
  return process.platform !== "win32" ? char : fallback;
}
export {
  emitESMImage,
  emoji
};
