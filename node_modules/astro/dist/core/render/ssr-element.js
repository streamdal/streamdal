import slashify from "slash";
import { joinPaths, prependForwardSlash } from "../../core/path.js";
function createAssetLink(href, base, assetsPrefix) {
  if (assetsPrefix) {
    return joinPaths(assetsPrefix, slashify(href));
  } else if (base) {
    return prependForwardSlash(joinPaths(base, slashify(href)));
  } else {
    return href;
  }
}
function createLinkStylesheetElement(href, base, assetsPrefix) {
  return {
    props: {
      rel: "stylesheet",
      href: createAssetLink(href, base, assetsPrefix)
    },
    children: ""
  };
}
function createLinkStylesheetElementSet(hrefs, base, assetsPrefix) {
  return new Set(
    hrefs.map((href) => createLinkStylesheetElement(href, base, assetsPrefix))
  );
}
function createModuleScriptElement(script, base, assetsPrefix) {
  if (script.type === "external") {
    return createModuleScriptElementWithSrc(script.value, base, assetsPrefix);
  } else {
    return {
      props: {
        type: "module"
      },
      children: script.value
    };
  }
}
function createModuleScriptElementWithSrc(src, base, assetsPrefix) {
  return {
    props: {
      type: "module",
      src: createAssetLink(src, base, assetsPrefix)
    },
    children: ""
  };
}
function createModuleScriptElementWithSrcSet(srces, site, assetsPrefix) {
  return new Set(
    srces.map((src) => createModuleScriptElementWithSrc(src, site, assetsPrefix))
  );
}
function createModuleScriptsSet(scripts, base, assetsPrefix) {
  return new Set(
    scripts.map((script) => createModuleScriptElement(script, base, assetsPrefix))
  );
}
export {
  createAssetLink,
  createLinkStylesheetElement,
  createLinkStylesheetElementSet,
  createModuleScriptElement,
  createModuleScriptElementWithSrc,
  createModuleScriptElementWithSrcSet,
  createModuleScriptsSet
};
