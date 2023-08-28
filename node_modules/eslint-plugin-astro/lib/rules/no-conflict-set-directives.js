"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const ast_utils_1 = require("../utils/ast-utils");
exports.default = (0, utils_1.createRule)("no-conflict-set-directives", {
    meta: {
        docs: {
            description: "disallow conflicting set directives and child contents",
            category: "Possible Errors",
            recommended: true,
        },
        schema: [],
        messages: {
            conflict: "{{name}} conflicts with {{conflictTargets}}.",
        },
        type: "problem",
    },
    create(context) {
        if (!context.parserServices.isAstro) {
            return {};
        }
        const sourceCode = context.getSourceCode();
        return {
            JSXElement(node) {
                const reportData = [];
                for (const attr of node.openingElement.attributes) {
                    const directiveName = (0, ast_utils_1.getAttributeName)(attr);
                    if (directiveName === "set:text" || directiveName === "set:html") {
                        reportData.push({
                            loc: attr.loc,
                            name: `'${directiveName}'`,
                        });
                    }
                }
                if (reportData.length) {
                    const targetChildren = node.children
                        .filter((child) => {
                        if (child.type === "AstroHTMLComment") {
                            return false;
                        }
                        if (child.type === "JSXText" || child.type === "AstroRawText") {
                            return Boolean(child.value.trim());
                        }
                        return true;
                    })
                        .map((child) => {
                        if (child.type === "JSXText" || child.type === "AstroRawText") {
                            const leadingSpaces = /^\s*/.exec(child.value)[0];
                            const trailingSpaces = /\s*$/.exec(child.value)[0];
                            return {
                                loc: {
                                    start: sourceCode.getLocFromIndex(child.range[0] + leadingSpaces.length),
                                    end: sourceCode.getLocFromIndex(child.range[1] - trailingSpaces.length),
                                },
                            };
                        }
                        return child;
                    });
                    if (targetChildren.length) {
                        reportData.push({
                            loc: {
                                start: targetChildren[0].loc.start,
                                end: targetChildren[targetChildren.length - 1].loc.end,
                            },
                            name: "child contents",
                        });
                    }
                }
                if (reportData.length >= 2) {
                    for (const data of reportData) {
                        const conflictTargets = reportData
                            .filter((d) => d !== data)
                            .map((d) => d.name);
                        context.report({
                            loc: data.loc,
                            messageId: "conflict",
                            data: {
                                name: data.name,
                                conflictTargets: [
                                    conflictTargets.slice(0, -1).join(", "),
                                    conflictTargets.slice(-1)[0],
                                ]
                                    .filter(Boolean)
                                    .join(", and "),
                            },
                        });
                    }
                }
            },
        };
    },
});
