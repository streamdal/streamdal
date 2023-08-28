import { normalizePath } from "vite";
import { isEndpoint, isPage } from "../core/util.js";
import { scan } from "./scan.js";
function astroScannerPlugin({ settings }) {
  return {
    name: "astro:scanner",
    enforce: "post",
    async transform(code, id, options) {
      if (!(options == null ? void 0 : options.ssr))
        return;
      const filename = normalizePath(id);
      let fileURL;
      try {
        fileURL = new URL(`file://${filename}`);
      } catch (e) {
        return;
      }
      const fileIsPage = isPage(fileURL, settings);
      const fileIsEndpoint = isEndpoint(fileURL, settings);
      if (!(fileIsPage || fileIsEndpoint))
        return;
      const pageOptions = await scan(code, id);
      const { meta = {} } = this.getModuleInfo(id) ?? {};
      return {
        code,
        map: null,
        meta: {
          ...meta,
          astro: {
            ...meta.astro ?? { hydratedComponents: [], clientOnlyComponents: [], scripts: [] },
            pageOptions
          }
        }
      };
    }
  };
}
export {
  astroScannerPlugin as default
};
