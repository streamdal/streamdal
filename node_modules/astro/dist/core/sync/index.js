import { dim } from "kleur/colors";
import { performance } from "node:perf_hooks";
import { createServer } from "vite";
import { createContentTypesGenerator } from "../../content/index.js";
import { globalContentConfigObserver } from "../../content/utils.js";
import { runHookConfigSetup } from "../../integrations/index.js";
import { setUpEnvTs } from "../../vite-plugin-inject-env-ts/index.js";
import { getTimeStat } from "../build/util.js";
import { createVite } from "../create-vite.js";
import { AstroError, AstroErrorData, createSafeError } from "../errors/index.js";
import { info } from "../logger/core.js";
import { printHelp } from "../messages.js";
async function syncCli(settings, { logging, fs, flags }) {
  if ((flags == null ? void 0 : flags.help) || (flags == null ? void 0 : flags.h)) {
    printHelp({
      commandName: "astro sync",
      usage: "[...flags]",
      tables: {
        Flags: [["--help (-h)", "See all available flags."]]
      },
      description: `Generates TypeScript types for all Astro modules.`
    });
    return 0;
  }
  const resolvedSettings = await runHookConfigSetup({
    settings,
    logging,
    command: "build"
  });
  return sync(resolvedSettings, { logging, fs });
}
async function sync(settings, { logging, fs }) {
  const timerStart = performance.now();
  const tempViteServer = await createServer(
    await createVite(
      {
        server: { middlewareMode: true, hmr: false },
        optimizeDeps: { entries: [] },
        ssr: { external: [] },
        logLevel: "silent"
      },
      { settings, logging, mode: "build", command: "build", fs }
    )
  );
  try {
    const contentTypesGenerator = await createContentTypesGenerator({
      contentConfigObserver: globalContentConfigObserver,
      logging,
      fs,
      settings,
      viteServer: tempViteServer
    });
    const typesResult = await contentTypesGenerator.init();
    const contentConfig = globalContentConfigObserver.get();
    if (contentConfig.status === "error") {
      throw contentConfig.error;
    }
    if (typesResult.typesGenerated === false) {
      switch (typesResult.reason) {
        case "no-content-dir":
        default:
          info(logging, "content", "No content directory found. Skipping type generation.");
          return 0;
      }
    }
  } catch (e) {
    const safeError = createSafeError(e);
    throw new AstroError(
      {
        ...AstroErrorData.GenerateContentTypesError,
        message: AstroErrorData.GenerateContentTypesError.message(safeError.message)
      },
      { cause: e }
    );
  } finally {
    await tempViteServer.close();
  }
  info(logging, "content", `Types generated ${dim(getTimeStat(timerStart, performance.now()))}`);
  await setUpEnvTs({ settings, logging, fs });
  return 0;
}
export {
  sync,
  syncCli
};
