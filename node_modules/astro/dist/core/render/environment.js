import { RouteCache } from "./route-cache.js";
function createEnvironment(options) {
  return options;
}
function createBasicEnvironment(options) {
  const mode = options.mode ?? "development";
  return createEnvironment({
    ...options,
    markdown: {
      ...options.markdown ?? {}
    },
    mode,
    renderers: options.renderers ?? [],
    resolve: options.resolve ?? ((s) => Promise.resolve(s)),
    routeCache: new RouteCache(options.logging, mode),
    ssr: options.ssr ?? true,
    streaming: options.streaming ?? true,
    telemetry: false
  });
}
export {
  createBasicEnvironment,
  createEnvironment
};
