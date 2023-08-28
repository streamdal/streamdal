import { createEnvironment } from "../index.js";
import { RouteCache } from "../route-cache.js";
import { createResolve } from "./resolve.js";
function createDevelopmentEnvironment(settings, logging, loader) {
  var _a;
  const mode = "development";
  let env = createEnvironment({
    adapterName: (_a = settings.adapter) == null ? void 0 : _a.name,
    logging,
    markdown: settings.config.markdown,
    mode,
    // This will be overridden in the dev server
    renderers: [],
    resolve: createResolve(loader, settings.config.root),
    routeCache: new RouteCache(logging, mode),
    site: settings.config.site,
    ssr: settings.config.output === "server",
    streaming: true,
    telemetry: Boolean(settings.forceDisableTelemetry)
  });
  return {
    ...env,
    loader,
    settings
  };
}
export {
  createDevelopmentEnvironment
};
