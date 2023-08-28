"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasTypescriptEslintParser = void 0;
const module_1 = require("module");
const path_1 = __importDefault(require("path"));
exports.hasTypescriptEslintParser = false;
try {
    const cwd = process.cwd();
    const relativeTo = path_1.default.join(cwd, "__placeholder__.js");
    (0, module_1.createRequire)(relativeTo)("@typescript-eslint/parser");
    exports.hasTypescriptEslintParser = true;
}
catch (_a) {
}
