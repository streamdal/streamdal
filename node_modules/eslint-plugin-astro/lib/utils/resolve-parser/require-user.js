"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireUserLocal = void 0;
const module_1 = require("module");
const path_1 = __importDefault(require("path"));
function requireUserLocal(id) {
    try {
        const cwd = process.cwd();
        const relativeTo = path_1.default.join(cwd, "__placeholder__.js");
        return (0, module_1.createRequire)(relativeTo)(id);
    }
    catch (_a) {
        return null;
    }
}
exports.requireUserLocal = requireUserLocal;
