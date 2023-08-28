import npath from "path";
import { PROPAGATED_ASSET_FLAG } from "../../../content/consts.js";
import { SUPPORTED_MARKDOWN_FILE_EXTENSIONS } from "../../constants.js";
import { unwrapId } from "../../util.js";
import { isCSSRequest } from "./util.js";
const fileExtensionsToSSR = /* @__PURE__ */ new Set([".astro", ...SUPPORTED_MARKDOWN_FILE_EXTENSIONS]);
const STRIP_QUERY_PARAMS_REGEX = /\?.*$/;
async function* crawlGraph(loader, _id, isRootFile, scanned = /* @__PURE__ */ new Set()) {
  const id = unwrapId(_id);
  const importedModules = /* @__PURE__ */ new Set();
  if (new URL(id, "file://").searchParams.has(PROPAGATED_ASSET_FLAG))
    return;
  const moduleEntriesForId = isRootFile ? (
    // "getModulesByFile" pulls from a delayed module cache (fun implementation detail),
    // So we can get up-to-date info on initial server load.
    // Needed for slower CSS preprocessing like Tailwind
    loader.getModulesByFile(id) ?? /* @__PURE__ */ new Set()
  ) : (
    // For non-root files, we're safe to pull from "getModuleById" based on testing.
    // TODO: Find better invalidation strat to use "getModuleById" in all cases!
    /* @__PURE__ */ new Set([loader.getModuleById(id)])
  );
  for (const entry of moduleEntriesForId) {
    if (!entry) {
      continue;
    }
    if (id === entry.id) {
      scanned.add(id);
      const entryIsStyle = isCSSRequest(id);
      for (const importedModule of entry.importedModules) {
        if (importedModule.id) {
          const importedModulePathname = importedModule.id.replace(STRIP_QUERY_PARAMS_REGEX, "");
          if (entryIsStyle && !isCSSRequest(importedModulePathname)) {
            continue;
          }
          if (fileExtensionsToSSR.has(
            npath.extname(
              // Use `id` instead of `pathname` to preserve query params.
              // Should not SSR a module with an unexpected query param,
              // like "?astroPropagatedAssets"
              importedModule.id
            )
          )) {
            const mod = loader.getModuleById(importedModule.id);
            if (!(mod == null ? void 0 : mod.ssrModule)) {
              try {
                await loader.import(importedModule.id);
              } catch {
              }
            }
          }
        }
        importedModules.add(importedModule);
      }
    }
  }
  for (const importedModule of importedModules) {
    if (!importedModule.id || scanned.has(importedModule.id)) {
      continue;
    }
    yield importedModule;
    yield* crawlGraph(loader, importedModule.id, false, scanned);
  }
}
export {
  crawlGraph
};
