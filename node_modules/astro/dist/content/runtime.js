import { AstroError, AstroErrorData } from "../core/errors/index.js";
import { prependForwardSlash } from "../core/path.js";
import {
  createComponent,
  createHeadAndContent,
  renderComponent,
  renderScriptElement,
  renderStyleElement,
  renderTemplate,
  renderUniqueStylesheet,
  unescapeHTML
} from "../runtime/server/index.js";
function createCollectionToGlobResultMap({
  globResult,
  contentDir
}) {
  const collectionToGlobResultMap = {};
  for (const key in globResult) {
    const keyRelativeToContentDir = key.replace(new RegExp(`^${contentDir}`), "");
    const segments = keyRelativeToContentDir.split("/");
    if (segments.length <= 1)
      continue;
    const collection = segments[0];
    const entryId = segments.slice(1).join("/");
    collectionToGlobResultMap[collection] ??= {};
    collectionToGlobResultMap[collection][entryId] = globResult[key];
  }
  return collectionToGlobResultMap;
}
const cacheEntriesByCollection = /* @__PURE__ */ new Map();
function createGetCollection({
  collectionToEntryMap,
  collectionToRenderEntryMap
}) {
  return async function getCollection(collection, filter) {
    const lazyImports = Object.values(collectionToEntryMap[collection] ?? {});
    let entries = [];
    if (import.meta.env.PROD && cacheEntriesByCollection.has(collection)) {
      entries = cacheEntriesByCollection.get(collection);
    } else {
      entries = await Promise.all(
        lazyImports.map(async (lazyImport) => {
          const entry = await lazyImport();
          return {
            id: entry.id,
            slug: entry.slug,
            body: entry.body,
            collection: entry.collection,
            data: entry.data,
            async render() {
              return render({
                collection: entry.collection,
                id: entry.id,
                collectionToRenderEntryMap
              });
            }
          };
        })
      );
      cacheEntriesByCollection.set(collection, entries);
    }
    if (typeof filter === "function") {
      return entries.filter(filter);
    } else {
      return entries;
    }
  };
}
function createGetEntryBySlug({
  getCollection,
  collectionToRenderEntryMap
}) {
  return async function getEntryBySlug(collection, slug) {
    const entries = await getCollection(collection);
    let candidate = void 0;
    for (let entry2 of entries) {
      if (entry2.slug === slug) {
        candidate = entry2;
        break;
      }
    }
    if (typeof candidate === "undefined") {
      return void 0;
    }
    const entry = candidate;
    return {
      id: entry.id,
      slug: entry.slug,
      body: entry.body,
      collection: entry.collection,
      data: entry.data,
      async render() {
        return render({
          collection: entry.collection,
          id: entry.id,
          collectionToRenderEntryMap
        });
      }
    };
  };
}
async function render({
  collection,
  id,
  collectionToRenderEntryMap
}) {
  var _a, _b;
  const UnexpectedRenderError = new AstroError({
    ...AstroErrorData.UnknownContentCollectionError,
    message: `Unexpected error while rendering ${String(collection)} \u2192 ${String(id)}.`
  });
  const lazyImport = (_a = collectionToRenderEntryMap[collection]) == null ? void 0 : _a[id];
  if (typeof lazyImport !== "function")
    throw UnexpectedRenderError;
  const baseMod = await lazyImport();
  if (baseMod == null || typeof baseMod !== "object")
    throw UnexpectedRenderError;
  const { collectedStyles, collectedLinks, collectedScripts, getMod } = baseMod;
  if (typeof getMod !== "function")
    throw UnexpectedRenderError;
  const mod = await getMod();
  if (mod == null || typeof mod !== "object")
    throw UnexpectedRenderError;
  const Content = createComponent({
    factory(result, baseProps, slots) {
      let styles = "", links = "", scripts = "";
      if (Array.isArray(collectedStyles)) {
        styles = collectedStyles.map((style) => renderStyleElement(style)).join("");
      }
      if (Array.isArray(collectedLinks)) {
        links = collectedLinks.map((link) => {
          return renderUniqueStylesheet(result, {
            href: prependForwardSlash(link)
          });
        }).join("");
      }
      if (Array.isArray(collectedScripts)) {
        scripts = collectedScripts.map((script) => renderScriptElement(script)).join("");
      }
      let props = baseProps;
      if (id.endsWith("mdx")) {
        props = {
          components: mod.components ?? {},
          ...baseProps
        };
      }
      return createHeadAndContent(
        unescapeHTML(styles + links + scripts),
        renderTemplate`${renderComponent(result, "Content", mod.Content, props, slots)}`
      );
    },
    propagation: "self"
  });
  return {
    Content,
    headings: ((_b = mod.getHeadings) == null ? void 0 : _b.call(mod)) ?? [],
    remarkPluginFrontmatter: mod.frontmatter ?? {}
  };
}
export {
  createCollectionToGlobResultMap,
  createGetCollection,
  createGetEntryBySlug
};
