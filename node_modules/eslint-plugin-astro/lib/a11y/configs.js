"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildConfigs = void 0;
const load_1 = require("./load");
const path_1 = __importDefault(require("path"));
const keys_1 = require("./keys");
function buildConfigs() {
    const basePath = require.resolve("../configs/base");
    const baseExtend = path_1.default.extname(`${basePath}`) === ".ts" ? "plugin:astro/base" : basePath;
    const configs = {};
    for (const configName of keys_1.a11yConfigKeys) {
        Object.defineProperty(configs, `jsx-a11y-${configName}`, {
            enumerable: true,
            get() {
                var _a, _b, _c;
                const base = (0, load_1.getPluginJsxA11y)();
                const baseConfig = (_b = (_a = base === null || base === void 0 ? void 0 : base.configs) === null || _a === void 0 ? void 0 : _a[configName]) !== null && _b !== void 0 ? _b : {};
                const baseRules = (_c = baseConfig.rules) !== null && _c !== void 0 ? _c : {};
                const newRules = {};
                for (const ruleName of Object.keys(baseRules)) {
                    newRules[`astro/${ruleName}`] = baseRules[ruleName];
                }
                return Object.assign(Object.assign({}, baseConfig), { plugins: ["jsx-a11y"], extends: [baseExtend], rules: newRules });
            },
        });
    }
    return configs;
}
exports.buildConfigs = buildConfigs;
