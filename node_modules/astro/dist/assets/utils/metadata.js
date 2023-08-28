import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import imageSize from "../vendor/image-size/index.js";
async function imageMetadata(src, data) {
  let file = data;
  if (!file) {
    try {
      file = await fs.readFile(src);
    } catch (e) {
      return void 0;
    }
  }
  const { width, height, type, orientation } = imageSize(file);
  const isPortrait = (orientation || 0) >= 5;
  if (!width || !height || !type) {
    return void 0;
  }
  return {
    src: fileURLToPath(src),
    width: isPortrait ? height : width,
    height: isPortrait ? width : height,
    format: type,
    orientation
  };
}
export {
  imageMetadata
};
