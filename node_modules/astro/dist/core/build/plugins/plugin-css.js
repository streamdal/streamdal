import * as crypto from "node:crypto";
import * as npath from "node:path";
import { isBuildableCSSRequest } from "../../render/dev/util.js";
import { PROPAGATED_ASSET_FLAG } from "../../../content/consts.js";
import * as assetName from "../css-asset-name.js";
import { moduleIsTopLevelPage, walkParentInfos } from "../graph.js";
import {
  eachPageData,
  getPageDataByViteID,
  getPageDatasByClientOnlyID,
  getPageDatasByHoistedScriptId,
  isHoistedScript
} from "../internal.js";
import { extendManualChunks } from "./util.js";
function rollupPluginAstroBuildCSS(options) {
  const { internals, buildOptions } = options;
  const { settings } = buildOptions;
  let resolvedConfig;
  function createNameHash(baseId, hashIds) {
    const baseName = baseId ? npath.parse(baseId).name : "index";
    const hash = crypto.createHash("sha256");
    for (const id of hashIds) {
      hash.update(id, "utf-8");
    }
    const h = hash.digest("hex").slice(0, 8);
    const proposedName = baseName + "." + h;
    return proposedName;
  }
  function* getParentClientOnlys(id, ctx) {
    for (const [info] of walkParentInfos(id, ctx)) {
      yield* getPageDatasByClientOnlyID(internals, info.id);
    }
  }
  return [
    {
      name: "astro:rollup-plugin-build-css",
      transform(_, id) {
        if (options.target === "client" && internals.cssChunkModuleIds.has(id)) {
          return "";
        }
      },
      outputOptions(outputOptions) {
        if (options.target === "client")
          return;
        const assetFileNames = outputOptions.assetFileNames;
        const namingIncludesHash = assetFileNames == null ? void 0 : assetFileNames.toString().includes("[hash]");
        const createNameForParentPages = namingIncludesHash ? assetName.shortHashedName : assetName.createSlugger(settings);
        extendManualChunks(outputOptions, {
          after(id, meta) {
            if (isBuildableCSSRequest(id)) {
              for (const [pageInfo] of walkParentInfos(id, {
                getModuleInfo: meta.getModuleInfo
              })) {
                if (new URL(pageInfo.id, "file://").searchParams.has(PROPAGATED_ASSET_FLAG)) {
                  return createNameHash(id, [id]);
                }
              }
              return createNameForParentPages(id, meta);
            }
          }
        });
      },
      async generateBundle(_outputOptions, bundle) {
        const appendCSSToPage = (pageData, meta, depth, order) => {
          for (const importedCssImport of meta.importedCss) {
            if (pageData == null ? void 0 : pageData.css.has(importedCssImport)) {
              const cssInfo = pageData == null ? void 0 : pageData.css.get(importedCssImport);
              if (depth < cssInfo.depth) {
                cssInfo.depth = depth;
              }
              if (cssInfo.order === -1) {
                cssInfo.order = order;
              } else if (order < cssInfo.order && order > -1) {
                cssInfo.order = order;
              }
            } else {
              pageData == null ? void 0 : pageData.css.set(importedCssImport, { depth, order });
            }
          }
        };
        for (const [_, chunk] of Object.entries(bundle)) {
          if (chunk.type === "chunk") {
            const c = chunk;
            if ("viteMetadata" in chunk) {
              const meta = chunk["viteMetadata"];
              if (meta.importedCss.size) {
                if (options.target === "server") {
                  for (const id of Object.keys(c.modules)) {
                    internals.cssChunkModuleIds.add(id);
                  }
                }
                if (options.target === "client") {
                  for (const id of Object.keys(c.modules)) {
                    for (const pageData of getParentClientOnlys(id, this)) {
                      for (const importedCssImport of meta.importedCss) {
                        pageData.css.set(importedCssImport, { depth: -1, order: -1 });
                      }
                    }
                  }
                }
                for (const id of Object.keys(c.modules)) {
                  for (const [pageInfo, depth, order] of walkParentInfos(
                    id,
                    this,
                    function until(importer) {
                      return new URL(importer, "file://").searchParams.has(PROPAGATED_ASSET_FLAG);
                    }
                  )) {
                    if (new URL(pageInfo.id, "file://").searchParams.has(PROPAGATED_ASSET_FLAG)) {
                      for (const parent of walkParentInfos(id, this)) {
                        const parentInfo = parent[0];
                        if (moduleIsTopLevelPage(parentInfo)) {
                          const pageViteID = parentInfo.id;
                          const pageData = getPageDataByViteID(internals, pageViteID);
                          if (pageData) {
                            for (const css of meta.importedCss) {
                              const existingCss = pageData.propagatedStyles.get(pageInfo.id) ?? /* @__PURE__ */ new Set();
                              pageData.propagatedStyles.set(
                                pageInfo.id,
                                /* @__PURE__ */ new Set([...existingCss, css])
                              );
                            }
                          }
                        }
                      }
                    } else if (moduleIsTopLevelPage(pageInfo)) {
                      const pageViteID = pageInfo.id;
                      const pageData = getPageDataByViteID(internals, pageViteID);
                      if (pageData) {
                        appendCSSToPage(pageData, meta, depth, order);
                      }
                    } else if (options.target === "client" && isHoistedScript(internals, pageInfo.id)) {
                      for (const pageData of getPageDatasByHoistedScriptId(
                        internals,
                        pageInfo.id
                      )) {
                        appendCSSToPage(pageData, meta, -1, order);
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    {
      name: "astro:rollup-plugin-single-css",
      enforce: "post",
      configResolved(config) {
        resolvedConfig = config;
      },
      generateBundle(_, bundle) {
        if (!resolvedConfig.build.cssCodeSplit) {
          const cssChunk = Object.values(bundle).find(
            (chunk) => chunk.type === "asset" && chunk.name === "style.css"
          );
          if (cssChunk) {
            for (const pageData of eachPageData(internals)) {
              pageData.css.set(cssChunk.fileName, { depth: -1, order: -1 });
            }
          }
        }
      }
    }
  ];
}
function pluginCSS(options, internals) {
  return {
    build: "both",
    hooks: {
      "build:before": ({ build }) => {
        let plugins = rollupPluginAstroBuildCSS({
          buildOptions: options,
          internals,
          target: build === "ssr" ? "server" : "client"
        });
        return {
          vitePlugin: plugins
        };
      }
    }
  };
}
export {
  pluginCSS,
  rollupPluginAstroBuildCSS
};
