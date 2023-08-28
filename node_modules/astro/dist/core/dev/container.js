import nodeFs from "fs";
import * as vite from "vite";
import {
  runHookConfigDone,
  runHookConfigSetup,
  runHookServerDone,
  runHookServerStart
} from "../../integrations/index.js";
import { createDefaultDevSettings, resolveRoot } from "../config/index.js";
import { createVite } from "../create-vite.js";
import { nodeLogDestination } from "../logger/node.js";
import { appendForwardSlash } from "../path.js";
import { apply as applyPolyfill } from "../polyfill.js";
const defaultLogging = {
  dest: nodeLogDestination,
  level: "error"
};
async function createContainer(params = {}) {
  let {
    isRestart = false,
    logging = defaultLogging,
    settings = await createDefaultDevSettings(params.userConfig, params.root),
    fs = nodeFs,
    disableTelemetry
  } = params;
  if (disableTelemetry) {
    settings.forceDisableTelemetry = true;
  }
  applyPolyfill();
  settings = await runHookConfigSetup({
    settings,
    command: "dev",
    logging,
    isRestart
  });
  const { host, headers, open } = settings.config.server;
  const rendererClientEntries = settings.renderers.map((r) => r.clientEntrypoint).filter(Boolean);
  const viteConfig = await createVite(
    {
      mode: "development",
      server: { host, headers, open },
      optimizeDeps: {
        include: rendererClientEntries
      }
    },
    { settings, logging, mode: "dev", command: "dev", fs }
  );
  await runHookConfigDone({ settings, logging });
  const viteServer = await vite.createServer(viteConfig);
  const container = {
    configFlag: params.configFlag,
    configFlagPath: params.configFlagPath,
    fs,
    logging,
    resolvedRoot: appendForwardSlash(resolveRoot(params.root)),
    restartInFlight: false,
    settings,
    viteConfig,
    viteServer,
    handle(req, res) {
      viteServer.middlewares.handle(req, res, Function.prototype);
    },
    // TODO deprecate and remove
    close() {
      return closeContainer(container);
    }
  };
  return container;
}
async function closeContainer({ viteServer, settings, logging }) {
  await viteServer.close();
  await runHookServerDone({
    config: settings.config,
    logging
  });
}
async function startContainer({
  settings,
  viteServer,
  logging
}) {
  const { port } = settings.config.server;
  await viteServer.listen(port);
  const devServerAddressInfo = viteServer.httpServer.address();
  await runHookServerStart({
    config: settings.config,
    address: devServerAddressInfo,
    logging
  });
  return devServerAddressInfo;
}
function isStarted(container) {
  var _a;
  return !!((_a = container.viteServer.httpServer) == null ? void 0 : _a.listening);
}
async function runInContainer(params, callback) {
  const container = await createContainer({ ...params, disableTelemetry: true });
  try {
    await callback(container);
  } finally {
    await container.close();
  }
}
export {
  createContainer,
  isStarted,
  runInContainer,
  startContainer
};
