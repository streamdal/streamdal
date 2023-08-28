"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  AST: () => ast_exports,
  ParseError: () => ParseError,
  VisitorKeys: () => VisitorKeys,
  name: () => name,
  parseForESLint: () => parseForESLint2,
  parseTemplate: () => parseTemplate2,
  traverseNodes: () => traverseNodes
});
module.exports = __toCommonJS(src_exports);

// src/visitor-keys.ts
var import_eslint_visitor_keys = require("eslint-visitor-keys");
var astroKeys = {
  Program: ["body"],
  AstroFragment: ["children"],
  AstroHTMLComment: [],
  AstroDoctype: [],
  AstroShorthandAttribute: ["name", "value"],
  AstroTemplateLiteralAttribute: ["name", "value"],
  AstroRawText: []
};
var KEYS = (0, import_eslint_visitor_keys.unionWith)(
  astroKeys
);

// src/parser/index.ts
var import_types2 = require("@typescript-eslint/types");

// src/debug.ts
var import_debug = __toESM(require("debug"));
var debug = (0, import_debug.default)("astro-eslint-parser");

// src/parser/ts-patch.ts
var import_module = require("module");
var import_path3 = __toESM(require("path"));
var import_fs2 = __toESM(require("fs"));
var import_semver = require("semver");

// src/parser/ts-for-v5/get-project-config-files.ts
var import_fs = __toESM(require("fs"));
var import_path = __toESM(require("path"));
function getProjectConfigFiles(options) {
  const tsconfigRootDir = typeof options.tsconfigRootDir === "string" ? options.tsconfigRootDir : process.cwd();
  if (options.project !== true) {
    return Array.isArray(options.project) ? options.project : [options.project];
  }
  let directory = import_path.default.dirname(options.filePath);
  const checkedDirectories = [directory];
  do {
    const tsconfigPath = import_path.default.join(directory, "tsconfig.json");
    if (import_fs.default.existsSync(tsconfigPath)) {
      return [tsconfigPath];
    }
    directory = import_path.default.dirname(directory);
    checkedDirectories.push(directory);
  } while (directory.length > 1 && directory.length >= tsconfigRootDir.length);
  throw new Error(
    `project was set to \`true\` but couldn't find any tsconfig.json relative to '${options.filePath}' within '${tsconfigRootDir}'.`
  );
}

// src/parser/ts-for-v5/programs.ts
var import_path2 = __toESM(require("path"));
var tsServices = /* @__PURE__ */ new Map();
function getTSProgram(code, options, ts) {
  const tsconfigPath = options.project;
  let service2 = tsServices.get(tsconfigPath);
  if (!service2) {
    service2 = new TSService(tsconfigPath, ts);
    tsServices.set(tsconfigPath, service2);
  }
  return service2.getProgram(code, options.filePath);
}
var TSService = class {
  constructor(tsconfigPath, ts) {
    this.patchedHostSet = /* @__PURE__ */ new WeakSet();
    this.currTarget = {
      code: "",
      filePath: ""
    };
    this.fileWatchCallbacks = /* @__PURE__ */ new Map();
    this.ts = ts;
    this.watch = this.createWatch(tsconfigPath);
  }
  getProgram(code, filePath) {
    const normalized = normalizeFileName(this.ts, filePath);
    const lastTarget = this.currTarget;
    this.currTarget = {
      code,
      filePath: normalized
    };
    for (const { filePath: targetPath } of [this.currTarget, lastTarget]) {
      if (!targetPath)
        continue;
      this.fileWatchCallbacks.get(targetPath)?.update();
    }
    const program = this.watch.getProgram().getProgram();
    program.getTypeChecker();
    return program;
  }
  createWatch(tsconfigPath) {
    const { ts } = this;
    const createAbstractBuilder = (...args) => {
      const [
        rootNames,
        options,
        argHost,
        oldProgram,
        configFileParsingDiagnostics,
        projectReferences
      ] = args;
      const host = argHost;
      if (!this.patchedHostSet.has(host)) {
        this.patchedHostSet.add(host);
        const getTargetSourceFile = (fileName, languageVersionOrOptions) => {
          var _a;
          if (this.currTarget.filePath === normalizeFileName(ts, fileName)) {
            return (_a = this.currTarget).sourceFile ?? (_a.sourceFile = ts.createSourceFile(
              this.currTarget.filePath,
              this.currTarget.code,
              languageVersionOrOptions,
              true,
              ts.ScriptKind.TSX
            ));
          }
          return null;
        };
        const original2 = {
          getSourceFile: host.getSourceFile,
          getSourceFileByPath: host.getSourceFileByPath
        };
        host.getSourceFile = (fileName, languageVersionOrOptions, ...args2) => {
          const originalSourceFile = original2.getSourceFile.call(
            host,
            fileName,
            languageVersionOrOptions,
            ...args2
          );
          return getTargetSourceFile(fileName, languageVersionOrOptions) ?? originalSourceFile;
        };
        host.getSourceFileByPath = (fileName, path6, languageVersionOrOptions, ...args2) => {
          const originalSourceFile = original2.getSourceFileByPath.call(
            host,
            fileName,
            path6,
            languageVersionOrOptions,
            ...args2
          );
          return getTargetSourceFile(fileName, languageVersionOrOptions) ?? originalSourceFile;
        };
      }
      return ts.createAbstractBuilder(
        rootNames,
        options,
        host,
        oldProgram,
        configFileParsingDiagnostics,
        projectReferences
      );
    };
    const watchCompilerHost = ts.createWatchCompilerHost(
      tsconfigPath,
      {
        noEmit: true,
        jsx: ts.JsxEmit.Preserve,
        // This option is required if `includes` only includes `*.astro` files.
        // However, the option is not in the documentation.
        // https://github.com/microsoft/TypeScript/issues/28447
        allowNonTsExtensions: true
      },
      ts.sys,
      createAbstractBuilder,
      (diagnostic) => {
        throw new Error(formatDiagnostics(ts, [diagnostic]));
      },
      () => {
      },
      void 0,
      [
        {
          extension: ".astro",
          isMixedContent: true,
          scriptKind: ts.ScriptKind.Deferred
        }
      ]
    );
    const original = {
      readFile: watchCompilerHost.readFile
    };
    watchCompilerHost.readFile = (fileName, ...args) => {
      const normalized = normalizeFileName(ts, fileName);
      if (this.currTarget.filePath === normalized) {
        return this.currTarget.code;
      }
      return original.readFile.call(watchCompilerHost, fileName, ...args);
    };
    watchCompilerHost.watchFile = (fileName, callback) => {
      const normalized = normalizeFileName(ts, fileName);
      this.fileWatchCallbacks.set(normalized, {
        update: () => callback(fileName, ts.FileWatcherEventKind.Changed)
      });
      return {
        close: () => {
          this.fileWatchCallbacks.delete(normalized);
        }
      };
    };
    watchCompilerHost.watchDirectory = () => {
      return {
        close: () => {
        }
      };
    };
    watchCompilerHost.afterProgramCreate = (program) => {
      const originalDiagnostics = program.getConfigFileParsingDiagnostics();
      const configFileDiagnostics = originalDiagnostics.filter(
        (diag) => diag.category === ts.DiagnosticCategory.Error && diag.code !== 18003
      );
      if (configFileDiagnostics.length > 0) {
        throw new Error(formatDiagnostics(ts, configFileDiagnostics));
      }
    };
    const watch = ts.createWatchProgram(watchCompilerHost);
    return watch;
  }
};
function formatDiagnostics(ts, diagnostics) {
  return ts.formatDiagnostics(diagnostics, {
    getCanonicalFileName: (f) => f,
    getCurrentDirectory: () => process.cwd(),
    getNewLine: () => "\n"
  });
}
function normalizeFileName(ts, fileName) {
  let normalized = import_path2.default.normalize(fileName);
  if (normalized.endsWith(import_path2.default.sep)) {
    normalized = normalized.slice(0, -1);
  }
  if (ts.sys.useCaseSensitiveFileNames) {
    return toAbsolutePath(normalized, null);
  }
  return toAbsolutePath(normalized.toLowerCase(), null);
}
function toAbsolutePath(filePath, baseDir) {
  return import_path2.default.isAbsolute(filePath) ? filePath : import_path2.default.join(baseDir || process.cwd(), filePath);
}

// src/parser/ts-for-v5/parse-tsx-for-typescript.ts
var DEFAULT_EXTRA_FILE_EXTENSIONS = [".vue", ".svelte", ".astro"];
function parseTsxForTypeScript(code, options, tsEslintParser, ts) {
  const programs = [];
  for (const option of iterateOptions(options)) {
    programs.push(getTSProgram(code, option, ts));
  }
  const parserOptions = {
    ...options,
    programs
  };
  return tsEslintParser.parseForESLint(code, parserOptions);
}
function* iterateOptions(options) {
  if (!options) {
    throw new Error("`parserOptions` is required.");
  }
  if (!options.filePath) {
    throw new Error("`filePath` is required.");
  }
  if (!options.project) {
    throw new Error(
      "Specify `parserOptions.project`. Otherwise there is no point in using this parser."
    );
  }
  for (const project of getProjectConfigFiles(options)) {
    yield {
      project,
      filePath: options.filePath,
      extraFileExtensions: options.extraFileExtensions || DEFAULT_EXTRA_FILE_EXTENSIONS
    };
  }
}

