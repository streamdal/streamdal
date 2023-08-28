"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const rules_1 = require("./utils/rules");
const processor_1 = require("./processor");
const environments_1 = require("./environments");
const base_1 = __importDefault(require("./configs/base"));
const recommended_1 = __importDefault(require("./configs/recommended"));
const all_1 = __importDefault(require("./configs/all"));
const a11y_1 = require("./a11y");
const configs = Object.assign({ base: base_1.default,
    recommended: recommended_1.default,
    all: all_1.default }, (0, a11y_1.buildA11yConfigs)());
const a11yConfigs = (0, a11y_1.buildA11yConfigs)();
for (const configName of Object.keys(a11yConfigs)) {
    Object.defineProperty(configs, configName, {
        enumerable: true,
        get() {
            return a11yConfigs[configName];
        },
    });
}
const rules = rules_1.rules.reduce((obj, r) => {
    obj[r.meta.docs.ruleName] = r;
    return obj;
}, {});
module.exports = {
    configs,
    rules,
    processors: {
        ".astro": processor_1.processor,
        astro: processor_1.processor,
    },
    environments: environments_1.environments,
};
