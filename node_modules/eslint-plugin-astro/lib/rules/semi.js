"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const eslint_core_1 = require("../utils/eslint-core");
const coreRule = (0, eslint_core_1.getCoreRule)("semi");
exports.default = (0, utils_1.createRule)("semi", {
    meta: {
        docs: {
            description: coreRule.meta.docs.description,
            category: "Extension Rules",
            recommended: false,
            extensionRule: "semi",
        },
        schema: coreRule.meta.schema,
        messages: coreRule.meta.messages,
        type: coreRule.meta.type,
        fixable: coreRule.meta.fixable,
        hasSuggestions: coreRule.meta.hasSuggestions,
    },
    create(context) {
        if (!context.parserServices.isAstro) {
            return coreRule.create(context);
        }
        let sourceCodeWrapper;
        return coreRule.create((0, eslint_core_1.newProxy)(context, {
            getSourceCode() {
                if (sourceCodeWrapper) {
                    return sourceCodeWrapper;
                }
                const sourceCode = context.getSourceCode();
                function transformToken(token) {
                    return token.value === "---"
                        ? (0, eslint_core_1.newProxy)(token, { value: "___" })
                        : token;
                }
                return (sourceCodeWrapper = (0, eslint_core_1.newProxy)(sourceCode, {
                    getFirstToken: wrapGetTokenFunction(sourceCode.getFirstToken),
                    getFirstTokens: wrapGetTokensFunction(sourceCode.getFirstTokens),
                    getFirstTokenBetween: wrapGetTokenFunction(sourceCode.getFirstTokenBetween),
                    getFirstTokensBetween: wrapGetTokensFunction(sourceCode.getFirstTokensBetween),
                    getLastToken: wrapGetTokenFunction(sourceCode.getLastToken),
                    getLastTokens: wrapGetTokensFunction(sourceCode.getLastTokens),
                    getLastTokenBetween: wrapGetTokenFunction(sourceCode.getLastTokenBetween),
                    getLastTokensBetween: wrapGetTokensFunction(sourceCode.getLastTokensBetween),
                    getTokenBefore: wrapGetTokenFunction(sourceCode.getTokenBefore),
                    getTokensBefore: wrapGetTokensFunction(sourceCode.getTokensBefore),
                    getTokenAfter: wrapGetTokenFunction(sourceCode.getTokenAfter),
                    getTokensAfter: wrapGetTokensFunction(sourceCode.getTokensAfter),
                    getTokenByRangeStart: wrapGetTokenFunction(sourceCode.getTokenByRangeStart),
                    getTokens: wrapGetTokensFunction(sourceCode.getTokens),
                    getTokensBetween: wrapGetTokensFunction(sourceCode.getTokensBetween),
                }));
                function wrapGetTokenFunction(base) {
                    return function (...args) {
                        const token = base.apply(this, args);
                        if (!token) {
                            return token;
                        }
                        return transformToken(token);
                    };
                }
                function wrapGetTokensFunction(base) {
                    return function (...args) {
                        const tokens = base.apply(this, args);
                        return tokens.map(transformToken);
                    };
                }
            },
        }));
    },
});
