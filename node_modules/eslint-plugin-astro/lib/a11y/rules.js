"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRules = void 0;
const load_1 = require("./load");
const utils_1 = require("../utils");
const keys_1 = require("./keys");
const ast_utils_1 = require("../utils/ast-utils");
const TYPE_MAP = {
    AstroRawText: "JSXText",
    AstroTemplateLiteralAttribute: "JSXAttribute",
    AstroShorthandAttribute: "JSXAttribute",
};
const ATTRIBUTE_MAP = {
    "set:html": "dangerouslySetInnerHTML",
    "set:text": "children",
    autofocus: "autoFocus",
    for: "htmlFor",
};
function getPluginJsxA11yRule(ruleName) {
    var _a;
    const base = (0, load_1.getPluginJsxA11y)();
    return (_a = base === null || base === void 0 ? void 0 : base.rules) === null || _a === void 0 ? void 0 : _a[ruleName];
}
function buildRules() {
    const rules = [];
    for (const ruleKey of keys_1.a11yRuleKeys) {
        const jsxRuleName = `jsx-a11y/${ruleKey}`;
        const astroRuleName = `astro/${jsxRuleName}`;
        const ruleWithoutMeta = (0, utils_1.createRule)(jsxRuleName, {
            meta: {
                messages: {},
                schema: [],
                type: "problem",
                docs: {
                    description: `apply \`${jsxRuleName}\` rule to Astro components`,
                    category: "A11Y Extension Rules",
                    recommended: false,
                    available: () => Boolean((0, load_1.getPluginJsxA11y)()),
                },
            },
            create(context) {
                const baseRule = getPluginJsxA11yRule(ruleKey);
                if (!baseRule) {
                    context.report({
                        loc: { line: 0, column: 0 },
                        message: `If you want to use ${astroRuleName} rule, you need to install eslint-plugin-jsx-a11y.`,
                    });
                    return {};
                }
                return defineWrapperListener(baseRule, context);
            },
        });
        const docs = Object.assign(Object.assign({}, ruleWithoutMeta.meta.docs), { extensionRule: {
                plugin: "eslint-plugin-jsx-a11y",
                get url() {
                    var _a, _b, _c, _d;
                    return ((_d = (_c = (_b = (_a = getPluginJsxA11yRule(ruleKey)) === null || _a === void 0 ? void 0 : _a.meta) === null || _b === void 0 ? void 0 : _b.docs) === null || _c === void 0 ? void 0 : _c.url) !== null && _d !== void 0 ? _d : `https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/main/docs/rules/${ruleKey}.md`);
                },
            } });
        const newRule = {
            meta: new Proxy(ruleWithoutMeta.meta, {
                get(_t, key) {
                    var _a, _b;
                    if (key === "docs") {
                        return docs;
                    }
                    const baseRule = getPluginJsxA11yRule(ruleKey);
                    return (_b = (_a = baseRule === null || baseRule === void 0 ? void 0 : baseRule.meta) === null || _a === void 0 ? void 0 : _a[key]) !== null && _b !== void 0 ? _b : ruleWithoutMeta.meta[key];
                },
            }),
            create: ruleWithoutMeta.create,
        };
        rules.push(newRule);
    }
    return rules;
}
exports.buildRules = buildRules;
function defineWrapperListener(coreRule, context) {
    if (!context.parserServices.isAstro) {
        return {};
    }
    const listener = coreRule.create(context);
    const astroListener = {};
    for (const key of Object.keys(listener)) {
        const original = listener[key];
        if (!original) {
            continue;
        }
        const wrappedListener = function (node, ...args) {
            ;
            original.call(this, getProxyNode(node), ...args);
        };
        astroListener[key] = wrappedListener;
        const astroKey = key
            .replace(/(?:^|\b)AstroRawText(?:\b|$)/gu, "JSXText")
            .replace(/(?:^|\b)(?:AstroTemplateLiteralAttribute|AstroShorthandAttribute)(?:\b|$)/gu, "JSXAttribute");
        if (astroKey !== key) {
            astroListener[astroKey] = wrappedListener;
        }
    }
    function isNode(data) {
        return (data &&
            typeof data.type === "string" &&
            Array.isArray(data.range) &&
            data.range.length === 2 &&
            typeof data.range[0] === "number" &&
            typeof data.range[1] === "number");
    }
    function getProxyNode(node, overrides) {
        const type = TYPE_MAP[node.type] || node.type;
        const cache = Object.assign({ type }, (overrides !== null && overrides !== void 0 ? overrides : {}));
        if (node.type === "JSXAttribute") {
            const attrName = (0, ast_utils_1.getAttributeName)(node);
            const converted = attrName != null && ATTRIBUTE_MAP[attrName];
            if (converted) {
                cache.name = getProxyNode(node.name, {
                    type: "JSXIdentifier",
                    namespace: null,
                    name: converted,
                });
            }
        }
        return new Proxy(node, {
            get(_t, key) {
                if (key in cache) {
                    return cache[key];
                }
                const data = node[key];
                if (isNode(data)) {
                    return (cache[key] = getProxyNode(data));
                }
                if (Array.isArray(data)) {
                    return (cache[key] = data.map((e) => isNode(e) ? getProxyNode(e) : e));
                }
                return data;
            },
        });
    }
    return astroListener;
}
