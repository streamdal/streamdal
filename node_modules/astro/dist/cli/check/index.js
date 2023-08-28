import {
  AstroCheck,
  DiagnosticSeverity
} from "@astrojs/language-server";
import glob from "fast-glob";
import fs from "fs";
import { bold, dim, red, yellow } from "kleur/colors";
import { createRequire } from "module";
import { join } from "node:path";
import ora from "ora";
import { fileURLToPath, pathToFileURL } from "url";
import { debug, info } from "../../core/logger/core.js";
import { printHelp } from "../../core/messages.js";
import { printDiagnostic } from "./print.js";
var CheckResult = /* @__PURE__ */ ((CheckResult2) => {
  CheckResult2[CheckResult2["ExitWithSuccess"] = 0] = "ExitWithSuccess";
  CheckResult2[CheckResult2["ExitWithError"] = 1] = "ExitWithError";
  CheckResult2[CheckResult2["Listen"] = 2] = "Listen";
  return CheckResult2;
})(CheckResult || {});
const ASTRO_GLOB_PATTERN = "**/*.astro";
async function check(settings, { logging, flags }) {
  if (flags.help || flags.h) {
    printHelp({
      commandName: "astro check",
      usage: "[...flags]",
      tables: {
        Flags: [
          ["--watch", "Watch Astro files for changes and re-run checks."],
          ["--help (-h)", "See all available flags."]
        ]
      },
      description: `Runs diagnostics against your project and reports errors to the console.`
    });
    return;
  }
  const checkFlags = parseFlags(flags);
  if (checkFlags.watch) {
    info(logging, "check", "Checking files in watch mode");
  } else {
    info(logging, "check", "Checking files");
  }
  const { syncCli } = await import("../../core/sync/index.js");
  const root = settings.config.root;
  const require2 = createRequire(import.meta.url);
  const diagnosticChecker = new AstroCheck(
    root.toString(),
    require2.resolve("typescript/lib/tsserverlibrary.js", {
      paths: [root.toString()]
    })
  );
  return new AstroChecker({
    syncCli,
    settings,
    fileSystem: fs,
    logging,
    diagnosticChecker,
    isWatchMode: checkFlags.watch
  });
}
class AstroChecker {
  #diagnosticsChecker;
  #shouldWatch;
  #syncCli;
  #settings;
  #logging;
  #fs;
  #watcher;
  #filesCount;
  #updateDiagnostics;
  constructor({
    diagnosticChecker,
    isWatchMode,
    syncCli,
    settings,
    fileSystem,
    logging
  }) {
    this.#diagnosticsChecker = diagnosticChecker;
    this.#shouldWatch = isWatchMode;
    this.#syncCli = syncCli;
    this.#logging = logging;
    this.#settings = settings;
    this.#fs = fileSystem;
    this.#filesCount = 0;
  }
  /**
   * Check all `.astro` files once and then finishes the operation.
   */
  async check() {
    return await this.#checkAllFiles(true);
  }
  /**
   * Check all `.astro` files and then start watching for changes.
   */
  async watch() {
    await this.#checkAllFiles(true);
    await this.#watch();
    return 2 /* Listen */;
  }
  /**
   * Stops the watch. It terminates the inner server.
   */
  async stop() {
    var _a;
    await ((_a = this.#watcher) == null ? void 0 : _a.close());
  }
  /**
   * Whether the checker should run in watch mode
   */
  get isWatchMode() {
    return this.#shouldWatch;
  }
  async #openDocuments() {
    this.#filesCount = await openAllDocuments(
      this.#settings.config.root,
      [],
      this.#diagnosticsChecker
    );
  }
  /**
   * Lint all `.astro` files, and report the result in console. Operations executed, in order:
   * 1. Compile content collections.
   * 2. Optionally, traverse the file system for `.astro` files and saves their paths.
   * 3. Get diagnostics for said files and print the result in console.
   *
   * @param openDocuments Whether the operation should open all `.astro` files
   */
  async #checkAllFiles(openDocuments) {
    const processExit = await this.#syncCli(this.#settings, {
      logging: this.#logging,
      fs: this.#fs
    });
    if (processExit === 1)
      return processExit;
    let spinner = ora(
      ` Getting diagnostics for Astro files in ${fileURLToPath(this.#settings.config.root)}\u2026`
    ).start();
    if (openDocuments) {
      await this.#openDocuments();
    }
    let diagnostics = await this.#diagnosticsChecker.getDiagnostics();
    spinner.succeed();
    let brokenDownDiagnostics = this.#breakDownDiagnostics(diagnostics);
    this.#logDiagnosticsSeverity(brokenDownDiagnostics);
    return brokenDownDiagnostics.errors > 0 ? 1 /* ExitWithError */ : 0 /* ExitWithSuccess */;
  }
  #checkForDiagnostics() {
    clearTimeout(this.#updateDiagnostics);
    this.#updateDiagnostics = setTimeout(async () => await this.#checkAllFiles(false), 500);
  }
  /**
   * This function is responsible to attach events to the server watcher
   */
  async #watch() {
    const { default: chokidar } = await import("chokidar");
    this.#watcher = chokidar.watch(
      join(fileURLToPath(this.#settings.config.root), ASTRO_GLOB_PATTERN),
      {
        ignored: ["**/node_modules/**"],
        ignoreInitial: true
      }
    );
    this.#watcher.on("add", (file) => {
      this.#addDocument(file);
      this.#filesCount += 1;
      this.#checkForDiagnostics();
    });
    this.#watcher.on("change", (file) => {
      this.#addDocument(file);
      this.#checkForDiagnostics();
    });
    this.#watcher.on("unlink", (file) => {
      this.#diagnosticsChecker.removeDocument(file);
      this.#filesCount -= 1;
      this.#checkForDiagnostics();
    });
  }
  /**
   * Add a document to the diagnostics checker
   * @param filePath Path to the file
   */
  #addDocument(filePath) {
    const text = fs.readFileSync(filePath, "utf-8");
    this.#diagnosticsChecker.upsertDocument({
      uri: pathToFileURL(filePath).toString(),
      text
    });
  }
  /**
   * Logs the result of the various diagnostics
   *
   * @param result Result emitted by AstroChecker.#breakDownDiagnostics
   */
  #logDiagnosticsSeverity(result) {
    info(
      this.#logging,
      "diagnostics",
      [
        bold(`Result (${this.#filesCount} file${this.#filesCount === 1 ? "" : "s"}): `),
        bold(red(`${result.errors} ${result.errors === 1 ? "error" : "errors"}`)),
        bold(yellow(`${result.warnings} ${result.warnings === 1 ? "warning" : "warnings"}`)),
        dim(`${result.hints} ${result.hints === 1 ? "hint" : "hints"}
`)
      ].join(`
${dim("-")} `)
    );
  }
  /**
   * It loops through all diagnostics and break down diagnostics that are errors, warnings or hints.
   */
  #breakDownDiagnostics(diagnostics) {
    let result = {
      errors: 0,
      warnings: 0,
      hints: 0
    };
    diagnostics.forEach((diag) => {
      diag.diagnostics.forEach((d) => {
        info(this.#logging, "diagnostics", `
 ${printDiagnostic(diag.fileUri, diag.text, d)}`);
        switch (d.severity) {
          case DiagnosticSeverity.Error: {
            result.errors++;
            break;
          }
          case DiagnosticSeverity.Warning: {
            result.warnings++;
            break;
          }
          case DiagnosticSeverity.Hint: {
            result.hints++;
            break;
          }
        }
      });
    });
    return result;
  }
}
async function openAllDocuments(workspaceUri, filePathsToIgnore, checker) {
  const files = await glob(ASTRO_GLOB_PATTERN, {
    cwd: fileURLToPath(workspaceUri),
    ignore: ["node_modules/**"].concat(filePathsToIgnore.map((ignore) => `${ignore}/**`)),
    absolute: true
  });
  for (const file of files) {
    debug("check", `Adding file ${file} to the list of files to check.`);
    const text = fs.readFileSync(file, "utf-8");
    checker.upsertDocument({
      uri: pathToFileURL(file).toString(),
      text
    });
  }
  return files.length;
}
function parseFlags(flags) {
  return {
    watch: flags.watch ?? false
  };
}
export {
  AstroChecker,
  CheckResult,
  check
};
