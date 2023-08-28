"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEspree = void 0;
const module_1 = require("module");
const path_1 = __importDefault(require("path"));
const require_user_1 = require("./require-user");
let espreeCache = null;
function isLinterPath(p) {
    return p.includes(`eslint${path_1.default.sep}lib${path_1.default.sep}linter${path_1.default.sep}linter.js`);
}
function getEspree() {
    if (!espreeCache) {
        const linterPath = Object.keys(require.cache || {}).find(isLinterPath);
        if (linterPath) {
            try {
                espreeCache = (0, module_1.createRequire)(linterPath)("espree");
            }
            catch (_a) {
            }
        }
    }
    if (!espreeCache) {
        espreeCache = (0, require_user_1.requireUserLocal)("espree");
    }
    if (!espreeCache) {
        espreeCache = require("espree");
    }
    return espreeCache;
}
exports.getEspree = getEspree;
