import * as fs from "fs";
import { getHighlighter } from "shiki";
import { fileURLToPath } from "url";
import { AstroErrorData } from "../errors-data.js";
import { AstroError } from "../errors.js";
import { createSafeError } from "../utils.js";
import { renderErrorMarkdown } from "./utils.js";
function enhanceViteSSRError({
  error,
  filePath,
  loader,
  renderers
}) {
  var _a, _b, _c, _d, _e;
  let safeError = createSafeError(error);
  if (loader) {
    try {
      loader.fixStacktrace(safeError);
    } catch {
    }
  }
  if (filePath) {
    const path = fileURLToPath(filePath);
    const content = fs.readFileSync(path).toString();
    const lns = content.split("\n");
    let importName;
    if (importName = (_a = safeError.message.match(/Failed to load url (.*?) \(resolved id:/)) == null ? void 0 : _a[1]) {
      safeError.title = AstroErrorData.FailedToLoadModuleSSR.title;
      safeError.name = "FailedToLoadModuleSSR";
      safeError.message = AstroErrorData.FailedToLoadModuleSSR.message(importName);
      safeError.hint = AstroErrorData.FailedToLoadModuleSSR.hint;
      safeError.code = AstroErrorData.FailedToLoadModuleSSR.code;
      const line = lns.findIndex((ln) => ln.includes(importName));
      if (line !== -1) {
        const column = (_b = lns[line]) == null ? void 0 : _b.indexOf(importName);
        safeError.loc = {
          file: path,
          line: line + 1,
          column
        };
      }
    }
    const fileId = safeError.id ?? ((_c = safeError.loc) == null ? void 0 : _c.file);
    if (!(renderers == null ? void 0 : renderers.find((r) => r.name === "@astrojs/mdx")) && safeError.message.match(/Syntax error/) && (fileId == null ? void 0 : fileId.match(/\.mdx$/))) {
      safeError = new AstroError({
        ...AstroErrorData.MdxIntegrationMissingError,
        message: AstroErrorData.MdxIntegrationMissingError.message(JSON.stringify(fileId)),
        location: safeError.loc,
        stack: safeError.stack
      });
    }
    if (/Invalid glob/.test(safeError.message)) {
      const globPattern = (_d = safeError.message.match(/glob: "(.+)" \(/)) == null ? void 0 : _d[1];
      if (globPattern) {
        safeError.message = AstroErrorData.InvalidGlob.message(globPattern);
        safeError.name = "InvalidGlob";
        safeError.hint = AstroErrorData.InvalidGlob.hint;
        safeError.code = AstroErrorData.InvalidGlob.code;
        safeError.title = AstroErrorData.InvalidGlob.title;
        const line = lns.findIndex((ln) => ln.includes(globPattern));
        if (line !== -1) {
          const column = (_e = lns[line]) == null ? void 0 : _e.indexOf(globPattern);
          safeError.loc = {
            file: path,
            line: line + 1,
            column
          };
        }
      }
    }
  }
  return safeError;
}
const ALTERNATIVE_JS_EXTS = ["cjs", "mjs"];
const ALTERNATIVE_MD_EXTS = ["mdoc"];
async function getViteErrorPayload(err) {
  var _a, _b, _c, _d, _e, _f;
  let plugin = err.plugin;
  if (!plugin && err.hint) {
    plugin = "astro";
  }
  const message = renderErrorMarkdown(err.message.trim(), "html");
  const hint = err.hint ? renderErrorMarkdown(err.hint.trim(), "html") : void 0;
  const hasDocs = err.type && err.name && [
    "AstroError",
    "AggregateError",
    /* 'CompilerError' ,*/
    "CSSError",
    "MarkdownError"
  ] || ["FailedToLoadModuleSSR", "InvalidGlob"].includes(err.name);
  const docslink = hasDocs ? `https://docs.astro.build/en/reference/errors/${getKebabErrorName(err.name)}/` : void 0;
  const highlighter = await getHighlighter({ theme: "css-variables" });
  let highlighterLang = (_b = (_a = err.loc) == null ? void 0 : _a.file) == null ? void 0 : _b.split(".").pop();
  if (ALTERNATIVE_JS_EXTS.includes(highlighterLang ?? "")) {
    highlighterLang = "js";
  }
  if (ALTERNATIVE_MD_EXTS.includes(highlighterLang ?? "")) {
    highlighterLang = "md";
  }
  const highlightedCode = err.fullCode ? highlighter.codeToHtml(err.fullCode, {
    lang: highlighterLang,
    lineOptions: ((_c = err.loc) == null ? void 0 : _c.line) ? [{ line: err.loc.line, classes: ["error-line"] }] : void 0
  }) : void 0;
  return {
    type: "error",
    err: {
      ...err,
      name: err.name,
      type: err.type,
      message,
      hint,
      frame: err.frame,
      highlightedCode,
      docslink,
      loc: {
        file: (_d = err.loc) == null ? void 0 : _d.file,
        line: (_e = err.loc) == null ? void 0 : _e.line,
        column: (_f = err.loc) == null ? void 0 : _f.column
      },
      plugin,
      stack: err.stack,
      cause: err.cause
    }
  };
  function getKebabErrorName(errorName) {
    return errorName.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
  }
}
export {
  enhanceViteSSRError,
  getViteErrorPayload
};
