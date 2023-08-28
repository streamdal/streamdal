import { dirname, resolve } from "path";
import { createSyncFn } from "synckit";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const compilerSync = createSyncFn(
  resolve(__dirname, "./astrojs-compiler-worker-service.mjs")
);

export function parse(...args) {
  return compilerSync("parse", ...args);
}
export function transform(...args) {
  return compilerSync("transform", ...args);
}
export function convertToTSX(...args) {
  return compilerSync("convertToTSX", ...args);
}
export function compile(...args) {
  return compilerSync("compile", ...args);
}
