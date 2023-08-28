"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const ast_utils_1 = require("../utils/ast-utils");
exports.default = (0, utils_1.createRule)("prefer-class-list-directive", {
    meta: {
        docs: {
            description: "require `class:list` directives instead of `class` with expressions",
            category: "Stylistic Issues",
            recommended: false,
        },
        schema: [],
        messages: {
            unexpected: "Unexpected `class` using expression. Use 'class:list' instead.",
        },
        fixable: "code",
        type: "suggestion",
    },
    create(context) {
        if (!context.parserServices.isAstro) {
            return {};
        }
        function verifyAttr(attr) {
            if ((0, ast_utils_1.getAttributeName)(attr) !== "class") {
                return;
            }
            if (!attr.value ||
                attr.value.type !== "JSXExpressionContainer" ||
                attr.value.expression.type === "JSXEmptyExpression") {
                return;
            }
            context.report({
                node: attr.name,
                messageId: "unexpected",
                fix(fixer) {
                    if (attr.type === "AstroShorthandAttribute") {
                        return fixer.insertTextBefore(attr, "class:list=");
                    }
                    return fixer.insertTextAfter(attr.name, ":list");
                },
            });
        }
        return {
            JSXAttribute: verifyAttr,
            AstroTemplateLiteralAttribute: verifyAttr,
        };
    },
});
