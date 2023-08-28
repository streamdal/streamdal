import { dirname, resolve } from "path";
import { runAsWorker } from "synckit";
import { fileURLToPath } from "url";
import { Worker } from "worker_threads";

// When some error occurs in @astrojs/compiler, the worker may be terminated.
// So calling @astrojs/compiler directly on this worker may hang calls via `synckit`.
// This worker creates a child worker to process @astrojs/compiler, and if an error occurs in the child worker,
// it terminates the child worker and recreates it to prevent hangs.
// Related to https://github.com/ota-meshi/eslint-plugin-astro/issues/99

const __dirname = dirname(fileURLToPath(import.meta.url));
const workerPath = resolve(__dirname, "./astrojs-compiler-worker.mjs");

/**
 * @typedef {Object} Process
 * @property {(v: any) => void} resolve
 * @property {(v: any) => void} reject
 */

/** @type {Worker | undefined} */
let worker;

let seq = 0;
/** @type {Map<number, Process>} */
const processMap = new Map();
/** @type {Set<()=>boolean>} */
const terminateRemainingProcessList = new Set();

function onMessage({ id, result, error, properties }) {
  const proc = processMap.get(id);
  processMap.delete(id);

  if (error) {
    proc?.reject(Object.assign(error, properties));
    terminateWorker();
  } else {
    proc?.resolve(result);
    terminateRemainingProcesses();
  }
}

function terminateWorker() {
  const remaining = new Set(processMap.keys());
  const targetWorker = worker;
  worker = null;

  terminateRemainingProcessList.add(tryTerminate);
  terminateRemainingProcesses();

  function tryTerminate() {
    if (!targetWorker) {
      return true;
    }
    for (const id of [...remaining]) {
      if (!processMap.has(id)) {
        remaining.delete(id);
      }
    }
    if (remaining.size === 0) {
      targetWorker.terminate();
      return true;
    }
    return false;
  }
}

function terminateRemainingProcesses() {
  for (const proc of [...terminateRemainingProcessList]) {
    if (proc()) {
      terminateRemainingProcessList.delete(proc);
    }
  }
}

runAsWorker((method, ...args) => {
  if (!worker) {
    worker = new Worker(workerPath, {});
    worker.on("message", onMessage);
    worker.on("exit", terminateWorker);
    worker.on("error", terminateWorker);
    worker.unref();
  }
  return new Promise((resolve, reject) => {
    const id = seq++;
    processMap.set(id, { resolve, reject });
    setTimeout(() => {
      if (processMap.delete(id)) {
        terminateWorker();
        reject(
          new Error(
            "Timeout: More than 10 seconds passed for parsing. Possible unexpected error."
          )
        );
      }
    }, 10000);
    worker.postMessage({ id, method, args });
  });
});
