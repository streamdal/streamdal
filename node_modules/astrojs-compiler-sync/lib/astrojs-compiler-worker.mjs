import * as compiler from "@astrojs/compiler";
import { parentPort } from "worker_threads";

try {
  parentPort.on("message", async ({ id, method, args }) => {
    let msg;
    try {
      msg = { id, result: await compiler[method](...args) };
    } catch (error) {
      msg = { id, error, properties: extractProperties(error) };
    }
    parentPort.postMessage(msg);
  });
} catch (error) {
  parentPort.on("message", ({ id }) => {
    parentPort.postMessage({
      id,
      error,
      properties: extractProperties(error),
    });
  });
}

function extractProperties(object) {
  if (object && typeof object === "object") {
    const properties = {};
    for (const key in object) {
      properties[key] = object[key];
    }
    return properties;
  }
  return object;
}
