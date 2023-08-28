"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
exports.default = (0, utils_1.createRule)("valid-compile", {
    meta: {
        docs: {
            description: "disallow warnings when compiling.",
            category: "Possible Errors",
            recommended: true,
        },
        schema: [],
        messages: {},
        type: "problem",
    },
    create(context) {
        if (!context.parserServices.getAstroResult) {
            return {};
        }
        const diagnostics = context.parserServices.getAstroResult().diagnostics;
        return {
            Program() {
                for (const { text, code, location, severity } of diagnostics) {
                    if (severity === 2) {
                        context.report({
                            loc: {
                                start: location,
                                end: location,
                            },
                            message: `${text} [${code}]`,
                        });
                    }
                }
            },
        };
    },
});
