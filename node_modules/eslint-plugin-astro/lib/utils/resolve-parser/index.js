"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInstalledParserId = exports.resolveParser = void 0;
const espree_1 = require("./espree");
const require_user_1 = require("./require-user");
function resolveParser() {
    const modules = [
        "@typescript-eslint/parser",
        "@babel/eslint-parser",
        "espree",
    ];
    for (const id of modules) {
        const parser = toParserForESLint((0, require_user_1.requireUserLocal)(id));
        if (!parser) {
            continue;
        }
        return parser;
    }
    try {
        return toParserForESLint(require("@typescript-eslint/parser"));
    }
    catch (_a) {
    }
    return toParserForESLint((0, espree_1.getEspree)());
}
exports.resolveParser = resolveParser;
function getInstalledParserId() {
    const modules = ["@typescript-eslint/parser", "@babel/eslint-parser"];
    return modules.find(require_user_1.requireUserLocal);
}
exports.getInstalledParserId = getInstalledParserId;
function toParserForESLint(mod) {
    for (const m of [mod, mod && mod.default]) {
        if (!m) {
            continue;
        }
        if (typeof m.parseForESLint === "function") {
            return m;
        }
        if (typeof m.parse === "function") {
            return {
                parseForESLint(...args) {
                    return {
                        ast: m.parse(...args),
                    };
                },
            };
        }
    }
    return null;
}
