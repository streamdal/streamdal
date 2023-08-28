import load, { resolve } from "@proload/core";
import autoprefixerPlugin from "autoprefixer";
import fs from "fs/promises";
import path from "path";
import tailwindPlugin from "tailwindcss";
import resolveConfig from "tailwindcss/resolveConfig.js";
import { fileURLToPath } from "url";
function getDefaultTailwindConfig(srcUrl) {
  return resolveConfig({
    theme: {
      extend: {}
    },
    plugins: [],
    content: [path.join(fileURLToPath(srcUrl), `**`, `*.{astro,html,js,jsx,svelte,ts,tsx,vue}`)],
    presets: void 0
  });
}
async function getUserConfig(root, configPath, isRestart = false) {
  const resolvedRoot = fileURLToPath(root);
  let userConfigPath;
  if (configPath) {
    const configPathWithLeadingSlash = /^\.*\//.test(configPath) ? configPath : `./${configPath}`;
    userConfigPath = fileURLToPath(new URL(configPathWithLeadingSlash, root));
  }
  if (isRestart) {
    const resolvedConfigPath = await resolve("tailwind", {
      mustExist: false,
      cwd: resolvedRoot,
      filePath: userConfigPath
    });
    const { dir, base } = path.parse(resolvedConfigPath);
    const tempConfigPath = path.join(dir, `.temp.${Date.now()}.${base}`);
    await fs.copyFile(resolvedConfigPath, tempConfigPath);
    let result;
    try {
      result = await load("tailwind", {
        mustExist: false,
        cwd: resolvedRoot,
        filePath: tempConfigPath
      });
    } catch (err) {
      console.error(err);
    } finally {
      await fs.unlink(tempConfigPath);
    }
    return {
      ...result,
      filePath: resolvedConfigPath
    };
  } else {
    return await load("tailwind", {
      mustExist: false,
      cwd: resolvedRoot,
      filePath: userConfigPath
    });
  }
}
async function getPostCssConfig(root, postcssInlineOptions) {
  let postcssConfigResult;
  if (!(typeof postcssInlineOptions === "object" && postcssInlineOptions !== null)) {
    let { default: postcssrc } = await import("postcss-load-config");
    const searchPath = typeof postcssInlineOptions === "string" ? postcssInlineOptions : root;
    try {
      postcssConfigResult = await postcssrc({}, searchPath);
    } catch (e) {
      postcssConfigResult = null;
    }
  }
  return postcssConfigResult;
}
async function getViteConfiguration(tailwindConfig, viteConfig) {
  var _a;
  const postcssConfigResult = await getPostCssConfig(viteConfig.root, (_a = viteConfig.css) == null ? void 0 : _a.postcss);
  const postcssOptions = postcssConfigResult && postcssConfigResult.options || {};
  const postcssPlugins = postcssConfigResult && postcssConfigResult.plugins ? postcssConfigResult.plugins.slice() : [];
  postcssPlugins.push(tailwindPlugin(tailwindConfig));
  postcssPlugins.push(autoprefixerPlugin());
  return {
    css: {
      postcss: {
        options: postcssOptions,
        plugins: postcssPlugins
      }
    }
  };
}
function tailwindIntegration(options) {
  var _a, _b;
  const applyBaseStyles = ((_a = options == null ? void 0 : options.config) == null ? void 0 : _a.applyBaseStyles) ?? true;
  const customConfigPath = (_b = options == null ? void 0 : options.config) == null ? void 0 : _b.path;
  return {
    name: "@astrojs/tailwind",
    hooks: {
      "astro:config:setup": async ({
        config,
        updateConfig,
        injectScript,
        addWatchFile,
        isRestart
      }) => {
        const userConfig = await getUserConfig(config.root, customConfigPath, isRestart);
        if (customConfigPath && !(userConfig == null ? void 0 : userConfig.value)) {
          throw new Error(
            `Could not find a Tailwind config at ${JSON.stringify(
              customConfigPath
            )}. Does the file exist?`
          );
        }
        if (addWatchFile && (userConfig == null ? void 0 : userConfig.filePath)) {
          addWatchFile(userConfig.filePath);
        }
        const tailwindConfig = (userConfig == null ? void 0 : userConfig.value) ?? getDefaultTailwindConfig(config.srcDir);
        updateConfig({
          vite: await getViteConfiguration(tailwindConfig, config.vite)
        });
        if (applyBaseStyles) {
          injectScript("page-ssr", `import '@astrojs/tailwind/base.css';`);
        }
      }
    }
  };
}
export {
  tailwindIntegration as default
};
