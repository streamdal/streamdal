import { markdownConfigDefaults } from "@astrojs/markdown-remark";
import { toRemarkInitializeAstroData } from "@astrojs/markdown-remark/dist/internal.js";
import { compile as mdxCompile } from "@mdx-js/mdx";
import mdxPlugin from "@mdx-js/rollup";
import { parse as parseESM } from "es-module-lexer";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { SourceMapGenerator } from "source-map";
import { VFile } from "vfile";
import { getRehypePlugins, getRemarkPlugins, recmaInjectImportMetaEnvPlugin } from "./plugins.js";
import { getFileInfo, ignoreStringPlugins, parseFrontmatter } from "./utils.js";
function mdx(partialMdxOptions = {}) {
  return {
    name: "@astrojs/mdx",
    hooks: {
      "astro:config:setup": async (params) => {
        const { updateConfig, config, addPageExtension, addContentEntryType, command } = params;
        addPageExtension(".mdx");
        addContentEntryType({
          extensions: [".mdx"],
          async getEntryInfo({ fileUrl, contents }) {
            const parsed = parseFrontmatter(contents, fileURLToPath(fileUrl));
            return {
              data: parsed.data,
              body: parsed.content,
              slug: parsed.data.slug,
              rawData: parsed.matter
            };
          },
          contentModuleTypes: await fs.readFile(
            new URL("../template/content-module-types.d.ts", import.meta.url),
            "utf-8"
          )
        });
        const extendMarkdownConfig = partialMdxOptions.extendMarkdownConfig ?? defaultMdxOptions.extendMarkdownConfig;
        const mdxOptions = applyDefaultOptions({
          options: partialMdxOptions,
          defaults: markdownConfigToMdxOptions(
            extendMarkdownConfig ? config.markdown : markdownConfigDefaults
          )
        });
        const mdxPluginOpts = {
          remarkPlugins: await getRemarkPlugins(mdxOptions, config),
          rehypePlugins: getRehypePlugins(mdxOptions),
          recmaPlugins: mdxOptions.recmaPlugins,
          remarkRehypeOptions: mdxOptions.remarkRehype,
          jsx: true,
          jsxImportSource: "astro",
          // Note: disable `.md` (and other alternative extensions for markdown files like `.markdown`) support
          format: "mdx",
          mdExtensions: []
        };
        let importMetaEnv = {
          SITE: config.site
        };
        updateConfig({
          vite: {
            plugins: [
              {
                enforce: "pre",
                ...mdxPlugin(mdxPluginOpts),
                configResolved(resolved) {
                  importMetaEnv = { ...importMetaEnv, ...resolved.env };
                },
                // Override transform to alter code before MDX compilation
                // ex. inject layouts
                async transform(_, id) {
                  var _a;
                  if (!id.endsWith("mdx"))
                    return;
                  const { fileId } = getFileInfo(id, config);
                  const code = await fs.readFile(fileId, "utf-8");
                  const { data: frontmatter, content: pageContent } = parseFrontmatter(code, id);
                  const compiled = await mdxCompile(new VFile({ value: pageContent, path: id }), {
                    ...mdxPluginOpts,
                    elementAttributeNameCase: "html",
                    remarkPlugins: [
                      // Ensure `data.astro` is available to all remark plugins
                      toRemarkInitializeAstroData({ userFrontmatter: frontmatter }),
                      ...mdxPluginOpts.remarkPlugins ?? []
                    ],
                    recmaPlugins: [
                      ...mdxPluginOpts.recmaPlugins ?? [],
                      () => recmaInjectImportMetaEnvPlugin({ importMetaEnv })
                    ],
                    SourceMapGenerator: ((_a = config.vite.build) == null ? void 0 : _a.sourcemap) ? SourceMapGenerator : void 0
                  });
                  return {
                    code: escapeViteEnvReferences(String(compiled.value)),
                    map: compiled.map
                  };
                }
              },
              {
                name: "@astrojs/mdx-postprocess",
                // These transforms must happen *after* JSX runtime transformations
                transform(code, id) {
                  if (!id.endsWith(".mdx"))
                    return;
                  const [moduleImports, moduleExports] = parseESM(code);
                  const importsFromJSXRuntime = moduleImports.filter(({ n }) => n === "astro/jsx-runtime").map(({ ss, se }) => code.substring(ss, se));
                  const hasFragmentImport = importsFromJSXRuntime.some(
                    (statement) => /[\s,{](Fragment,|Fragment\s*})/.test(statement)
                  );
                  if (!hasFragmentImport) {
                    code = 'import { Fragment } from "astro/jsx-runtime"\n' + code;
                  }
                  const { fileUrl, fileId } = getFileInfo(id, config);
                  if (!moduleExports.find(({ n }) => n === "url")) {
                    code += `
export const url = ${JSON.stringify(fileUrl)};`;
                  }
                  if (!moduleExports.find(({ n }) => n === "file")) {
                    code += `
export const file = ${JSON.stringify(fileId)};`;
                  }
                  if (!moduleExports.find(({ n }) => n === "Content")) {
                    code = code.replace("export default MDXContent;", "");
                    code += `
export const Content = (props = {}) => MDXContent({
											...props,
											components: { Fragment, ...props.components },
										});
										export default Content;`;
                  }
                  code += `
Content[Symbol.for('astro.needsHeadRendering')] = !Boolean(frontmatter.layout);`;
                  code += `
Content.moduleId = ${JSON.stringify(id)};`;
                  if (command === "dev") {
                    code += `
if (import.meta.hot) {
											import.meta.hot.decline();
										}`;
                  }
                  return { code: escapeViteEnvReferences(code), map: null };
                }
              }
            ]
          }
        });
      }
    }
  };
}
const defaultMdxOptions = {
  extendMarkdownConfig: true,
  recmaPlugins: []
};
function markdownConfigToMdxOptions(markdownConfig) {
  return {
    ...defaultMdxOptions,
    ...markdownConfig,
    remarkPlugins: ignoreStringPlugins(markdownConfig.remarkPlugins),
    rehypePlugins: ignoreStringPlugins(markdownConfig.rehypePlugins),
    remarkRehype: markdownConfig.remarkRehype ?? {}
  };
}
function applyDefaultOptions({
  options,
  defaults
}) {
  return {
    syntaxHighlight: options.syntaxHighlight ?? defaults.syntaxHighlight,
    extendMarkdownConfig: options.extendMarkdownConfig ?? defaults.extendMarkdownConfig,
    recmaPlugins: options.recmaPlugins ?? defaults.recmaPlugins,
    remarkRehype: options.remarkRehype ?? defaults.remarkRehype,
    gfm: options.gfm ?? defaults.gfm,
    smartypants: options.smartypants ?? defaults.smartypants,
    remarkPlugins: options.remarkPlugins ?? defaults.remarkPlugins,
    rehypePlugins: options.rehypePlugins ?? defaults.rehypePlugins,
    shikiConfig: options.shikiConfig ?? defaults.shikiConfig
  };
}
function escapeViteEnvReferences(code) {
  return code.replace(/import\.meta\.env/g, "import\\u002Emeta.env");
}
export {
  mdx as default
};
