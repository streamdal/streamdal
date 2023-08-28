import { pathToFileURL } from "url";
import * as vite from "vite";
import loadFallbackPlugin from "../../vite-plugin-load-fallback/index.js";
async function createViteLoader(root, fs) {
  const viteServer = await vite.createServer({
    server: { middlewareMode: true, hmr: false },
    optimizeDeps: { entries: [] },
    clearScreen: false,
    appType: "custom",
    ssr: {
      // NOTE: Vite doesn't externalize linked packages by default. During testing locally,
      // these dependencies trip up Vite's dev SSR transform. Awaiting upstream feature:
      // https://github.com/vitejs/vite/pull/10939
      external: [
        "@astrojs/tailwind",
        "@astrojs/mdx",
        "@astrojs/react",
        "@astrojs/preact",
        "@astrojs/sitemap"
      ]
    },
    plugins: [loadFallbackPlugin({ fs, root: pathToFileURL(root) })]
  });
  return {
    root,
    viteServer
  };
}
async function loadConfigWithVite({
  configPath,
  fs,
  root
}) {
  if (!configPath) {
    return {
      value: {},
      filePath: void 0
    };
  }
  if (/\.[cm]?js$/.test(configPath)) {
    try {
      const config = await import(pathToFileURL(configPath).toString());
      return {
        value: config.default ?? {},
        filePath: configPath
      };
    } catch {
    }
  }
  let loader;
  try {
    loader = await createViteLoader(root, fs);
    const mod = await loader.viteServer.ssrLoadModule(configPath);
    return {
      value: mod.default ?? {},
      filePath: configPath
    };
  } finally {
    if (loader) {
      await loader.viteServer.close();
    }
  }
}
export {
  loadConfigWithVite
};
