"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRule = void 0;
function createRule(ruleName, rule) {
    return {
        meta: Object.assign(Object.assign({}, rule.meta), { docs: Object.assign(Object.assign({ available: () => true }, rule.meta.docs), { url: `https://ota-meshi.github.io/eslint-plugin-astro/rules/${ruleName}/`, ruleId: `astro/${ruleName}`, ruleName }) }),
        create: rule.create,
    };
}
exports.createRule = createRule;
