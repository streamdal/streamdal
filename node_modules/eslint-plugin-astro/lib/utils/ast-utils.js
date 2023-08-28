"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParenthesizedRange = exports.getParenthesizedTokens = exports.needParentheses = exports.getStringIfConstant = exports.extractConcatExpressions = exports.isStringLiteral = exports.isStringCallExpression = exports.getStaticAttributeValue = exports.getStaticAttributeStringValue = exports.getSpreadAttributes = exports.findAttribute = exports.getElementName = exports.getAttributeName = void 0;
const types_1 = require("@typescript-eslint/types");
const eslint_utils_1 = require("@eslint-community/eslint-utils");
function getAttributeName(node) {
    if (node.type === "JSXSpreadAttribute") {
        return null;
    }
    const { name } = node;
    return getName(name);
}
exports.getAttributeName = getAttributeName;
function getElementName(node) {
    const nameNode = node.openingElement.name;
    return getName(nameNode);
}
exports.getElementName = getElementName;
function findAttribute(node, name) {
    const openingElement = node.openingElement;
    for (const attr of openingElement.attributes) {
        if (attr.type === "JSXSpreadAttribute") {
            continue;
        }
        if (getAttributeName(attr) === name) {
            return attr;
        }
    }
    return null;
}
exports.findAttribute = findAttribute;
function getSpreadAttributes(node) {
    const openingElement = node.openingElement;
    return openingElement.attributes.filter((attr) => attr.type === "JSXSpreadAttribute");
}
exports.getSpreadAttributes = getSpreadAttributes;
function getStaticAttributeStringValue(node, context) {
    const value = getStaticAttributeValue(node, context);
    if (!value) {
        return null;
    }
    return value.value != null ? String(value.value) : value.value;
}
exports.getStaticAttributeStringValue = getStaticAttributeStringValue;
function getStaticAttributeValue(node, context) {
    var _a, _b;
    if (((_a = node.value) === null || _a === void 0 ? void 0 : _a.type) === types_1.AST_NODE_TYPES.Literal) {
        return { value: node.value.value };
    }
    if (context &&
        ((_b = node.value) === null || _b === void 0 ? void 0 : _b.type) === "JSXExpressionContainer" &&
        node.value.expression.type !== "JSXEmptyExpression") {
        const staticValue = (0, eslint_utils_1.getStaticValue)(node.value.expression, context.getSourceCode().scopeManager.globalScope);
        if (staticValue != null) {
            return staticValue;
        }
    }
    return null;
}
exports.getStaticAttributeValue = getStaticAttributeValue;
function isStringCallExpression(node) {
    if (node.type === types_1.AST_NODE_TYPES.CallExpression) {
        return (node.callee.type === types_1.AST_NODE_TYPES.Identifier &&
            node.callee.name === "String");
    }
    return false;
}
exports.isStringCallExpression = isStringCallExpression;
function isStringLiteral(node) {
    return node.type === types_1.AST_NODE_TYPES.Literal && typeof node.value === "string";
}
exports.isStringLiteral = isStringLiteral;
function extractConcatExpressions(node, sourceCode) {
    if (node.operator !== "+") {
        return null;
    }
    const leftResult = processLeft(node.left);
    if (leftResult == null) {
        return null;
    }
    return [...leftResult, node.right];
    function processLeft(expr) {
        if (expr.type === types_1.AST_NODE_TYPES.BinaryExpression) {
            if (!(0, eslint_utils_1.isParenthesized)(expr, sourceCode) &&
                expr.operator !== "*" &&
                expr.operator !== "/") {
                return extractConcatExpressions(expr, sourceCode);
            }
        }
        return [expr];
    }
}
exports.extractConcatExpressions = extractConcatExpressions;
function getStringIfConstant(node) {
    if (node.type === "Literal") {
        if (typeof node.value === "string")
            return node.value;
    }
    else if (node.type === "TemplateLiteral") {
        let str = "";
        const quasis = [...node.quasis];
        const expressions = [...node.expressions];
        let quasi, expr;
        while ((quasi = quasis.shift())) {
            str += quasi.value.cooked;
            expr = expressions.shift();
            if (expr) {
                const exprStr = getStringIfConstant(expr);
                if (exprStr == null) {
                    return null;
                }
                str += exprStr;
            }
        }
        return str;
    }
    else if (node.type === "BinaryExpression") {
        if (node.operator === "+") {
            const left = getStringIfConstant(node.left);
            if (left == null) {
                return null;
            }
            const right = getStringIfConstant(node.right);
            if (right == null) {
                return null;
            }
            return left + right;
        }
    }
    return null;
}
exports.getStringIfConstant = getStringIfConstant;
function needParentheses(node, kind) {
    if (node.type === "ArrowFunctionExpression" ||
        node.type === "AssignmentExpression" ||
        node.type === "BinaryExpression" ||
        node.type === "ConditionalExpression" ||
        node.type === "LogicalExpression" ||
        node.type === "SequenceExpression" ||
        node.type === "UnaryExpression" ||
        node.type === "UpdateExpression")
        return true;
    if (kind === "logical") {
        return node.type === "FunctionExpression";
    }
    return false;
}
exports.needParentheses = needParentheses;
function getParenthesizedTokens(node, sourceCode) {
    let lastLeft = sourceCode.getFirstToken(node);
    let lastRight = sourceCode.getLastToken(node);
    let maybeLeftParen, maybeRightParen;
    while ((maybeLeftParen = sourceCode.getTokenBefore(lastLeft)) &&
        (maybeRightParen = sourceCode.getTokenAfter(lastRight)) &&
        (0, eslint_utils_1.isOpeningParenToken)(maybeLeftParen) &&
        (0, eslint_utils_1.isClosingParenToken)(maybeRightParen) &&
        maybeLeftParen !== getParentSyntaxParen(node, sourceCode)) {
        lastLeft = maybeLeftParen;
        lastRight = maybeRightParen;
        maybeLeftParen = sourceCode.getTokenBefore(lastLeft);
        maybeRightParen = sourceCode.getTokenAfter(lastRight);
    }
    return { left: lastLeft, right: lastRight };
}
exports.getParenthesizedTokens = getParenthesizedTokens;
function getParenthesizedRange(node, sourceCode) {
    const { left, right } = getParenthesizedTokens(node, sourceCode);
    return [left.range[0], right.range[1]];
}
exports.getParenthesizedRange = getParenthesizedRange;
function getParentSyntaxParen(node, sourceCode) {
    const parent = node.parent;
    switch (parent.type) {
        case "CallExpression":
        case "NewExpression":
            if (parent.arguments.length === 1 && parent.arguments[0] === node) {
                return sourceCode.getTokenAfter(parent.callee, {
                    includeComments: false,
                    filter: eslint_utils_1.isOpeningParenToken,
                });
            }
            return null;
        case "DoWhileStatement":
            if (parent.test === node) {
                return sourceCode.getTokenAfter(parent.body, {
                    includeComments: false,
                    filter: eslint_utils_1.isOpeningParenToken,
                });
            }
            return null;
        case "IfStatement":
        case "WhileStatement":
            if (parent.test === node) {
                return sourceCode.getFirstToken(parent, {
                    includeComments: false,
                    skip: 1,
                });
            }
            return null;
        case "ImportExpression":
            if (parent.source === node) {
                return sourceCode.getFirstToken(parent, {
                    includeComments: false,
                    skip: 1,
                });
            }
            return null;
        case "SwitchStatement":
            if (parent.discriminant === node) {
                return sourceCode.getFirstToken(parent, {
                    includeComments: false,
                    skip: 1,
                });
            }
            return null;
        case "WithStatement":
            if (parent.object === node) {
                return sourceCode.getFirstToken(parent, {
                    includeComments: false,
                    skip: 1,
                });
            }
            return null;
        default:
            return null;
    }
}
function getName(nameNode) {
    if (nameNode.type === "JSXIdentifier") {
        return nameNode.name;
    }
    if (nameNode.type === "JSXNamespacedName") {
        return `${nameNode.namespace.name}:${nameNode.name.name}`;
    }
    if (nameNode.type === "JSXMemberExpression") {
        return `${getName(nameNode.object)}.${nameNode.property.name}`;
    }
    return null;
}
