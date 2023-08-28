"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildA11yConfigs = exports.buildA11yRules = void 0;
const configs_1 = require("./configs");
const rules_1 = require("./rules");
function buildA11yRules() {
    return (0, rules_1.buildRules)();
}
exports.buildA11yRules = buildA11yRules;
function buildA11yConfigs() {
    return (0, configs_1.buildConfigs)();
}
exports.buildA11yConfigs = buildA11yConfigs;
