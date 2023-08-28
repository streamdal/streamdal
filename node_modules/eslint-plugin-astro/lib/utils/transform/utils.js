"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContentRange = exports.loadModule = void 0;
const module_1 = __importDefault(require("module"));
const path_1 = __importDefault(require("path"));
const cache = new WeakMap();
function loadModule(context, name) {
    var _a, _b;
    const key = context.getSourceCode().ast;
    let modules = cache.get(key);
    if (!modules) {
        modules = {};
        cache.set(key, modules);
    }
    const mod = modules[name];
    if (mod)
        return mod;
    try {
        const cwd = (_b = (_a = context.getCwd) === null || _a === void 0 ? void 0 : _a.call(context)) !== null && _b !== void 0 ? _b : process.cwd();
        const relativeTo = path_1.default.join(cwd, "__placeholder__.js");
        return (modules[name] = module_1.default.createRequire(relativeTo)(name));
    }
    catch (_c) {
        return null;
    }
}
exports.loadModule = loadModule;
function getContentRange(node) {
    if (node.closingElement) {
        return [node.openingElement.range[1], node.closingElement.range[0]];
    }
    return [node.openingElement.range[1], node.range[1]];
}
exports.getContentRange = getContentRange;