// src/parser/ts-patch.ts
function tsPatch(scriptParserOptions, tsParserName) {
  if (tsParserName === "typescript-eslint-parser-for-extra-files") {
    return {
      terminate() {
      }
    };
  }
  let targetExt = ".astro";
  if (scriptParserOptions.filePath) {
    const ext = import_path3.default.extname(scriptParserOptions.filePath);
    if (ext) {
      targetExt = ext;
    }
  }
  try {
    const cwd = process.cwd();
    const relativeTo = import_path3.default.join(cwd, "__placeholder__.js");
    const ts = (0, import_module.createRequire)(relativeTo)("typescript");
    if ((0, import_semver.satisfies)(ts.version, ">=5")) {
      const result = tsPatchForV5(ts, scriptParserOptions);
      if (result) {
        return result;
      }
    } else {
      const result = tsPatchForV4(ts, targetExt);
      if (result) {
        return result;
      }
    }
  } catch {
  }
  const tsxFilePath = `${scriptParserOptions.filePath}.tsx`;
  scriptParserOptions.filePath = tsxFilePath;
  if (!import_fs2.default.existsSync(tsxFilePath)) {
    import_fs2.default.writeFileSync(tsxFilePath, "/* temp for astro-eslint-parser */");
    return {
      terminate() {
        import_fs2.default.unlinkSync(tsxFilePath);
      }
    };
  }
  return null;
}
function tsPatchForV5(ts, scriptParserOptions) {
  return {
    terminate() {
    },
    parse(code, parser) {
      return parseTsxForTypeScript(
        code,
        scriptParserOptions,
        parser,
        ts
      );
    }
  };
}
function tsPatchForV4(ts, targetExt) {
  const { ensureScriptKind, getScriptKindFromFileName } = ts;
  if (typeof ensureScriptKind !== "function" || typeof getScriptKindFromFileName !== "function") {
    return null;
  }
  ts.ensureScriptKind = function(fileName, ...args) {
    if (fileName.endsWith(targetExt)) {
      return ts.ScriptKind.TSX;
    }
    return ensureScriptKind.call(this, fileName, ...args);
  };
  ts.getScriptKindFromFileName = function(fileName, ...args) {
    if (fileName.endsWith(targetExt)) {
      return ts.ScriptKind.TSX;
    }
    return getScriptKindFromFileName.call(this, fileName, ...args);
  };
  if (ts.ensureScriptKind === ensureScriptKind || ts.getScriptKindFromFileName === getScriptKindFromFileName) {
    return null;
  }
  return {
    terminate() {
      ts.ensureScriptKind = ensureScriptKind;
      ts.getScriptKindFromFileName = getScriptKindFromFileName;
    }
  };
}

// src/context/resolve-parser/parser-object.ts
function isParserObject(value) {
  return isEnhancedParserObject(value) || isBasicParserObject(value);
}
function isEnhancedParserObject(value) {
  return Boolean(value && typeof value.parseForESLint === "function");
}
function isBasicParserObject(value) {
  return Boolean(value && typeof value.parse === "function");
}
function maybeTSESLintParserObject(value) {
  return isEnhancedParserObject(value) && isBasicParserObject(value) && typeof value.createProgram === "function" && typeof value.clearCaches === "function" && typeof value.version === "string";
}
function getTSParserNameFromObject(value) {
  if (!isEnhancedParserObject(value)) {
    return null;
  }
  if (value.name === "typescript-eslint-parser-for-extra-files")
    return "typescript-eslint-parser-for-extra-files";
  if (value.meta?.name === "typescript-eslint/parser")
    return "@typescript-eslint/parser";
  return null;
}
function isTSESLintParserObject(value) {
  if (!isEnhancedParserObject(value))
    return false;
  if (value.name === "typescript-eslint-parser-for-extra-files")
    return true;
  if (value.meta?.name === "typescript-eslint/parser")
    return true;
  try {
    const result = value.parseForESLint("", {});
    const services = result.services;
    return Boolean(
      services && services.esTreeNodeToTSNodeMap && services.tsNodeToESTreeNodeMap && services.program
    );
  } catch {
    return false;
  }
}

// src/parser/script.ts
var import_scope_manager = require("@typescript-eslint/scope-manager");
function parseScript(code, ctx, parserOptionsCtx) {
  const result = parseScriptInternal(code, ctx, parserOptionsCtx);
  const parserOptions = parserOptionsCtx.parserOptions;
  if (!result.scopeManager && parserOptions.eslintScopeManager) {
    result.scopeManager = (0, import_scope_manager.analyze)(result.ast, {
      ecmaVersion: 1e8,
      globalReturn: parserOptions.ecmaFeatures?.globalReturn,
      jsxPragma: parserOptions.jsxPragma,
      jsxFragmentName: parserOptions.jsxFragmentName,
      lib: parserOptions.lib,
      sourceType: parserOptions.sourceType
    });
  }
  return result;
}
function parseScriptInternal(code, _ctx, parserOptionsCtx) {
  const parser = parserOptionsCtx.getParser();
  let patchResult;
  try {
    const parserOptions = parserOptionsCtx.parserOptions;
    if (parserOptionsCtx.isTypeScript() && parserOptions.filePath && parserOptions.project) {
      patchResult = tsPatch(parserOptions, parserOptionsCtx.getTSParserName());
    }
    const result = isEnhancedParserObject(parser) ? patchResult?.parse ? patchResult.parse(code, parser) : parser.parseForESLint(code, parserOptions) : parser.parse(code, parserOptions);
    if ("ast" in result && result.ast != null) {
      return result;
    }
    return { ast: result };
  } catch (e) {
    debug(
      "[script] parsing error:",
      e.message,
      `@ ${JSON.stringify(code)}

${code}`
    );
    throw e;
  } finally {
    patchResult?.terminate();
  }
}

// src/parser/sort.ts
function sort(tokens) {
  return tokens.sort((a, b) => {
    if (a.range[0] !== b.range[0]) {
      return a.range[0] - b.range[0];
    }
    return a.range[1] - b.range[1];
  });
}

// src/parser/process-template.ts
var import_types = require("@typescript-eslint/types");

// src/errors.ts
var ParseError = class extends SyntaxError {
  /**
   * Initialize this ParseError instance.
   */
  constructor(message, offset, ctx) {
    super(message);
    if (typeof offset === "number") {
      this.index = offset;
      const loc = ctx.getLocFromIndex(offset);
      this.lineNumber = loc.line;
      this.column = loc.column;
    } else {
      this.index = ctx.getIndexFromLoc(offset);
      this.lineNumber = offset.line;
      this.column = offset.column;
    }
    this.originalAST = ctx.originalAST;
  }
};

