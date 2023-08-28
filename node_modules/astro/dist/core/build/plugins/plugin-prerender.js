import { extendManualChunks } from "./util.js";
function vitePluginPrerender(opts, internals) {
  return {
    name: "astro:rollup-plugin-prerender",
    outputOptions(outputOptions) {
      extendManualChunks(outputOptions, {
        after(id, meta) {
          var _a, _b, _c;
          if (id.includes("astro/dist")) {
            return "astro";
          }
          const pageInfo = internals.pagesByViteID.get(id);
          if (pageInfo) {
            if ((_c = (_b = (_a = meta.getModuleInfo(id)) == null ? void 0 : _a.meta.astro) == null ? void 0 : _b.pageOptions) == null ? void 0 : _c.prerender) {
              pageInfo.route.prerender = true;
              return "prerender";
            }
            return `pages/all`;
          }
        }
      });
    }
  };
}
function pluginPrerender(opts, internals) {
  return {
    build: "ssr",
    hooks: {
      "build:before": () => {
        return {
          vitePlugin: vitePluginPrerender(opts, internals)
        };
      }
    }
  };
}
export {
  pluginPrerender,
  vitePluginPrerender
};
