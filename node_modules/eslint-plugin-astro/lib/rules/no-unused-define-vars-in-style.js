"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("@typescript-eslint/types");
const eslint_utils_1 = require("@eslint-community/eslint-utils");
const utils_1 = require("../utils");
const ast_utils_1 = require("../utils/ast-utils");
const style_1 = require("../utils/style");
exports.default = (0, utils_1.createRule)("no-unused-define-vars-in-style", {
    meta: {
        docs: {
            description: "disallow unused `define:vars={...}` in `style` tag",
            category: "Possible Errors",
            recommended: true,
        },
        schema: [],
        messages: {
            unused: "'{{varName}}' is defined but never used.",
        },
        type: "problem",
    },
    create(context) {
        if (!context.parserServices.isAstro) {
            return {};
        }
        return {
            "JSXElement > JSXOpeningElement[name.type='JSXIdentifier'][name.name='style']"(node) {
                const defineVars = node.attributes.find((attr) => (0, ast_utils_1.getAttributeName)(attr) === "define:vars");
                if (!defineVars) {
                    return;
                }
                if (!defineVars.value ||
                    defineVars.value.type !== types_1.AST_NODE_TYPES.JSXExpressionContainer ||
                    defineVars.value.expression.type !== types_1.AST_NODE_TYPES.ObjectExpression) {
                    return;
                }
                if (node.parent.children.length !== 1) {
                    return;
                }
                const textNode = node.parent.children[0];
                if (!textNode || textNode.type !== "AstroRawText") {
                    return;
                }
                const definedVars = defineVars.value.expression.properties
                    .filter((prop) => prop.type === types_1.AST_NODE_TYPES.Property)
                    .map((prop) => ({
                    prop,
                    name: (0, eslint_utils_1.getPropertyName)(prop, context.getScope()),
                }))
                    .filter((data) => Boolean(data.name));
                if (!definedVars.length) {
                    return;
                }
                const lang = node.attributes.find((attr) => (0, ast_utils_1.getAttributeName)(attr) === "lang");
                const langValue = lang &&
                    lang.value &&
                    lang.value.type === types_1.AST_NODE_TYPES.Literal &&
                    lang.value.value;
                let unusedDefinedVars = [...definedVars];
                for (const cssVar of (0, style_1.iterateCSSVars)(textNode.value, {
                    inlineComment: Boolean(langValue) && langValue !== "css",
                })) {
                    const variable = cssVar.slice(2);
                    unusedDefinedVars = unusedDefinedVars.filter((v) => v.name !== variable);
                }
                for (const unused of unusedDefinedVars) {
                    context.report({
                        node: unused.prop.key,
                        messageId: "unused",
                        data: {
                            varName: unused.name,
                        },
                    });
                }
            },
        };
    },
});
