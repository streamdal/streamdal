/* globals fetch -- web */
let waitSetupForAstroCompilerWasm;

function getService() {
  return globalThis["@astrojs/compiler"] || setup();
}

/**
 * Parse code by `@astrojs/compiler`
 */
export function parse(code, options) {
  const service = getService();
  if (typeof service.then === "function") {
    return service.then(() => parse(code, options));
  }
  const { ast, ...other } = getService().parse(code, options);
  return { ...other, ast: JSON.parse(ast) };
}

/** setup */
export function setup(astroVersion) {
  return (
    waitSetupForAstroCompilerWasm ||
    (waitSetupForAstroCompilerWasm = setupImpl(astroVersion))
  );
}

async function setupImpl(astroVersion) {
  const [{ default: Go }, wasmBuffer] = await Promise.all([
    import("./wasm_exec.mjs"),
    fetch(
      `https://unpkg.com/@astrojs/compiler${
        astroVersion ? `@${astroVersion}` : ""
      }/astro.wasm`
    ).then((response) => response.arrayBuffer()),
  ]);

  const go = new Go();
  try {
    const mod = await WebAssembly.compile(wasmBuffer);
    const instance = await WebAssembly.instantiate(mod, go.importObject);
    go.run(instance);

    return watch();
  } catch (e) {
    // eslint-disable-next-line no-console -- log
    console.log(e);
    throw e;
  }

  function watch() {
    return new Promise((resolve) => {
      if (globalThis["@astrojs/compiler"]) {
        resolve(globalThis["@astrojs/compiler"]);
      } else {
        setTimeout(() => {
          resolve(watch());
        }, 100);
      }
    });
  }
}
