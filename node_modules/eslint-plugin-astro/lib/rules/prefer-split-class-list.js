"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("@typescript-eslint/types");
const utils_1 = require("../utils");
const eslint_utils_1 = require("@eslint-community/eslint-utils");
const ast_utils_1 = require("../utils/ast-utils");
const string_literal_parser_1 = require("../utils/string-literal-parser");
const eslint_utils_2 = require("@eslint-community/eslint-utils");
exports.default = (0, utils_1.createRule)("prefer-split-class-list", {
    meta: {
        docs: {
            description: "require use split array elements in `class:list`",
            category: "Stylistic Issues",
            recommended: false,
        },
        schema: [
            {
                type: "object",
                properties: {
                    splitLiteral: { type: "boolean" },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            uselessClsx: "Using `clsx()` for the `class:list` has no effect.",
            split: "Can split elements with spaces.",
        },
        fixable: "code",
        type: "suggestion",
    },
    create(context) {
        var _a;
        if (!context.parserServices.isAstro) {
            return {};
        }
        const splitLiteral = Boolean((_a = context.options[0]) === null || _a === void 0 ? void 0 : _a.splitLiteral);
        const sourceCode = context.getSourceCode();
        function shouldReport(state) {
            if (state.isFirstElement) {
                if (state.isLeading) {
                    return false;
                }
            }
            if (state.isLastElement) {
                if (state.isTrailing) {
                    return false;
                }
            }
            if (splitLiteral) {
                return true;
            }
            return state.isLeading || state.isTrailing;
        }
        function verifyAttr(attr) {
            if ((0, ast_utils_1.getAttributeName)(attr) !== "class:list") {
                return;
            }
            if (!attr.value ||
                attr.value.type !== types_1.AST_NODE_TYPES.JSXExpressionContainer ||
                attr.value.expression.type === types_1.AST_NODE_TYPES.JSXEmptyExpression) {
                return;
            }
            const expression = attr.value.expression;
            verifyExpression(expression, function* (fixer) {
                if (expression.type === types_1.AST_NODE_TYPES.ArrayExpression) {
                    return;
                }
                yield fixer.insertTextBeforeRange(expression.range, "[");
                yield fixer.insertTextAfterRange(expression.range, "]");
            });
        }
        function verifyExpression(node, transformArray, call) {
            if (node.type === types_1.AST_NODE_TYPES.TemplateLiteral) {
                const first = node.quasis[0];
                const last = node.quasis[node.quasis.length - 1];
                for (const quasi of node.quasis) {
                    verifyTemplateElement(quasi, {
                        isFirstElement: first === quasi,
                        isLastElement: last === quasi,
                        transformArray,
                        call,
                    });
                }
            }
            else if (node.type === types_1.AST_NODE_TYPES.BinaryExpression) {
                verifyBinaryExpression(node, transformArray);
            }
            else if (node.type === types_1.AST_NODE_TYPES.ArrayExpression) {
                for (const element of node.elements) {
                    if (element) {
                        verifyExpression(element, transformArray);
                    }
                }
            }
            else if (node.type === types_1.AST_NODE_TYPES.Literal) {
                if (splitLiteral && (0, ast_utils_1.isStringLiteral)(node)) {
                    verifyStringLiteral(node, {
                        isFirstElement: true,
                        isLastElement: true,
                        transformArray,
                        call,
                    });
                }
            }
            else if (node.type === types_1.AST_NODE_TYPES.CallExpression) {
                if (node.callee.type === types_1.AST_NODE_TYPES.MemberExpression &&
                    (0, eslint_utils_2.getPropertyName)(node.callee) === "trim") {
                    verifyExpression(node.callee.object, transformArray, ".trim()");
                }
            }
        }
        function verifyTemplateElement(node, state) {
            const stringEndOffset = node.tail ? node.range[1] - 1 : node.range[1] - 2;
            let isLeading = true;
            const spaces = [];
            for (const ch of (0, string_literal_parser_1.parseStringTokens)(sourceCode.text, {
                start: node.range[0] + 1,
                end: stringEndOffset,
            })) {
                if (ch.value.trim()) {
                    if (spaces.length) {
                        if (shouldReport(Object.assign(Object.assign({}, state), { isLeading, isTrailing: false }))) {
                            reportRange([
                                spaces[0].range[0],
                                spaces[spaces.length - 1].range[1],
                            ]);
                        }
                        spaces.length = 0;
                    }
                    isLeading = false;
                }
                else {
                    spaces.push(ch);
                }
            }
            if (spaces.length) {
                if (shouldReport(Object.assign(Object.assign({}, state), { isLeading, isTrailing: true }))) {
                    reportRange([spaces[0].range[0], spaces[spaces.length - 1].range[1]]);
                }
                spaces.length = 0;
            }
            function reportRange(range) {
                context.report({
                    loc: {
                        start: sourceCode.getLocFromIndex(range[0]),
                        end: sourceCode.getLocFromIndex(range[1]),
                    },
                    messageId: "split",
                    *fix(fixer) {
                        yield* state.transformArray(fixer);
                        yield fixer.replaceTextRange(range, `\`${state.call || ""},\``);
                    },
                });
            }
        }
        function verifyBinaryExpression(node, transformArray) {
            const elements = (0, ast_utils_1.extractConcatExpressions)(node, sourceCode);
            if (elements == null) {
                return;
            }
            const first = elements[0];
            const last = elements[elements.length - 1];
            for (const element of elements) {
                if ((0, ast_utils_1.isStringLiteral)(element)) {
                    verifyStringLiteral(element, {
                        isFirstElement: first === element,
                        isLastElement: last === element,
                        transformArray,
                    });
                }
            }
        }
        function verifyStringLiteral(node, state) {
            const quote = sourceCode.text[node.range[0]];
            let isLeading = true;
            const spaces = [];
            for (const ch of (0, string_literal_parser_1.parseStringTokens)(sourceCode.text, {
                start: node.range[0] + 1,
                end: node.range[1] - 1,
            })) {
                if (ch.value.trim()) {
                    if (spaces.length) {
                        if (shouldReport(Object.assign(Object.assign({}, state), { isLeading, isTrailing: false }))) {
                            reportRange([spaces[0].range[0], spaces[spaces.length - 1].range[1]], { isLeading, isTrailing: false });
                        }
                        spaces.length = 0;
                    }
                    isLeading = false;
                }
                else {
                    spaces.push(ch);
                }
            }
            if (spaces.length) {
                if (shouldReport(Object.assign(Object.assign({}, state), { isLeading, isTrailing: true }))) {
                    reportRange([spaces[0].range[0], spaces[spaces.length - 1].range[1]], { isLeading, isTrailing: true });
                }
                spaces.length = 0;
            }
            function reportRange(range, spaceState) {
                context.report({
                    loc: {
                        start: sourceCode.getLocFromIndex(range[0]),
                        end: sourceCode.getLocFromIndex(range[1]),
                    },
                    messageId: "split",
                    *fix(fixer) {
                        yield* state.transformArray(fixer);
                        let leftQuote = quote;
                        let rightQuote = quote;
                        const bin = node.parent;
                        if (spaceState.isLeading &&
                            bin.right === node &&
                            isStringType(bin.left)) {
                            leftQuote = "";
                        }
                        if (spaceState.isTrailing &&
                            bin.left === node &&
                            isStringType(bin.right)) {
                            rightQuote = "";
                        }
                        const replaceRange = [...range];
                        if (!leftQuote || !rightQuote) {
                            if (!leftQuote) {
                                replaceRange[0]--;
                            }
                            if (!rightQuote) {
                                replaceRange[1]++;
                            }
                            yield fixer.remove(sourceCode.getTokensBetween(bin.left, bin.right, {
                                includeComments: false,
                                filter: (t) => t.value === bin.operator,
                            })[0]);
                        }
                        yield fixer.replaceTextRange(replaceRange, `${leftQuote}${state.call || ""},${rightQuote}`);
                    },
                });
            }
        }
        function verifyClsx(clsxCall) {
            if (clsxCall.node.type !== types_1.AST_NODE_TYPES.CallExpression) {
                return;
            }
            const callNode = clsxCall.node;
            const parent = callNode.parent;
            if (!parent ||
                parent.type !== types_1.AST_NODE_TYPES.JSXExpressionContainer ||
                parent.expression !== callNode) {
                return;
            }
            const parentParent = parent.parent;
            if (!parentParent ||
                parentParent.type !== types_1.AST_NODE_TYPES.JSXAttribute ||
                parentParent.value !== parent ||
                (0, ast_utils_1.getAttributeName)(parentParent) !== "class:list") {
                return;
            }
            context.report({
                node: clsxCall.node.callee,
                messageId: "uselessClsx",
                *fix(fixer) {
                    const openToken = sourceCode.getTokenAfter(callNode.callee, {
                        includeComments: false,
                        filter: eslint_utils_1.isOpeningParenToken,
                    });
                    const closeToken = sourceCode.getLastToken(callNode);
                    yield fixer.removeRange([callNode.range[0], openToken.range[1]]);
                    yield fixer.remove(closeToken);
                },
            });
        }
        return {
            Program() {
                const referenceTracker = new eslint_utils_1.ReferenceTracker(context.getScope());
                for (const call of referenceTracker.iterateEsmReferences({
                    clsx: {
                        [eslint_utils_1.ReferenceTracker.CALL]: true,
                    },
                })) {
                    verifyClsx(call);
                }
            },
            JSXAttribute: verifyAttr,
            AstroTemplateLiteralAttribute: verifyAttr,
        };
    },
});
function isStringType(node) {
    if (node.type === types_1.AST_NODE_TYPES.Literal) {
        return typeof node.value === "string";
    }
    else if (node.type === types_1.AST_NODE_TYPES.TemplateLiteral) {
        return true;
    }
    else if (node.type === types_1.AST_NODE_TYPES.BinaryExpression) {
        return isStringType(node.left) || isStringType(node.right);
    }
    return (0, ast_utils_1.isStringCallExpression)(node);
}