// src/astro/index.ts
function isTag(node) {
  return node.type === "element" || node.type === "custom-element" || node.type === "component" || node.type === "fragment";
}
function isParent(node) {
  return Array.isArray(node.children);
}
function walkElements(parent, code, enter, leave, parents = []) {
  const children = getSortedChildren(parent, code);
  const currParents = [parent, ...parents];
  for (const node of children) {
    enter(node, currParents);
    if (isParent(node)) {
      walkElements(node, code, enter, leave, currParents);
    }
    leave(node, currParents);
  }
}
function walk(parent, code, enter, leave) {
  walkElements(
    parent,
    code,
    (node, parents) => {
      enter(node, parents);
      if (isTag(node)) {
        const attrParents = [node, ...parents];
        for (const attr of node.attributes) {
          enter(attr, attrParents);
          leave(attr, attrParents);
        }
      }
    },
    leave
  );
}
function calcStartTagEndOffset(node, ctx) {
  const lastAttr = node.attributes[node.attributes.length - 1];
  let beforeCloseIndex;
  if (lastAttr) {
    beforeCloseIndex = calcAttributeEndOffset(lastAttr, ctx);
  } else {
    const info2 = getTokenInfo(
      ctx,
      [`<${node.name}`],
      node.position.start.offset
    );
    beforeCloseIndex = info2.index + info2.match.length;
  }
  const info = getTokenInfo(ctx, [[">", "/>"]], beforeCloseIndex);
  return info.index + info.match.length;
}
function calcAttributeEndOffset(node, ctx) {
  let info;
  if (node.kind === "empty") {
    info = getTokenInfo(ctx, [node.name], node.position.start.offset);
  } else if (node.kind === "quoted") {
    info = getTokenInfo(
      ctx,
      [[`"${node.value}"`, `'${node.value}'`, node.value]],
      calcAttributeValueStartOffset(node, ctx)
    );
  } else if (node.kind === "expression") {
    info = getTokenInfo(
      ctx,
      ["{", node.value, "}"],
      calcAttributeValueStartOffset(node, ctx)
    );
  } else if (node.kind === "shorthand") {
    info = getTokenInfo(
      ctx,
      ["{", node.name, "}"],
      node.position.start.offset
    );
  } else if (node.kind === "spread") {
    info = getTokenInfo(
      ctx,
      ["{", "...", node.name, "}"],
      node.position.start.offset
    );
  } else if (node.kind === "template-literal") {
    info = getTokenInfo(
      ctx,
      [`\`${node.value}\``],
      calcAttributeValueStartOffset(node, ctx)
    );
  } else {
    throw new ParseError(
      `Unknown attr kind: ${node.kind}`,
      node.position.start.offset,
      ctx
    );
  }
  return info.index + info.match.length;
}
function calcAttributeValueStartOffset(node, ctx) {
  let info;
  if (node.kind === "quoted") {
    info = getTokenInfo(
      ctx,
      [node.name, "=", [`"`, `'`, node.value]],
      node.position.start.offset
    );
  } else if (node.kind === "expression") {
    info = getTokenInfo(
      ctx,
      [node.name, "=", "{"],
      node.position.start.offset
    );
  } else if (node.kind === "template-literal") {
    info = getTokenInfo(
      ctx,
      [node.name, "=", "`"],
      node.position.start.offset
    );
  } else {
    throw new ParseError(
      `Unknown attr kind: ${node.kind}`,
      node.position.start.offset,
      ctx
    );
  }
  return info.index;
}
function getEndOffset(node, ctx) {
  if (node.position.end?.offset != null) {
    return node.position.end.offset;
  }
  if (isTag(node))
    return calcTagEndOffset(node, ctx);
  if (node.type === "expression")
    return calcExpressionEndOffset(node, ctx);
  if (node.type === "comment")
    return calcCommentEndOffset(node, ctx);
  if (node.type === "frontmatter") {
    const start = node.position.start.offset;
    return ctx.code.indexOf("---", start + 3) + 3;
  }
  if (node.type === "doctype") {
    const start = node.position.start.offset;
    return ctx.code.indexOf(">", start) + 1;
  }
  if (node.type === "text") {
    const start = node.position.start.offset;
    return start + node.value.length;
  }
  if (node.type === "root") {
    return ctx.code.length;
  }
  throw new Error(`unknown type: ${node.type}`);
}
function calcContentEndOffset(parent, ctx) {
  const code = ctx.code;
  if (isTag(parent)) {
    const end = getEndOffset(parent, ctx);
    if (code[end - 1] !== ">") {
      return end;
    }
    const index = code.lastIndexOf("</", end - 1);
    if (index >= 0 && code.slice(index + 2, end - 1).trim() === parent.name) {
      return index;
    }
    return end;
  } else if (parent.type === "expression") {
    const end = getEndOffset(parent, ctx);
    return code.lastIndexOf("}", end);
  } else if (parent.type === "root") {
    return code.length;
  }
  throw new Error(`unknown type: ${parent.type}`);
}
function getSelfClosingTag(node, ctx) {
  if (node.children.length > 0) {
    return null;
  }
  const code = ctx.code;
  const startTagEndOffset = calcStartTagEndOffset(node, ctx);
  if (code.startsWith("/>", startTagEndOffset - 2)) {
    return {
      offset: startTagEndOffset,
      end: "/>"
    };
  }
  if (code.startsWith(`</${node.name}`, startTagEndOffset)) {
    return null;
  }
  return {
    offset: startTagEndOffset,
    end: ">"
  };
}
function getEndTag(node, ctx) {
  let beforeIndex;
  if (node.children.length) {
    const lastChild = node.children[node.children.length - 1];
    beforeIndex = getEndOffset(lastChild, ctx);
  } else {
    beforeIndex = calcStartTagEndOffset(node, ctx);
  }
  beforeIndex = skipSpaces(ctx.code, beforeIndex);
  if (ctx.code.startsWith(`</${node.name}`, beforeIndex)) {
    const offset = beforeIndex;
    beforeIndex = beforeIndex + 2 + node.name.length;
    const info = getTokenInfo(ctx, [">"], beforeIndex);
    const end = info.index + info.match.length;
    return {
      offset,
      tag: ctx.code.slice(offset, end)
    };
  }
  return null;
}
function calcCommentEndOffset(node, ctx) {
  const info = getTokenInfo(
    ctx,
    ["<!--", node.value, "-->"],
    node.position.start.offset
  );
  return info.index + info.match.length;
}
function calcTagEndOffset(node, ctx) {
  let beforeIndex;
  if (node.children.length) {
    const lastChild = node.children[node.children.length - 1];
    beforeIndex = getEndOffset(lastChild, ctx);
  } else {
    beforeIndex = calcStartTagEndOffset(node, ctx);
  }
  beforeIndex = skipSpaces(ctx.code, beforeIndex);
  if (ctx.code.startsWith(`</${node.name}`, beforeIndex)) {
    beforeIndex = beforeIndex + 2 + node.name.length;
    const info = getTokenInfo(ctx, [">"], beforeIndex);
    return info.index + info.match.length;
  }
  return beforeIndex;
}
function calcExpressionEndOffset(node, ctx) {
  if (node.children.length) {
    const lastChild = node.children[node.children.length - 1];
    const beforeIndex = getEndOffset(lastChild, ctx);
    const info2 = getTokenInfo(ctx, ["}"], beforeIndex);
    return info2.index + info2.match.length;
  }
  const info = getTokenInfo(ctx, ["{", "}"], node.position.start.offset);
  return info.index + info.match.length;
}
function getTokenInfo(ctx, tokens, position) {
  let lastMatch;
  for (const t of tokens) {
    const index = lastMatch ? lastMatch.index + lastMatch.match.length : position;
    const m = typeof t === "string" ? matchOfStr(t, index) : matchOfForMulti(t, index);
    if (m == null) {
      throw new ParseError(
        `Unknown token at ${index}, expected: ${JSON.stringify(
          t
        )}, actual: ${JSON.stringify(ctx.code.slice(index, index + 10))}`,
        index,
        ctx
      );
    }
    lastMatch = m;
  }
  return lastMatch;
  function matchOfStr(search, position2) {
    const index = search.trim() === search ? skipSpaces(ctx.code, position2) : position2;
    if (ctx.code.startsWith(search, index)) {
      return {
        match: search,
        index
      };
    }
    return null;
  }
  function matchOfForMulti(search, position2) {
    for (const s of search) {
      const m = matchOfStr(s, position2);
      if (m) {
        return m;
      }
    }
    return null;
  }
}
function skipSpaces(string, position) {
  const re = /\s*/g;
  re.lastIndex = position;
  const match = re.exec(string);
  if (match) {
    return match.index + match[0].length;
  }
  return position;
}
function getSortedChildren(parent, code) {
  if (parent.type === "root" && parent.children[0]?.type === "frontmatter") {
    const children = [...parent.children];
    if (children.every((n) => n.position)) {
      return children.sort(
        (a, b) => a.position.start.offset - b.position.start.offset
      );
    }
    let start = skipSpaces(code, 0);
    if (code.startsWith("<!", start)) {
      const frontmatter = children.shift();
      const before = [];
      let first;
      while (first = children.shift()) {
        start = skipSpaces(code, start);
        if (first.type === "comment" && code.startsWith("<!--", start)) {
          start = code.indexOf("-->", start + 4) + 3;
          before.push(first);
        } else if (first.type === "doctype" && code.startsWith("<!", start)) {
          start = code.indexOf(">", start + 2) + 1;
          before.push(first);
        } else {
          children.unshift(first);
          break;
        }
      }
      return [...before, frontmatter, ...children];
    }
  }
  return parent.children;
}

// src/traverse.ts
function fallbackKeysFilter(key) {
  let value = null;
  return key !== "comments" && key !== "leadingComments" && key !== "loc" && key !== "parent" && key !== "range" && key !== "tokens" && key !== "trailingComments" && (value = this[key]) !== null && typeof value === "object" && (typeof value.type === "string" || Array.isArray(value));
}
function getFallbackKeys(node) {
  return Object.keys(node).filter(fallbackKeysFilter, node);
}
function getKeys(node, visitorKeys) {
  const keys = (visitorKeys || KEYS)[node.type] || getFallbackKeys(node);
  return keys.filter((key) => !getNodes(node, key).next().done);
}
function* getNodes(node, key) {
  const child = node[key];
  if (Array.isArray(child)) {
    for (const c of child) {
      if (isNode(c)) {
        yield c;
      }
    }
  } else if (isNode(child)) {
    yield child;
  }
}
function isNode(x) {
  return x !== null && typeof x === "object" && typeof x.type === "string";
}
function traverse(node, parent, visitor) {
  visitor.enterNode(node, parent);
  const keys = getKeys(node, visitor.visitorKeys);
  for (const key of keys) {
    for (const child of getNodes(node, key)) {
      traverse(child, node, visitor);
    }
  }
  visitor.leaveNode(node, parent);
}
function traverseNodes(node, visitor) {
  traverse(node, null, visitor);
}

// src/context/restore.ts
var RestoreNodeProcessContext = class {
  constructor(result, nodeMap) {
    this.removeTokens = /* @__PURE__ */ new Set();
    this.result = result;
    this.nodeMap = nodeMap;
  }
  addRemoveToken(test) {
    this.removeTokens.add(test);
  }
  getParent(node) {
    return this.nodeMap.get(node) || null;
  }
};
var RestoreContext = class {
  constructor(ctx) {
    this.offsets = [];
    this.virtualFragments = [];
    this.restoreNodeProcesses = [];
    this.tokens = [];
    this.ctx = ctx;
  }
  addRestoreNodeProcess(process2) {
    this.restoreNodeProcesses.push(process2);
  }
  addOffset(offset) {
    this.offsets.push(offset);
  }
  addVirtualFragmentRange(start, end) {
    const peek = this.virtualFragments[this.virtualFragments.length - 1];
    if (peek && peek.end === start) {
      peek.end = end;
      return;
    }
    this.virtualFragments.push({ start, end });
  }
  addToken(type, range) {
    if (range[0] >= range[1]) {
      return;
    }
    this.tokens.push(this.ctx.buildToken(type, range));
  }
  /**
   * Restore AST nodes
   */
  restore(result) {
    const nodeMap = remapLocationsAndGetNodeMap(result, this.tokens, {
      remapLocation: (n) => this.remapLocation(n),
      removeToken: (token) => this.virtualFragments.some(
        (f) => f.start <= token.range[0] && token.range[1] <= f.end
      )
    });
    restoreNodes(result, nodeMap, this.restoreNodeProcesses);
    const firstOffset = Math.min(
      ...[result.ast.body[0], result.ast.tokens?.[0], result.ast.comments?.[0]].filter((t) => Boolean(t)).map((t) => t.range[0])
    );
    if (firstOffset < result.ast.range[0]) {
      result.ast.range[0] = firstOffset;
      result.ast.loc.start = this.ctx.getLocFromIndex(firstOffset);
    }
  }
  remapLocation(node) {
    let [start, end] = node.range;
    const startFragment = this.virtualFragments.find(
      (f) => f.start <= start && start < f.end
    );
    if (startFragment) {
      start = startFragment.end;
    }
    const endFragment = this.virtualFragments.find(
      (f) => f.start < end && end <= f.end
    );
    if (endFragment) {
      end = endFragment.start;
      if (startFragment === endFragment) {
        start = startFragment.start;
      }
    }
    if (end < start) {
      const w = start;
      start = end;
      end = w;
    }
    const locs = this.ctx.getLocations(...this.getRemapRange(start, end));
    node.loc = locs.loc;
    node.range = locs.range;
    if (node.start != null) {
      delete node.start;
    }
    if (node.end != null) {
      delete node.end;
    }
  }
  getRemapRange(start, end) {
    if (!this.offsets.length) {
      return [start, end];
    }
    let lastStart = this.offsets[0];
    let lastEnd = this.offsets[0];
    for (const offset of this.offsets) {
      if (offset.dist <= start) {
        lastStart = offset;
      }
      if (offset.dist < end) {
        lastEnd = offset;
      } else {
        if (offset.dist === end && start === end) {
          lastEnd = offset;
        }
        break;
      }
    }
    const remapStart = lastStart.original + (start - lastStart.dist);
    const remapEnd = lastEnd.original + (end - lastEnd.dist);
    if (remapEnd < remapStart) {
      return [remapEnd, remapStart];
    }
    return [remapStart, remapEnd];
  }
};
function remapLocationsAndGetNodeMap(result, restoreTokens, {
  remapLocation,
  removeToken
}) {
  const traversed = /* @__PURE__ */ new Map();
  traverseNodes(result.ast, {
    visitorKeys: result.visitorKeys,
    enterNode: (node, p) => {
      if (!traversed.has(node)) {
        traversed.set(node, p);
        remapLocation(node);
      }
    },
    leaveNode: (_node) => {
    }
  });
  const tokens = [...restoreTokens];
  for (const token of result.ast.tokens || []) {
    if (removeToken(token)) {
      continue;
    }
    remapLocation(token);
    tokens.push(token);
  }
  result.ast.tokens = tokens;
  for (const token of result.ast.comments || []) {
    remapLocation(token);
  }
  return traversed;
}
function restoreNodes(result, nodeMap, restoreNodeProcesses) {
  const context = new RestoreNodeProcessContext(result, nodeMap);
  const restoreNodeProcessesSet = new Set(restoreNodeProcesses);
  for (const [node] of nodeMap) {
    if (!restoreNodeProcessesSet.size) {
      break;
    }
    for (const proc of [...restoreNodeProcessesSet]) {
      if (proc(node, context)) {
        restoreNodeProcessesSet.delete(proc);
      }
    }
  }
  if (context.removeTokens.size) {
    const tokens = result.ast.tokens || [];
    for (let index = tokens.length - 1; index >= 0; index--) {
      const token = tokens[index];
      for (const rt of context.removeTokens) {
        if (rt(token)) {
          tokens.splice(index, 1);
          context.removeTokens.delete(rt);
          if (!context.removeTokens.size) {
            break;
          }
        }
      }
    }
  }
}

