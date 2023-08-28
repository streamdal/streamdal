"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const eslint_utils_1 = require("@eslint-community/eslint-utils");
const utils_1 = require("../utils");
exports.default = (0, utils_1.createRule)("no-deprecated-astro-fetchcontent", {
    meta: {
        docs: {
            description: "disallow using deprecated `Astro.fetchContent()`",
            category: "Possible Errors",
            recommended: true,
        },
        schema: [],
        messages: {
            deprecated: "'Astro.fetchContent()' is deprecated. Use 'Astro.glob()' instead.",
        },
        type: "problem",
        fixable: "code",
    },
    create(context) {
        if (!context.parserServices.isAstro) {
            return {};
        }
        return {
            "Program:exit"() {
                const tracker = new eslint_utils_1.ReferenceTracker(context.getScope());
                for (const { node, path } of tracker.iterateGlobalReferences({
                    Astro: {
                        fetchContent: { [eslint_utils_1.READ]: true },
                    },
                })) {
                    context.report({
                        node,
                        messageId: "deprecated",
                        data: { name: path.join(".") },
                        fix(fixer) {
                            if (node.type !== "MemberExpression" || node.computed) {
                                return null;
                            }
                            return fixer.replaceText(node.property, "glob");
                        },
                    });
                }
            },
        };
    },
});
