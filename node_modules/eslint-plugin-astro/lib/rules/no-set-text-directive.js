"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const ast_utils_1 = require("../utils/ast-utils");
exports.default = (0, utils_1.createRule)("no-set-text-directive", {
    meta: {
        docs: {
            description: "disallow use of `set:text`",
            category: "Best Practices",
            recommended: false,
        },
        schema: [],
        messages: {
            disallow: "Don't use `set:text`.",
        },
        type: "suggestion",
        fixable: "code",
    },
    create(context) {
        if (!context.parserServices.isAstro) {
            return {};
        }
        function verifyName(attr) {
            if ((0, ast_utils_1.getAttributeName)(attr) !== "set:text") {
                return;
            }
            context.report({
                node: attr.name,
                messageId: "disallow",
                *fix(fixer) {
                    const element = attr.parent.parent;
                    if (!attr.value || !element || element.type !== "JSXElement") {
                        return;
                    }
                    if (element.children.some((child) => child.type !== "JSXText" || child.value.trim())) {
                        return;
                    }
                    const sourceCode = context.getSourceCode();
                    const valueText = attr.type === "AstroTemplateLiteralAttribute"
                        ? `{${sourceCode.getText(attr.value)}}`
                        : sourceCode.getText(attr.value);
                    if (element.openingElement.selfClosing) {
                        if (sourceCode.text.slice(element.openingElement.range[1] - 2, element.openingElement.range[1]) !== "/>") {
                            return;
                        }
                        yield fixer.remove(attr);
                        yield fixer.removeRange([
                            element.openingElement.range[1] - 2,
                            element.openingElement.range[1] - 1,
                        ]);
                        yield fixer.insertTextAfter(element.openingElement, `${valueText}</${sourceCode.getText(element.openingElement.name)}>`);
                    }
                    else {
                        yield fixer.remove(attr);
                        yield* element.children.map((child) => fixer.remove(child));
                        yield fixer.insertTextAfter(element.openingElement, valueText);
                    }
                },
            });
        }
        return {
            JSXAttribute: verifyName,
            AstroTemplateLiteralAttribute: verifyName,
        };
    },
});