// src/context/script.ts
var VirtualScriptContext = class {
  constructor(ctx) {
    this.script = "";
    this.consumedIndex = 0;
    this.originalCode = ctx.code;
    this.restoreContext = new RestoreContext(ctx);
  }
  skipOriginalOffset(offset) {
    this.consumedIndex += offset;
  }
  skipUntilOriginalOffset(offset) {
    this.consumedIndex = Math.max(offset, this.consumedIndex);
  }
  appendOriginal(index) {
    if (this.consumedIndex >= index) {
      return;
    }
    this.restoreContext.addOffset({
      original: this.consumedIndex,
      dist: this.script.length
    });
    this.script += this.originalCode.slice(this.consumedIndex, index);
    this.consumedIndex = index;
  }
  appendVirtualScript(virtualFragment) {
    const start = this.script.length;
    this.script += virtualFragment;
    this.restoreContext.addVirtualFragmentRange(start, this.script.length);
  }
};

// src/parser/process-template.ts
function processTemplate(ctx, resultTemplate) {
  let uniqueIdSeq = 0;
  const usedUniqueIds = /* @__PURE__ */ new Set();
  const script = new VirtualScriptContext(ctx);
  let fragmentOpened = false;
  function openRootFragment(startOffset) {
    script.appendVirtualScript("<>");
    fragmentOpened = true;
    script.restoreContext.addRestoreNodeProcess((scriptNode, { result }) => {
      if (scriptNode.type === import_types.AST_NODE_TYPES.ExpressionStatement && scriptNode.expression.type === import_types.AST_NODE_TYPES.JSXFragment && scriptNode.range[0] === startOffset && result.ast.body.includes(scriptNode)) {
        const index = result.ast.body.indexOf(scriptNode);
        const rootFragment = result.ast.body[index] = scriptNode.expression;
        delete rootFragment.closingFragment;
        delete rootFragment.openingFragment;
        rootFragment.type = "AstroFragment";
        return true;
      }
      return false;
    });
  }
  walkElements(
    resultTemplate.ast,
    ctx.code,
    // eslint-disable-next-line complexity -- X(
    (node, [parent]) => {
      if (node.type === "frontmatter") {
        const start = node.position.start.offset;
        if (fragmentOpened) {
          script.appendVirtualScript("</>;");
          fragmentOpened = false;
        }
        script.appendOriginal(start);
        script.skipOriginalOffset(3);
        const end = getEndOffset(node, ctx);
        const scriptStart = start + 3;
        let scriptEnd = end - 3;
        let endChar;
        while (scriptStart < scriptEnd - 1 && (endChar = ctx.code[scriptEnd - 1]) && !endChar.trim()) {
          scriptEnd--;
        }
        script.appendOriginal(scriptEnd);
        script.appendVirtualScript("\n;");
        script.skipOriginalOffset(end - scriptEnd);
        script.restoreContext.addRestoreNodeProcess(
          (_scriptNode, { result }) => {
            for (let index = 0; index < result.ast.body.length; index++) {
              const st = result.ast.body[index];
              if (st.type === import_types.AST_NODE_TYPES.EmptyStatement) {
                if (st.range[0] === scriptEnd && st.range[1] === scriptEnd) {
                  result.ast.body.splice(index, 1);
                  break;
                }
              }
            }
            return true;
          }
        );
        script.restoreContext.addToken(import_types.AST_TOKEN_TYPES.Punctuator, [
          node.position.start.offset,
          node.position.start.offset + 3
        ]);
        script.restoreContext.addToken(import_types.AST_TOKEN_TYPES.Punctuator, [
          end - 3,
          end
        ]);
      } else if (isTag(node)) {
        if (parent.type === "expression") {
          const index = parent.children.indexOf(node);
          const before = parent.children[index - 1];
          if (!before || !isTag(before)) {
            const after = parent.children[index + 1];
            if (after && (isTag(after) || after.type === "comment")) {
              const start2 = node.position.start.offset;
              script.appendOriginal(start2);
              script.appendVirtualScript("<>");
              script.restoreContext.addRestoreNodeProcess((scriptNode) => {
                if (scriptNode.range[0] === start2 && scriptNode.type === import_types.AST_NODE_TYPES.JSXFragment) {
                  delete scriptNode.openingFragment;
                  delete scriptNode.closingFragment;
                  const fragmentNode = scriptNode;
                  fragmentNode.type = "AstroFragment";
                  const last = fragmentNode.children[fragmentNode.children.length - 1];
                  if (fragmentNode.range[1] < last.range[1]) {
                    fragmentNode.range[1] = last.range[1];
                    fragmentNode.loc.end = ctx.getLocFromIndex(
                      fragmentNode.range[1]
                    );
                  }
                  return true;
                }
                return false;
              });
            }
          }
        }
        const start = node.position.start.offset;
        script.appendOriginal(start);
        if (!fragmentOpened) {
          openRootFragment(start);
        }
        for (const attr of node.attributes) {
          if (attr.kind === "quoted" || attr.kind === "empty" || attr.kind === "expression" || attr.kind === "template-literal") {
            const needPunctuatorsProcess = node.type === "component" || node.type === "fragment" ? /[.:@]/u.test(attr.name) : /[.@]/u.test(attr.name) || attr.name.startsWith(":");
            if (needPunctuatorsProcess) {
              processAttributePunctuators(attr);
            }
          }
          if (attr.kind === "shorthand") {
            const start2 = attr.position.start.offset;
            script.appendOriginal(start2);
            const jsxName = /[\s"'[\]{}]/u.test(attr.name) ? generateUniqueId(attr.name) : attr.name;
            script.appendVirtualScript(`${jsxName}=`);
            script.restoreContext.addRestoreNodeProcess((scriptNode) => {
              if (scriptNode.type === import_types.AST_NODE_TYPES.JSXAttribute && scriptNode.range[0] === start2) {
                const attrNode = scriptNode;
                attrNode.type = "AstroShorthandAttribute";
                const locs = ctx.getLocations(
                  ...attrNode.value.expression.range
                );
                if (jsxName !== attr.name) {
                  attrNode.name.name = attr.name;
                }
                attrNode.name.range = locs.range;
                attrNode.name.loc = locs.loc;
                return true;
              }
              return false;
            });
          } else if (attr.kind === "template-literal") {
            const attrStart = attr.position.start.offset;
            const start2 = calcAttributeValueStartOffset(attr, ctx);
            const end = calcAttributeEndOffset(attr, ctx);
            script.appendOriginal(start2);
            script.appendVirtualScript("{");
            script.appendOriginal(end);
            script.appendVirtualScript("}");
            script.restoreContext.addRestoreNodeProcess((scriptNode) => {
              if (scriptNode.type === import_types.AST_NODE_TYPES.JSXAttribute && scriptNode.range[0] === attrStart) {
                const attrNode = scriptNode;
                attrNode.type = "AstroTemplateLiteralAttribute";
                return true;
              }
              return false;
            });
          }
        }
        const closing = getSelfClosingTag(node, ctx);
        if (closing && closing.end === ">") {
          script.appendOriginal(closing.offset - 1);
          script.appendVirtualScript("/");
        }
        if (node.name === "script" || node.name === "style") {
          const text = node.children[0];
          if (text && text.type === "text") {
            const styleNodeStart = node.position.start.offset;
            const start2 = text.position.start.offset;
            script.appendOriginal(start2);
            script.skipOriginalOffset(text.value.length);
            script.restoreContext.addRestoreNodeProcess((scriptNode) => {
              if (scriptNode.type === import_types.AST_NODE_TYPES.JSXElement && scriptNode.range[0] === styleNodeStart) {
                const textNode = {
                  type: "AstroRawText",
                  value: text.value,
                  raw: text.value,
                  parent: scriptNode,
                  ...ctx.getLocations(start2, start2 + text.value.length)
                };
                scriptNode.children = [textNode];
                return true;
              }
              return false;
            });
            script.restoreContext.addToken(import_types.AST_TOKEN_TYPES.JSXText, [
              start2,
              start2 + text.value.length
            ]);
          }
        }
      } else if (node.type === "comment") {
        const start = node.position.start.offset;
        const end = getEndOffset(node, ctx);
        const length = end - start;
        script.appendOriginal(start);
        if (!fragmentOpened) {
          openRootFragment(start);
        }
        script.appendOriginal(start + 1);
        script.appendVirtualScript(`></`);
        script.skipOriginalOffset(length - 2);
        script.appendOriginal(end);
        script.restoreContext.addRestoreNodeProcess((scriptNode, context) => {
          if (scriptNode.range[0] === start && scriptNode.type === import_types.AST_NODE_TYPES.JSXFragment) {
            delete scriptNode.children;
            delete scriptNode.openingFragment;
            delete scriptNode.closingFragment;
            delete scriptNode.expression;
            const commentNode = scriptNode;
            commentNode.type = "AstroHTMLComment";
            commentNode.value = node.value;
            context.addRemoveToken(
              (token) => token.value === "<" && token.range[0] === scriptNode.range[0]
            );
            context.addRemoveToken(
              (token) => token.value === ">" && token.range[1] === scriptNode.range[1]
            );
            return true;
          }
          return false;
        });
        script.restoreContext.addToken("HTMLComment", [
          start,
          start + length
        ]);
      } else if (node.type === "doctype") {
        const start = node.position.start.offset;
        const end = getEndOffset(node, ctx);
        const length = end - start;
        script.appendOriginal(start);
        if (!fragmentOpened) {
          openRootFragment(start);
        }
        script.appendOriginal(start + 1);
        script.appendVirtualScript(`></`);
        script.skipOriginalOffset(length - 2);
        script.appendOriginal(end);
        script.restoreContext.addRestoreNodeProcess((scriptNode, context) => {
          if (scriptNode.range[0] === start && scriptNode.type === import_types.AST_NODE_TYPES.JSXFragment) {
            delete scriptNode.children;
            delete scriptNode.openingFragment;
            delete scriptNode.closingFragment;
            delete scriptNode.expression;
            const doctypeNode = scriptNode;
            doctypeNode.type = "AstroDoctype";
            context.addRemoveToken(
              (token) => token.value === "<" && token.range[0] === scriptNode.range[0]
            );
            context.addRemoveToken(
              (token) => token.value === ">" && token.range[1] === scriptNode.range[1]
            );
            return true;
          }
          return false;
        });
        script.restoreContext.addToken("HTMLDocType", [
          start,
          end
        ]);
      } else {
        const start = node.position.start.offset;
        script.appendOriginal(start);
        if (!fragmentOpened) {
          openRootFragment(start);
        }
      }
    },
    (node, [parent]) => {
      if (isTag(node)) {
        const closing = getSelfClosingTag(node, ctx);
        if (!closing) {
          const end = getEndTag(node, ctx);
          if (!end) {
            const offset = calcContentEndOffset(node, ctx);
            script.appendOriginal(offset);
            script.appendVirtualScript(`</${node.name}>`);
            script.restoreContext.addRestoreNodeProcess(
              (scriptNode, context) => {
                const parent2 = context.getParent(scriptNode);
                if (scriptNode.range[0] === offset && scriptNode.type === import_types.AST_NODE_TYPES.JSXClosingElement && parent2.type === import_types.AST_NODE_TYPES.JSXElement) {
                  parent2.closingElement = null;
                  return true;
                }
                return false;
              }
            );
          }
        }
      }
      if ((isTag(node) || node.type === "comment") && parent.type === "expression") {
        const index = parent.children.indexOf(node);
        const after = parent.children[index + 1];
        if (!after || !isTag(after) && after.type !== "comment") {
          const before = parent.children[index - 1];
          if (before && (isTag(before) || before.type === "comment")) {
            const end = getEndOffset(node, ctx);
            script.appendOriginal(end);
            script.appendVirtualScript("</>");
          }
        }
      }
    }
  );
  if (fragmentOpened) {
    const last = resultTemplate.ast.children[resultTemplate.ast.children.length - 1];
    const end = getEndOffset(last, ctx);
    script.appendOriginal(end);
    script.appendVirtualScript("</>;");
  }
  script.appendOriginal(ctx.code.length);
  return script;
  function processAttributePunctuators(attr) {
    const start = attr.position.start.offset;
    let targetIndex = start;
    let colonOffset;
    for (let index = 0; index < attr.name.length; index++) {
      const char = attr.name[index];
      if (char !== ":" && char !== "." && char !== "@") {
        continue;
      }
      if (index === 0) {
        targetIndex++;
      }
      const punctuatorIndex = start + index;
      script.appendOriginal(punctuatorIndex);
      script.skipOriginalOffset(1);
      script.appendVirtualScript(`_`);
      if (char === ":" && index !== 0 && colonOffset == null) {
        colonOffset = index;
      }
    }
    if (colonOffset != null) {
      const punctuatorIndex = start + colonOffset;
      script.restoreContext.addToken(import_types.AST_TOKEN_TYPES.JSXIdentifier, [
        start,
        punctuatorIndex
      ]);
      script.restoreContext.addToken(import_types.AST_TOKEN_TYPES.Punctuator, [
        punctuatorIndex,
        punctuatorIndex + 1
      ]);
      script.restoreContext.addToken(import_types.AST_TOKEN_TYPES.JSXIdentifier, [
        punctuatorIndex + 1,
        start + attr.name.length
      ]);
    } else {
      script.restoreContext.addToken(import_types.AST_TOKEN_TYPES.JSXIdentifier, [
        start,
        start + attr.name.length
      ]);
    }
    script.restoreContext.addRestoreNodeProcess((scriptNode, context) => {
      if (scriptNode.type === import_types.AST_NODE_TYPES.JSXAttribute && scriptNode.range[0] === targetIndex) {
        const baseNameNode = scriptNode.name;
        if (colonOffset != null) {
          const nameNode = {
            ...baseNameNode,
            type: import_types.AST_NODE_TYPES.JSXNamespacedName,
            namespace: {
              type: import_types.AST_NODE_TYPES.JSXIdentifier,
              name: attr.name.slice(0, colonOffset),
              ...ctx.getLocations(
                baseNameNode.range[0],
                baseNameNode.range[0] + colonOffset
              )
            },
            name: {
              type: import_types.AST_NODE_TYPES.JSXIdentifier,
              name: attr.name.slice(colonOffset + 1),
              ...ctx.getLocations(
                baseNameNode.range[0] + colonOffset + 1,
                baseNameNode.range[1]
              )
            }
          };
          scriptNode.name = nameNode;
          nameNode.namespace.parent = nameNode;
          nameNode.name.parent = nameNode;
        } else {
          if (baseNameNode.type === import_types.AST_NODE_TYPES.JSXIdentifier) {
            const nameNode = {
              ...baseNameNode,
              name: attr.name
            };
            scriptNode.name = nameNode;
          } else {
            const nameNode = {
              ...baseNameNode,
              namespace: {
                ...baseNameNode.namespace,
                name: attr.name.slice(
                  baseNameNode.namespace.range[0] - start,
                  baseNameNode.namespace.range[1] - start
                )
              },
              name: {
                ...baseNameNode.name,
                name: attr.name.slice(
                  baseNameNode.name.range[0] - start,
                  baseNameNode.name.range[1] - start
                )
              }
            };
            scriptNode.name = nameNode;
            nameNode.namespace.parent = nameNode;
            nameNode.name.parent = nameNode;
          }
        }
        context.addRemoveToken(
          (token) => token.range[0] === baseNameNode.range[0] && token.range[1] === baseNameNode.range[1]
        );
        return true;
      }
      return false;
    });
  }
  function generateUniqueId(base) {
    let candidate = `$_${base.replace(/\W/g, "_")}${uniqueIdSeq++}`;
    while (usedUniqueIds.has(candidate) || ctx.code.includes(candidate)) {
      candidate = `$_${base.replace(/\W/g, "_")}${uniqueIdSeq++}`;
    }
    usedUniqueIds.add(candidate);
    return candidate;
  }
}

// src/util/index.ts
function sortedLastIndex(array, compare) {
  let lower = 0;
  let upper = array.length;
  while (lower < upper) {
    const mid = Math.floor(lower + (upper - lower) / 2);
    const target = compare(array[mid]);
    if (target < 0) {
      lower = mid + 1;
    } else if (target > 0) {
      upper = mid;
    } else {
      return mid + 1;
    }
  }
  return upper;
}
function addElementToSortedArray(array, element, compare) {
  const index = sortedLastIndex(array, (target) => compare(target, element));
  array.splice(index, 0, element);
}
function addElementsToSortedArray(array, elements, compare) {
  if (!elements.length) {
    return;
  }
  let last = elements[0];
  let index = sortedLastIndex(array, (target) => compare(target, last));
  for (const element of elements) {
    if (compare(last, element) > 0) {
      index = sortedLastIndex(array, (target) => compare(target, element));
    }
    let e = array[index];
    while (e && compare(e, element) <= 0) {
      e = array[++index];
    }
    array.splice(index, 0, element);
    last = element;
  }
}

// src/context/index.ts
var Context = class {
  constructor(code, filePath) {
    this.locsMap = /* @__PURE__ */ new Map();
    this.state = {};
    this.locs = new LinesAndColumns(code);
    this.code = code;
    this.filePath = filePath;
  }
  getLocFromIndex(index) {
    let loc = this.locsMap.get(index);
    if (!loc) {
      loc = this.locs.getLocFromIndex(index);
      this.locsMap.set(index, loc);
    }
    return {
      line: loc.line,
      column: loc.column
    };
  }
  getIndexFromLoc(loc) {
    return this.locs.getIndexFromLoc(loc);
  }
  /**
   * Get the location information of the given indexes.
   */
  getLocations(start, end) {
    return {
      range: [start, end],
      loc: {
        start: this.getLocFromIndex(start),
        end: this.getLocFromIndex(end)
      }
    };
  }
  /**
   * Build token
   */
  buildToken(type, range) {
    return {
      type,
      value: this.getText(range),
      ...this.getLocations(...range)
    };
  }
  /**
   * get text
   */
  getText(range) {
    return this.code.slice(range[0], range[1]);
  }
  get originalAST() {
    return this.state.originalAST;
  }
  set originalAST(originalAST) {
    this.state.originalAST = originalAST;
  }
};
var LinesAndColumns = class {
  constructor(origCode) {
    const len = origCode.length;
    const lineStartIndices = [0];
    const crs = [];
    let normalizedCode = "";
    for (let index = 0; index < len; ) {
      const c = origCode[index++];
      if (c === "\r") {
        const next = origCode[index++] || "";
        if (next === "\n") {
          normalizedCode += next;
          crs.push(index - 2);
          lineStartIndices.push(index);
        } else {
          normalizedCode += `
${next}`;
          lineStartIndices.push(index - 1);
        }
      } else {
        normalizedCode += c;
        if (c === "\n") {
          lineStartIndices.push(index);
        }
      }
    }
    this.lineStartIndices = lineStartIndices;
    this.code = origCode;
    this.normalizedLineFeed = new NormalizedLineFeed(normalizedCode, crs);
  }
  getLocFromIndex(index) {
    const lineNumber = sortedLastIndex(
      this.lineStartIndices,
      (target) => target - index
    );
    return {
      line: lineNumber,
      column: index - this.lineStartIndices[lineNumber - 1]
    };
  }
  getIndexFromLoc(loc) {
    const lineIndex = loc.line - 1;
    if (this.lineStartIndices.length > lineIndex) {
      const lineStartIndex = this.lineStartIndices[lineIndex];
      const positionIndex = lineStartIndex + loc.column;
      return positionIndex;
    } else if (this.lineStartIndices.length === lineIndex) {
      return this.code.length + loc.column;
    }
    return this.code.length + loc.column;
  }
  getNormalizedLineFeed() {
    return this.normalizedLineFeed;
  }
};
var NormalizedLineFeed = class {
  get needRemap() {
    return this.offsets.length > 0;
  }
  constructor(code, offsets) {
    this.code = code;
    this.offsets = offsets;
    if (offsets.length) {
      const cache = {};
      this.remapIndex = (index) => {
        let result = cache[index];
        if (result != null) {
          return result;
        }
        result = index;
        for (const offset of offsets) {
          if (offset < result) {
            result++;
          } else {
            break;
          }
        }
        return cache[index] = result;
      };
    } else {
      this.remapIndex = (i) => i;
    }
  }
};

// src/parser/astro-parser/parse.ts
var service = __toESM(require("astrojs-compiler-sync"));
function parse2(code, ctx) {
  const result = service.parse(code, { position: true });
  for (const { code: code2, text, location, severity } of result.diagnostics || []) {
    if (severity === 1) {
      ctx.originalAST = result.ast;
      throw new ParseError(`${text} [${code2}]`, location, ctx);
    }
  }
  if (!result.ast.children) {
    result.ast.children = [];
  }
  const htmlElement = result.ast.children.find(
    (n) => n.type === "element" && n.name === "html"
  );
  if (!result._adjusted) {
    if (htmlElement) {
      adjustHTML(result.ast, htmlElement, ctx);
    }
    fixLocations(result.ast, ctx);
    result._adjusted = true;
  }
  return result;
}
function adjustHTML(ast, htmlElement, ctx) {
  const htmlEnd = ctx.code.indexOf("</html");
  if (htmlEnd == null) {
    return;
  }
  const hasTokenAfter = Boolean(ctx.code.slice(htmlEnd + 7).trim());
  const children = [...htmlElement.children];
  for (const child of children) {
    const offset = child.position?.start.offset;
    if (hasTokenAfter && offset != null) {
      if (htmlEnd <= offset) {
        htmlElement.children.splice(htmlElement.children.indexOf(child), 1);
        ast.children.push(child);
      }
    }
    if (child.type === "element" && child.name === "body") {
      adjustHTMLBody(ast, htmlElement, htmlEnd, hasTokenAfter, child, ctx);
    }
  }
}
function adjustHTMLBody(ast, htmlElement, htmlEnd, hasTokenAfterHtmlEnd, bodyElement, ctx) {
  const bodyEnd = ctx.code.indexOf("</body");
  if (bodyEnd == null) {
    return;
  }
  const hasTokenAfter = Boolean(ctx.code.slice(bodyEnd + 7, htmlEnd).trim());
  if (!hasTokenAfter && !hasTokenAfterHtmlEnd) {
    return;
  }
  const children = [...bodyElement.children];
  for (const child of children) {
    const offset = child.position?.start.offset;
    if (offset != null) {
      if (bodyEnd <= offset) {
        if (hasTokenAfterHtmlEnd && htmlEnd <= offset) {
          bodyElement.children.splice(bodyElement.children.indexOf(child), 1);
          ast.children.push(child);
        } else if (hasTokenAfter) {
          bodyElement.children.splice(bodyElement.children.indexOf(child), 1);
          htmlElement.children.push(child);
        }
      }
    }
  }
}
function fixLocations(node, ctx) {
  let start = 0;
  walk(
    node,
    ctx.code,
    // eslint-disable-next-line complexity -- X(
    (node2, [parent]) => {
      if (node2.type === "frontmatter") {
        start = node2.position.start.offset = tokenIndex(ctx, "---", start);
        if (!node2.position.end) {
          node2.position.end = {};
        }
        start = node2.position.end.offset = tokenIndex(ctx, "---", start + 3 + node2.value.length) + 3;
      } else if (node2.type === "fragment" || node2.type === "element" || node2.type === "component" || node2.type === "custom-element") {
        if (!node2.position) {
          node2.position = { start: {}, end: {} };
        }
        start = node2.position.start.offset = tokenIndex(ctx, "<", start);
        start += 1;
        start += node2.name.length;
        if (!node2.attributes.length) {
          start = calcStartTagEndOffset(node2, ctx);
        }
      } else if (node2.type === "attribute") {
        fixLocationForAttr(node2, ctx, start);
        start = calcAttributeEndOffset(node2, ctx);
        if (node2.position.end) {
          node2.position.end.offset = start;
        }
      } else if (node2.type === "comment") {
        node2.position.start.offset = tokenIndex(ctx, "<!--", start);
        start = calcCommentEndOffset(node2, ctx);
        if (node2.position.end) {
          node2.position.end.offset = start;
        }
      } else if (node2.type === "text") {
        if (parent.type === "element" && (parent.name === "script" || parent.name === "style")) {
          node2.position.start.offset = start;
          start = ctx.code.indexOf(`</${parent.name}`, start);
          if (start < 0) {
            start = ctx.code.length;
          }
        } else {
          const index = tokenIndexSafe(ctx.code, node2.value, start);
          if (index != null) {
            start = node2.position.start.offset = index;
            start += node2.value.length;
          } else {
            node2.position.start.offset = start;
            const value = node2.value.replace(/\s+/gu, "");
            for (const char of value) {
              const index2 = tokenIndex(ctx, char, start);
              start = index2 + 1;
            }
            start = skipSpaces(ctx.code, start);
            node2.value = ctx.code.slice(node2.position.start.offset, start);
          }
        }
        if (node2.position.end) {
          node2.position.end.offset = start;
        }
      } else if (node2.type === "expression") {
        start = node2.position.start.offset = tokenIndex(ctx, "{", start);
        start += 1;
      } else if (node2.type === "doctype") {
        if (!node2.position) {
          node2.position = { start: {}, end: {} };
        }
        if (!node2.position.end) {
          node2.position.end = {};
        }
        start = node2.position.start.offset = tokenIndex(ctx, "<!", start);
        start += 2;
        start = node2.position.end.offset = ctx.code.indexOf(">", start) + 1;
      } else if (node2.type === "root") {
      }
    },
    (node2, [parent]) => {
      if (node2.type === "attribute") {
        const attributes = parent.attributes;
        if (attributes[attributes.length - 1] === node2) {
          start = calcStartTagEndOffset(parent, ctx);
        }
      } else if (node2.type === "expression") {
        start = tokenIndex(ctx, "}", start) + 1;
      } else if (node2.type === "fragment" || node2.type === "element" || node2.type === "component" || node2.type === "custom-element") {
        if (!getSelfClosingTag(node2, ctx)) {
          const closeTagStart = tokenIndexSafe(
            ctx.code,
            `</${node2.name}`,
            start
          );
          if (closeTagStart != null) {
            start = closeTagStart + 2 + node2.name.length;
            start = tokenIndex(ctx, ">", start) + 1;
          }
        }
      } else {
        return;
      }
      if (node2.position.end) {
        node2.position.end.offset = start;
      }
    }
  );
}
function fixLocationForAttr(node, ctx, start) {
  if (node.kind === "empty") {
    node.position.start.offset = tokenIndex(ctx, node.name, start);
  } else if (node.kind === "quoted") {
    node.position.start.offset = tokenIndex(ctx, node.name, start);
  } else if (node.kind === "expression") {
    node.position.start.offset = tokenIndex(ctx, node.name, start);
  } else if (node.kind === "shorthand") {
    node.position.start.offset = tokenIndex(ctx, "{", start);
  } else if (node.kind === "spread") {
    node.position.start.offset = tokenIndex(ctx, "{", start);
  } else if (node.kind === "template-literal") {
    node.position.start.offset = tokenIndex(ctx, node.name, start);
  } else {
    throw new ParseError(
      `Unknown attr kind: ${node.kind}`,
      node.position.start.offset,
      ctx
    );
  }
}
function tokenIndex(ctx, token, position) {
  const index = tokenIndexSafe(ctx.code, token, position);
  if (index == null) {
    const start = token.trim() === token ? skipSpaces(ctx.code, position) : position;
    throw new ParseError(
      `Unknown token at ${start}, expected: ${JSON.stringify(
        token
      )}, actual: ${JSON.stringify(ctx.code.slice(start, start + 10))}`,
      start,
      ctx
    );
  }
  return index;
}
function tokenIndexSafe(string, token, position) {
  const index = token.trim() === token ? skipSpaces(string, position) : position;
  if (string.startsWith(token, index)) {
    return index;
  }
  return null;
}

// src/parser/lru-cache.ts
var LruCache = class extends Map {
  constructor(capacity) {
    super();
    this.capacity = capacity;
  }
  get(key) {
    if (!this.has(key)) {
      return void 0;
    }
    const value = super.get(key);
    this.set(key, value);
    return value;
  }
  set(key, value) {
    this.delete(key);
    super.set(key, value);
    if (this.size > this.capacity) {
      this.deleteOldestEntry();
    }
    return this;
  }
  deleteOldestEntry() {
    for (const entry of this) {
      this.delete(entry[0]);
      return;
    }
  }
};

// src/parser/template.ts
var lruCache = new LruCache(5);
function parseTemplate(code, filePath) {
  const cache = lruCache.get(code);
  if (cache) {
    return cache;
  }
  const ctx = new Context(code, filePath);
  const normalized = ctx.locs.getNormalizedLineFeed();
  const ctxForAstro = normalized.needRemap ? new Context(normalized.code, filePath) : ctx;
  try {
    const result = parse2(normalized?.code ?? code, ctxForAstro);
    if (normalized.needRemap) {
      remap(result, normalized, code, ctxForAstro);
      ctx.originalAST = ctxForAstro.originalAST;
    }
    const templateResult = {
      result,
      context: ctx
    };
    lruCache.set(code, templateResult);
    return templateResult;
  } catch (e) {
    if (typeof e.pos === "number") {
      const err = new ParseError(e.message, normalized?.remapIndex(e.pos), ctx);
      err.astroCompilerError = e;
      throw err;
    }
    throw e;
  }
}
function remap(result, normalized, originalCode, ctxForAstro) {
  const remapDataMap = /* @__PURE__ */ new Map();
  walk(
    result.ast,
    normalized.code,
    (node) => {
      const start = normalized.remapIndex(node.position.start.offset);
      let end, value;
      if (node.position.end) {
        end = normalized.remapIndex(node.position.end.offset);
        if (node.position.start.offset === start && node.position.end.offset === end) {
          return;
        }
      }
      if (node.type === "text") {
        value = originalCode.slice(
          start,
          normalized.remapIndex(getEndOffset(node, ctxForAstro))
        );
      } else if (node.type === "comment") {
        value = originalCode.slice(
          start + 4,
          normalized.remapIndex(getEndOffset(node, ctxForAstro)) - 3
        );
      } else if (node.type === "attribute") {
        if (node.kind !== "empty" && node.kind !== "shorthand" && node.kind !== "spread") {
          let valueStart = normalized.remapIndex(
            calcAttributeValueStartOffset(node, ctxForAstro)
          );
          let valueEnd = normalized.remapIndex(
            calcAttributeEndOffset(node, ctxForAstro)
          );
          if (node.kind !== "quoted" || originalCode[valueStart] === '"' || originalCode[valueStart] === "'") {
            valueStart++;
            valueEnd--;
          }
          value = originalCode.slice(valueStart, valueEnd);
        }
      }
      remapDataMap.set(node, {
        start,
        end,
        value
      });
    },
    (_node) => {
    }
  );
  for (const [node, remapData] of remapDataMap) {
    node.position.start.offset = remapData.start;
    if (node.position.end) {
      node.position.end.offset = remapData.end;
    }
    if (node.type === "text" || node.type === "comment" || node.type === "attribute" && node.kind !== "empty" && node.kind !== "shorthand" && node.kind !== "spread") {
      node.value = remapData.value;
    }
  }
}

// src/context/parser-options.ts
var import_path5 = __toESM(require("path"));
var import_fs3 = __toESM(require("fs"));

// src/context/resolve-parser/espree.ts
var import_module2 = require("module");
var import_path4 = __toESM(require("path"));
var espreeCache = null;
function isLinterPath(p) {
  return (
    // ESLint 6 and above
    p.includes(`eslint${import_path4.default.sep}lib${import_path4.default.sep}linter${import_path4.default.sep}linter.js`) || // ESLint 5
    p.includes(`eslint${import_path4.default.sep}lib${import_path4.default.sep}linter.js`)
  );
}
function getEspree() {
  if (!espreeCache) {
    const linterPath = Object.keys(require.cache || {}).find(isLinterPath);
    if (linterPath) {
      try {
        espreeCache = (0, import_module2.createRequire)(linterPath)("espree");
      } catch {
      }
    }
    if (!espreeCache) {
      espreeCache = require("espree");
    }
  }
  return espreeCache;
}

// src/context/resolve-parser/index.ts
function getParserForLang(attrs, parser) {
  if (parser) {
    if (typeof parser === "string" || isParserObject(parser)) {
      return parser;
    }
    if (typeof parser === "object") {
      const value = parser[attrs.lang || "js"];
      if (typeof value === "string" || isParserObject(value)) {
        return value;
      }
    }
  }
  return "espree";
}
function getParser(attrs, parser) {
  const parserValue = getParserForLang(attrs, parser);
  if (isParserObject(parserValue)) {
    return parserValue;
  }
  if (parserValue !== "espree") {
    return require(parserValue);
  }
  return getEspree();
}

// src/context/parser-options.ts
var TS_PARSER_NAMES = [
  "@typescript-eslint/parser",
  "typescript-eslint-parser-for-extra-files"
];
var ParserOptionsContext = class {
  constructor(options) {
    this.state = {};
    const parserOptions = {
      ecmaVersion: 2020,
      sourceType: "module",
      loc: true,
      range: true,
      raw: true,
      tokens: true,
      comment: true,
      eslintVisitorKeys: true,
      // eslintScopeManager: true,
      ...options || {}
    };
    parserOptions.ecmaFeatures = {
      ...parserOptions.ecmaFeatures || {},
      jsx: true
    };
    parserOptions.sourceType = "module";
    if (parserOptions.ecmaVersion <= 5 || parserOptions.ecmaVersion == null) {
      parserOptions.ecmaVersion = 2015;
    }
    this.parserOptions = parserOptions;
  }
  getParser() {
    return getParser({}, this.parserOptions.parser);
  }
  getTSParserName() {
    if (this.state.ts != null) {
      return this.state.ts === false ? null : this.state.ts.parserName;
    }
    const parserValue = getParserForLang({}, this.parserOptions?.parser);
    if (typeof parserValue !== "string") {
      const name2 = getTSParserNameFromObject(parserValue);
      if (name2) {
        this.state.ts = { parserName: name2 };
        return this.state.ts.parserName;
      }
      if (maybeTSESLintParserObject(parserValue) || isTSESLintParserObject(parserValue)) {
        this.state.ts = { parserName: "$unknown$" };
        return this.state.ts.parserName;
      }
      this.state.ts = false;
      return null;
    }
    const parserName = parserValue;
    if (TS_PARSER_NAMES.includes(parserName)) {
      this.state.ts = { parserName };
      return this.state.ts.parserName;
    }
    if (TS_PARSER_NAMES.some((nm) => parserName.includes(nm))) {
      let targetPath = parserName;
      while (targetPath) {
        const pkgPath = import_path5.default.join(targetPath, "package.json");
        if (import_fs3.default.existsSync(pkgPath)) {
          try {
            const pkgName = JSON.parse(import_fs3.default.readFileSync(pkgPath, "utf-8"))?.name;
            if (TS_PARSER_NAMES.includes(pkgName)) {
              this.state.ts = { parserName: pkgName };
              return this.state.ts.parserName;
            }
            this.state.ts = false;
            return null;
          } catch {
            this.state.ts = false;
            return null;
          }
        }
        const parent = import_path5.default.dirname(targetPath);
        if (targetPath === parent) {
          break;
        }
        targetPath = parent;
      }
    }
    this.state.ts = false;
    return null;
  }
  isTypeScript() {
    return Boolean(this.getTSParserName());
  }
};

// src/parser/scope/index.ts
var import_scope_manager2 = require("@typescript-eslint/scope-manager");
var READ_FLAG = 1;
var WRITE_FLAG = 2;
var READ_WRITE_FLAG = 3;
var REFERENCE_TYPE_VALUE_FLAG = 1;
var REFERENCE_TYPE_TYPE_FLAG = 2;
function getProgramScope(scopeManager) {
  const globalScope = scopeManager.globalScope;
  return globalScope.childScopes.find((s) => s.type === "module") || globalScope;
}
function removeAllScopeAndVariableAndReference(target, info) {
  const targetScopes = /* @__PURE__ */ new Set();
  traverseNodes(target, {
    visitorKeys: info.visitorKeys,
    enterNode(node) {
      const scope = info.scopeManager.acquire(node);
      if (scope) {
        targetScopes.add(scope);
        return;
      }
      if (node.type === "Identifier") {
        let scope2 = getInnermostScopeFromNode(info.scopeManager, node);
        while (scope2 && scope2.block.type !== "Program" && target.range[0] <= scope2.block.range[0] && scope2.block.range[1] <= target.range[1]) {
          scope2 = scope2.upper;
        }
        if (targetScopes.has(scope2)) {
          return;
        }
        removeIdentifierVariable(node, scope2);
        removeIdentifierReference(node, scope2);
      }
    },
    leaveNode() {
    }
  });
  for (const scope of targetScopes) {
    removeScope(info.scopeManager, scope);
  }
}
function addVirtualReference(node, variable, scope, status) {
  const reference = new import_scope_manager2.Reference(
    node,
    scope,
    status.write && status.read ? READ_WRITE_FLAG : status.write ? WRITE_FLAG : READ_FLAG,
    void 0,
    // writeExpr
    void 0,
    // maybeImplicitGlobal
    void 0,
    // init
    status.typeRef ? REFERENCE_TYPE_TYPE_FLAG : REFERENCE_TYPE_VALUE_FLAG
  );
  reference.astroVirtualReference = true;
  addReference(variable.references, reference);
  reference.resolved = variable;
  if (status.forceUsed) {
    variable.eslintUsed = true;
  }
  return reference;
}
function addGlobalVariable(reference, scopeManager) {
  const globalScope = scopeManager.globalScope;
  const name2 = reference.identifier.name;
  let variable = globalScope.set.get(name2);
  if (!variable) {
    variable = new import_scope_manager2.Variable(name2, globalScope);
    globalScope.variables.push(variable);
    globalScope.set.set(name2, variable);
  }
  reference.resolved = variable;
  variable.references.push(reference);
  return variable;
}
function removeReferenceFromThrough(reference, baseScope) {
  const variable = reference.resolved;
  const name2 = reference.identifier.name;
  let scope = baseScope;
  while (scope) {
    for (const ref of [...scope.through]) {
      if (reference === ref) {
        scope.through.splice(scope.through.indexOf(ref), 1);
      } else if (ref.identifier.name === name2) {
        ref.resolved = variable;
        if (!variable.references.includes(ref)) {
          addReference(variable.references, ref);
        }
        scope.through.splice(scope.through.indexOf(ref), 1);
      }
    }
    scope = scope.upper;
  }
}
function removeScope(scopeManager, scope) {
  for (const childScope of scope.childScopes) {
    removeScope(scopeManager, childScope);
  }
  while (scope.references[0]) {
    removeReference(scope.references[0], scope);
  }
  const upper = scope.upper;
  if (upper) {
    const index2 = upper.childScopes.indexOf(scope);
    if (index2 >= 0) {
      upper.childScopes.splice(index2, 1);
    }
  }
  const index = scopeManager.scopes.indexOf(scope);
  if (index >= 0) {
    scopeManager.scopes.splice(index, 1);
  }
}
function removeReference(reference, baseScope) {
  if (reference.resolved) {
    if (reference.resolved.defs.some((d) => d.name === reference.identifier)) {
      const varIndex = baseScope.variables.indexOf(reference.resolved);
      if (varIndex >= 0) {
        baseScope.variables.splice(varIndex, 1);
      }
      const name2 = reference.identifier.name;
      if (reference.resolved === baseScope.set.get(name2)) {
        baseScope.set.delete(name2);
      }
    } else {
      const refIndex = reference.resolved.references.indexOf(reference);
      if (refIndex >= 0) {
        reference.resolved.references.splice(refIndex, 1);
      }
    }
  }
  let scope = baseScope;
  while (scope) {
    const refIndex = scope.references.indexOf(reference);
    if (refIndex >= 0) {
      scope.references.splice(refIndex, 1);
    }
    const throughIndex = scope.through.indexOf(reference);
    if (throughIndex >= 0) {
      scope.through.splice(throughIndex, 1);
    }
    scope = scope.upper;
  }
}
function removeIdentifierVariable(node, scope) {
  for (let varIndex = 0; varIndex < scope.variables.length; varIndex++) {
    const variable = scope.variables[varIndex];
    const defIndex = variable.defs.findIndex((def) => def.name === node);
    if (defIndex < 0) {
      continue;
    }
    variable.defs.splice(defIndex, 1);
    if (variable.defs.length === 0) {
      referencesToThrough(variable.references, scope);
      variable.references.forEach((r) => {
        if (r.init)
          r.init = false;
        r.resolved = null;
      });
      scope.variables.splice(varIndex, 1);
      const name2 = node.name;
      if (variable === scope.set.get(name2)) {
        scope.set.delete(name2);
      }
    } else {
      const idIndex = variable.identifiers.indexOf(node);
      if (idIndex >= 0) {
        variable.identifiers.splice(idIndex, 1);
      }
    }
    return;
  }
}
function removeIdentifierReference(node, scope) {
  const reference = scope.references.find((ref) => ref.identifier === node);
  if (reference) {
    removeReference(reference, scope);
    return true;
  }
  const location = node.range[0];
  const pendingScopes = [];
  for (const childScope of scope.childScopes) {
    const range = childScope.block.range;
    if (range[0] <= location && location < range[1]) {
      if (removeIdentifierReference(node, childScope)) {
        return true;
      }
    } else {
      pendingScopes.push(childScope);
    }
  }
  for (const childScope of pendingScopes) {
    if (removeIdentifierReference(node, childScope)) {
      return true;
    }
  }
  return false;
}
function getInnermostScopeFromNode(scopeManager, currentNode) {
  return getInnermostScope(
    getScopeFromNode(scopeManager, currentNode),
    currentNode
  );
}
function getScopeFromNode(scopeManager, currentNode) {
  let node = currentNode;
  for (; node; node = node.parent || null) {
    const scope = scopeManager.acquire(node, false);
    if (scope) {
      if (scope.type === "function-expression-name") {
        return scope.childScopes[0];
      }
      if (scope.type === "global" && node.type === "Program" && node.sourceType === "module") {
        return scope.childScopes.find((s) => s.type === "module") || scope;
      }
      return scope;
    }
  }
  const global = scopeManager.globalScope;
  return global;
}
function getInnermostScope(initialScope, node) {
  for (const childScope of initialScope.childScopes) {
    const range = childScope.block.range;
    if (range[0] <= node.range[0] && node.range[1] <= range[1]) {
      return getInnermostScope(childScope, node);
    }
  }
  return initialScope;
}
function referencesToThrough(references, baseScope) {
  let scope = baseScope;
  while (scope) {
    addAllReferences(scope.through, references);
    scope = scope.upper;
  }
}
function addAllReferences(list, elements) {
  addElementsToSortedArray(
    list,
    elements,
    (a, b) => a.identifier.range[0] - b.identifier.range[0]
  );
}
function addReference(list, reference) {
  addElementToSortedArray(
    list,
    reference,
    (a, b) => a.identifier.range[0] - b.identifier.range[0]
  );
}

// src/parser/index.ts
function parseForESLint(code, options) {
  const { result: resultTemplate, context: ctx } = parseTemplate(
    code,
    options?.filePath ?? "<input>"
  );
  const scriptContext = processTemplate(ctx, resultTemplate);
  const parserOptions = new ParserOptionsContext(options);
  if (parserOptions.isTypeScript() && /\bAstro\b/u.test(code)) {
    scriptContext.appendVirtualScript(
      `declare const Astro: Readonly<import('astro').AstroGlobal<Props>>;`
    );
    scriptContext.restoreContext.addRestoreNodeProcess(
      (_scriptNode, { result }) => {
        const declareNode = result.ast.body.pop();
        const scopeManager = result.scopeManager;
        if (scopeManager) {
          removeAllScopeAndVariableAndReference(declareNode, {
            visitorKeys: result.visitorKeys,
            scopeManager
          });
          const scope = getProgramScope(scopeManager);
          const propsVariable = scope.set.get("Props");
          if (propsVariable) {
            addVirtualReference(
              propsVariable.identifiers[0],
              propsVariable,
              scope,
              {
                read: true,
                typeRef: true,
                forceUsed: true
              }
            );
          }
          const astroGlobalReferences = scope.through.filter(
            (ref) => ref.identifier.name === "Astro" || ref.identifier.name === "Fragment"
          );
          for (const astroGlobalReference of astroGlobalReferences) {
            addGlobalVariable(astroGlobalReference, scopeManager);
            removeReferenceFromThrough(astroGlobalReference, scope);
          }
        }
        return true;
      }
    );
  }
  const resultScript = parseScript(scriptContext.script, ctx, parserOptions);
  scriptContext.restoreContext.restore(resultScript);
  sort(resultScript.ast.comments);
  sort(resultScript.ast.tokens);
  extractTokens(resultScript, ctx);
  resultScript.services = Object.assign(resultScript.services || {}, {
    isAstro: true,
    getAstroAst() {
      return resultTemplate.ast;
    },
    getAstroResult() {
      return resultTemplate;
    }
  });
  resultScript.visitorKeys = Object.assign({}, KEYS, resultScript.visitorKeys);
  return resultScript;
}
function extractTokens(ast, ctx) {
  if (!ast.ast.tokens) {
    return;
  }
  const useRanges = sort([...ast.ast.tokens, ...ast.ast.comments || []]).map(
    (t) => t.range
  );
  let range = useRanges.shift();
  for (let index = 0; index < ctx.code.length; index++) {
    while (range && range[1] <= index) {
      range = useRanges.shift();
    }
    if (range && range[0] <= index) {
      index = range[1] - 1;
      continue;
    }
    const c = ctx.code[index];
    if (!c.trim()) {
      continue;
    }
    if (isPunctuator(c)) {
      ast.ast.tokens.push(
        ctx.buildToken(import_types2.AST_TOKEN_TYPES.Punctuator, [index, index + 1])
      );
    } else {
      ast.ast.tokens.push(
        ctx.buildToken(import_types2.AST_TOKEN_TYPES.Identifier, [index, index + 1])
      );
    }
  }
  sort(ast.ast.tokens);
  function isPunctuator(c) {
    return /^[^\w$]$/iu.test(c);
  }
}

// src/astro-tools/index.ts
function parseTemplate2(code) {
  const parsed = parseTemplate(code);
  return {
    result: parsed.result,
    getEndOffset: (node) => getEndOffset(node, parsed.context),
    calcAttributeValueStartOffset: (node) => calcAttributeValueStartOffset(node, parsed.context),
    calcAttributeEndOffset: (node) => calcAttributeEndOffset(node, parsed.context),
    walk(parent, enter, leave) {
      walk(
        parent,
        code,
        enter,
        leave || (() => {
        })
      );
    },
    getLocFromIndex: (index) => parsed.context.getLocFromIndex(index),
    getIndexFromLoc: (loc) => parsed.context.locs.getIndexFromLoc(loc)
  };
}

// src/ast/index.ts
var ast_exports = {};

// src/index.ts
var name = "astro-eslint-parser";
function parseForESLint2(code, options) {
  return parseForESLint(code, options);
}
var VisitorKeys = KEYS;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AST,
  ParseError,
  VisitorKeys,
  name,
  parseForESLint,
  parseTemplate,
  traverseNodes
});
