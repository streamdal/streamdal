import { PROPAGATED_ASSET_FLAG } from "../../../content/consts.js";
import { prependForwardSlash } from "../../../core/path.js";
import { getTopLevelPages, moduleIsTopLevelPage, walkParentInfos } from "../graph.js";
import { getPageDataByViteID, trackClientOnlyPageDatas } from "../internal.js";
function isPropagatedAsset(id) {
  try {
    return new URL("file://" + id).searchParams.has(PROPAGATED_ASSET_FLAG);
  } catch {
    return false;
  }
}
function vitePluginAnalyzer(internals) {
  function hoistedScriptScanner() {
    const uniqueHoistedIds = /* @__PURE__ */ new Map();
    const pageScripts = /* @__PURE__ */ new Map();
    return {
      scan(scripts, from) {
        var _a;
        const hoistedScripts = /* @__PURE__ */ new Set();
        for (let i = 0; i < scripts.length; i++) {
          const hid = `${from.replace("/@fs", "")}?astro&type=script&index=${i}&lang.ts`;
          hoistedScripts.add(hid);
        }
        if (hoistedScripts.size) {
          for (const [parentInfo] of walkParentInfos(from, this, function until(importer) {
            return isPropagatedAsset(importer);
          })) {
            if (isPropagatedAsset(parentInfo.id)) {
              for (const [nestedParentInfo] of walkParentInfos(from, this)) {
                if (moduleIsTopLevelPage(nestedParentInfo)) {
                  for (const hid of hoistedScripts) {
                    if (!pageScripts.has(nestedParentInfo.id)) {
                      pageScripts.set(nestedParentInfo.id, {
                        hoistedSet: /* @__PURE__ */ new Set(),
                        propagatedMapByImporter: /* @__PURE__ */ new Map()
                      });
                    }
                    const entry = pageScripts.get(nestedParentInfo.id);
                    if (!entry.propagatedMapByImporter.has(parentInfo.id)) {
                      entry.propagatedMapByImporter.set(parentInfo.id, /* @__PURE__ */ new Set());
                    }
                    entry.propagatedMapByImporter.get(parentInfo.id).add(hid);
                  }
                }
              }
            } else if (moduleIsTopLevelPage(parentInfo)) {
              for (const hid of hoistedScripts) {
                if (!pageScripts.has(parentInfo.id)) {
                  pageScripts.set(parentInfo.id, {
                    hoistedSet: /* @__PURE__ */ new Set(),
                    propagatedMapByImporter: /* @__PURE__ */ new Map()
                  });
                }
                (_a = pageScripts.get(parentInfo.id)) == null ? void 0 : _a.hoistedSet.add(hid);
              }
            }
          }
        }
      },
      finalize() {
        for (const [pageId, { hoistedSet, propagatedMapByImporter }] of pageScripts) {
          const pageData = getPageDataByViteID(internals, pageId);
          if (!pageData)
            continue;
          const { component } = pageData;
          const astroModuleId = prependForwardSlash(component);
          const uniqueHoistedId = JSON.stringify(Array.from(hoistedSet).sort());
          let moduleId;
          if (uniqueHoistedIds.has(uniqueHoistedId)) {
            moduleId = uniqueHoistedIds.get(uniqueHoistedId);
          } else {
            moduleId = `/astro/hoisted.js?q=${uniqueHoistedIds.size}`;
            uniqueHoistedIds.set(uniqueHoistedId, moduleId);
          }
          internals.discoveredScripts.add(moduleId);
          pageData.propagatedScripts = propagatedMapByImporter;
          for (const propagatedScripts of propagatedMapByImporter.values()) {
            for (const propagatedScript of propagatedScripts) {
              internals.discoveredScripts.add(propagatedScript);
            }
          }
          if (internals.hoistedScriptIdToPagesMap.has(moduleId)) {
            const pages = internals.hoistedScriptIdToPagesMap.get(moduleId);
            pages.add(astroModuleId);
          } else {
            internals.hoistedScriptIdToPagesMap.set(moduleId, /* @__PURE__ */ new Set([astroModuleId]));
            internals.hoistedScriptIdToHoistedMap.set(moduleId, hoistedSet);
          }
        }
      }
    };
  }
  return {
    name: "@astro/rollup-plugin-astro-analyzer",
    async generateBundle() {
      var _a;
      const hoistScanner = hoistedScriptScanner();
      const ids = this.getModuleIds();
      for (const id of ids) {
        const info = this.getModuleInfo(id);
        if (!info || !((_a = info.meta) == null ? void 0 : _a.astro))
          continue;
        const astro = info.meta.astro;
        const pageData = getPageDataByViteID(internals, id);
        if (pageData) {
          internals.pageOptionsByPage.set(id, astro.pageOptions);
        }
        for (const c of astro.hydratedComponents) {
          const rid = c.resolvedPath ? decodeURI(c.resolvedPath) : c.specifier;
          if (internals.discoveredHydratedComponents.has(rid)) {
            const exportNames = internals.discoveredHydratedComponents.get(rid);
            exportNames == null ? void 0 : exportNames.push(c.exportName);
          } else {
            internals.discoveredHydratedComponents.set(rid, [c.exportName]);
          }
        }
        hoistScanner.scan.call(this, astro.scripts, id);
        if (astro.clientOnlyComponents.length) {
          const clientOnlys = [];
          for (const c of astro.clientOnlyComponents) {
            const cid = c.resolvedPath ? decodeURI(c.resolvedPath) : c.specifier;
            if (internals.discoveredClientOnlyComponents.has(cid)) {
              const exportNames = internals.discoveredClientOnlyComponents.get(cid);
              exportNames == null ? void 0 : exportNames.push(c.exportName);
            } else {
              internals.discoveredClientOnlyComponents.set(cid, [c.exportName]);
            }
            clientOnlys.push(cid);
            const resolvedId = await this.resolve(c.specifier, id);
            if (resolvedId) {
              clientOnlys.push(resolvedId.id);
            }
          }
          for (const [pageInfo] of getTopLevelPages(id, this)) {
            const newPageData = getPageDataByViteID(internals, pageInfo.id);
            if (!newPageData)
              continue;
            trackClientOnlyPageDatas(internals, newPageData, clientOnlys);
          }
        }
      }
      hoistScanner.finalize();
    }
  };
}
function pluginAnalyzer(internals) {
  return {
    build: "ssr",
    hooks: {
      "build:before": () => {
        return {
          vitePlugin: vitePluginAnalyzer(internals)
        };
      }
    }
  };
}
export {
  pluginAnalyzer,
  vitePluginAnalyzer
};
