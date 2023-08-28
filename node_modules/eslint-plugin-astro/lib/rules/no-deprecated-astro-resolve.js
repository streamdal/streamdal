"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const eslint_utils_1 = require("@eslint-community/eslint-utils");
const utils_1 = require("../utils");
exports.default = (0, utils_1.createRule)("no-deprecated-astro-resolve", {
    meta: {
        docs: {
            description: "disallow using deprecated `Astro.resolve()`",
            category: "Possible Errors",
            recommended: true,
        },
        schema: [],
        messages: {
            deprecated: "'Astro.resolve()' is deprecated.",
        },
        type: "problem",
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
                        resolve: { [eslint_utils_1.READ]: true },
                    },
                })) {
                    context.report({
                        node,
                        messageId: "deprecated",
                        data: { name: path.join(".") },
                    });
                }
            },
        };
    },
});
