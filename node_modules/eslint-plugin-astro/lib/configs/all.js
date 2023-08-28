"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const recommended_1 = __importDefault(require("./recommended"));
const rules_1 = require("../utils/rules");
const all = {};
for (const rule of rules_1.rules.filter((rule) => rule.meta.docs.available() && !rule.meta.deprecated)) {
    all[rule.meta.docs.ruleId] = "error";
}
module.exports = {
    extends: recommended_1.default.extends,
    rules: Object.assign(Object.assign({}, all), recommended_1.default.rules),
};
