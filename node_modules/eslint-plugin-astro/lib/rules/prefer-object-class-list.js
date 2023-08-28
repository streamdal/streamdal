"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("@typescript-eslint/types");
const eslint_utils_1 = require("@eslint-community/eslint-utils");
const eslint_utils_2 = require("@eslint-community/eslint-utils");
const utils_1 = require("../utils");
const ast_utils_1 = require("../utils/ast-utils");
exports.default = (0, utils_1.createRule)("prefer-object-class-list", {
    meta: {
        docs: {
            description: "require use object instead of ternary expression in `class:list`",
            category: "Stylistic Issues",
            recommended: false,
        },
        schema: [],
        messages: {
            unexpected: "Unexpected class using the ternary operator.",
        },
        fixable: "code",
        type: "suggestion",
    },
    create(context) {
        if (!context.parserServices.isAstro) {
            return {};
        }
        const sourceCode = context.getSourceCode();
        class NewObjectProps {
            constructor() {
                this.props = [];
            }
            toObjectString() {
                return `{${this.toPropsString()}}`;
            }
            fixObject({ fixer, object, }) {
                const closeBrace = sourceCode.getLastToken(object);
                const maybeComma = sourceCode.getTokenBefore(closeBrace);
                let text;
                if ((0, eslint_utils_2.isCommaToken)(maybeComma)) {
                    text = this.toPropsString();
                }
                else {
                    text = `,${this.toPropsString()}`;
                }
                return fixer.insertTextAfterRange(maybeComma.range, text);
            }
            toPropsString() {
                return `${this.props
                    .map(({ key, value }) => `${key}: ${value}`)
                    .join(", ")}`;
            }
        }
        function parseConditionalExpression(node) {
            const result = new Map();
            if (!processItems({
                node: node.test,
            }, node.consequent)) {
                return null;
            }
            if (!processItems({
                not: true,
                node: node.test,
            }, node.alternate)) {
                return null;
            }
            return result;
            function processItems(key, e) {
                if (e.type === "ConditionalExpression") {
                    const sub = parseConditionalExpression(e);
                    if (sub == null) {
                        return false;
                    }
                    for (const [expr, str] of sub) {
                        result.set(Object.assign(Object.assign({}, key), { chains: expr }), str);
                    }
                }
                else {
                    const str = (0, ast_utils_1.getStringIfConstant)(e);
                    if (str == null) {
                        return false;
                    }
                    result.set(key, str);
                }
                return true;
            }
        }
        function exprToString({ node, not }) {
            let text = sourceCode.text.slice(...node.range);
            if (not) {
                if (node.type === "BinaryExpression") {
                    if (node.operator === "===" ||
                        node.operator === "==" ||
                        node.operator === "!==" ||
                        node.operator === "!=") {
                        const left = sourceCode.text.slice(...node.left.range);
                        const op = sourceCode.text.slice(node.left.range[1], node.right.range[0]);
                        const right = sourceCode.text.slice(...node.right.range);
                        return `${left}${node.operator === "===" || node.operator === "=="
                            ? op.replace(/[=](={1,2})/g, "!$1")
                            : op.replace(/!(={1,2})/g, "=$1")}${right}`;
                    }
                }
                else if (node.type === "UnaryExpression") {
                    if (node.operator === "!" && node.prefix) {
                        return sourceCode.text.slice(...node.argument.range);
                    }
                }
                if ((0, ast_utils_1.needParentheses)(node, "not")) {
                    text = `(${text})`;
                }
                text = `!${text}`;
            }
            return text;
        }
        function getStrings(node) {
            if (node.type === "TemplateElement") {
                return [node.value.cooked];
            }
            if (node.type === "ConditionalExpression") {
                const values = parseConditionalExpression(node);
                if (values == null) {
                    return null;
                }
                return [...values.values()];
            }
            const str = (0, ast_utils_1.getStringIfConstant)(node);
            if (str == null) {
                return null;
            }
            return [str];
        }
        function endsWithSpace(elements) {
            for (let i = elements.length - 1; i >= 0; i--) {
                const valueNode = elements[i];
                const strings = getStrings(valueNode);
                if (strings == null) {
                    if (valueNode.type === types_1.AST_NODE_TYPES.TemplateLiteral) {
                        const quasiValue = valueNode.quasis[valueNode.quasis.length - 1].value.cooked;
                        if (quasiValue && !quasiValue[quasiValue.length - 1].trim()) {
                            return true;
                        }
                    }
                    return false;
                }
                let hasEmpty = false;
                for (const str of strings) {
                    if (str) {
                        if (str[str.length - 1].trim()) {
                            return false;
                        }
                    }
                    else {
                        hasEmpty = true;
                    }
                }
                if (!hasEmpty) {
                    return true;
                }
            }
            return null;
        }
        function startsWithSpace(elements) {
            for (let i = 0; i < elements.length; i++) {
                const valueNode = elements[i];
                const strings = getStrings(valueNode);
                if (strings == null) {
                    if (valueNode.type === types_1.AST_NODE_TYPES.TemplateLiteral) {
                        const quasiValue = valueNode.quasis[0].value.cooked;
                        if (quasiValue && !quasiValue[0].trim()) {
                            return true;
                        }
                    }
                    return false;
                }
                let hasEmpty = false;
                for (const str of strings) {
                    if (str) {
                        if (str[0].trim()) {
                            return false;
                        }
                    }
                    else {
                        hasEmpty = true;
                    }
                }
                if (!hasEmpty) {
                    return true;
                }
            }
            return null;
        }
        function report(node, map, state) {
            context.report({
                node,
                messageId: "unexpected",
                *fix(fixer) {
                    const classProps = new NewObjectProps();
                    let beforeSpaces = "";
                    let afterSpaces = "";
                    for (const [expr, className] of map) {
                        const trimmedClassName = className.trim();
                        if (trimmedClassName) {
                            classProps.props.push({
                                key: JSON.stringify(trimmedClassName),
                                value: exprToString(expr),
                            });
                        }
                        else {
                            if (!classProps.props.length) {
                                beforeSpaces += className;
                            }
                            else {
                                afterSpaces += className;
                            }
                        }
                    }
                    yield* state.fixExpression({
                        newProps: classProps,
                        beforeSpaces,
                        afterSpaces,
                        node,
                        fixer,
                    });
                },
            });
        }
        function verifyConditionalExpression(node, state) {
            const map = parseConditionalExpression(node);
            if (map == null) {
                return;
            }
            let canTransform = true;
            for (const className of map.values()) {
                if (className) {
                    if ((className[0].trim() && state.beforeIsWord()) ||
                        (className[className.length - 1].trim() && state.afterIsWord())) {
                        canTransform = false;
                        break;
                    }
                }
                else {
                    if (state.beforeIsWord() && state.afterIsWord()) {
                        canTransform = false;
                        break;
                    }
                }
            }
            if (!canTransform) {
                return;
            }
            report(node, map, state);
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
            for (const element of extractElements(expression)) {
                visitElementExpression(element.node, {
                    beforeIsWord: () => false,
                    afterIsWord: () => false,
                    *fixArrayElement(data) {
                        yield data.fixer.removeRange((0, ast_utils_1.getParenthesizedRange)(data.node, sourceCode));
                        if (!element.array) {
                            let open, close;
                            if (attr.type === "AstroTemplateLiteralAttribute") {
                                open = "{[";
                                close = "]}";
                            }
                            else {
                                open = "[";
                                close = "]";
                            }
                            yield data.fixer.insertTextBeforeRange(expression.range, open);
                            yield data.fixer.insertTextAfterRange(expression.range, `,${data.newProps.toObjectString()}${close}`);
                            return;
                        }
                        const object = findClosestObject(element.array, element.node);
                        if (object) {
                            yield data.newProps.fixObject({ fixer: data.fixer, object });
                            return;
                        }
                        const tokens = (0, ast_utils_1.getParenthesizedTokens)(element.node, sourceCode);
                        const maybeComma = sourceCode.getTokenAfter(tokens.right);
                        let insertOffset, text;
                        if ((0, eslint_utils_2.isCommaToken)(maybeComma)) {
                            insertOffset = maybeComma.range[1];
                            text = data.newProps.toObjectString();
                        }
                        else {
                            insertOffset = tokens.right.range[1];
                            text = `,${data.newProps.toObjectString()}`;
                        }
                        if (element.array.elements[element.array.elements.length - 1] !==
                            element.node) {
                            text += ",";
                        }
                        yield data.fixer.insertTextAfterRange([insertOffset, insertOffset], text);
                    },
                    *fixExpression(data) {
                        if (element.array) {
                            const object = findClosestObject(element.array, element.node);
                            if (object) {
                                yield data.fixer.removeRange((0, ast_utils_1.getParenthesizedRange)(data.node, sourceCode));
                                const tokens = (0, ast_utils_1.getParenthesizedTokens)(element.node, sourceCode);
                                const maybeComma = sourceCode.getTokenAfter(tokens.right);
                                if ((0, eslint_utils_2.isCommaToken)(maybeComma)) {
                                    yield data.fixer.removeRange(maybeComma.range);
                                }
                                else {
                                    const maybeBeforeComma = sourceCode.getTokenBefore(tokens.left);
                                    if ((0, eslint_utils_2.isCommaToken)(maybeBeforeComma)) {
                                        yield data.fixer.removeRange(maybeBeforeComma.range);
                                    }
                                }
                                yield data.newProps.fixObject({ fixer: data.fixer, object });
                                return;
                            }
                        }
                        yield data.fixer.replaceTextRange((0, ast_utils_1.getParenthesizedRange)(data.node, sourceCode), data.newProps.toObjectString());
                    },
                });
            }
            function findClosestObject(array, target) {
                const index = array.elements.indexOf(target);
                const afterElements = array.elements.slice(index + 1);
                const beforeElements = array.elements.slice(0, index).reverse();
                const length = Math.max(afterElements.length, beforeElements.length);
                for (let index = 0; index < length; index++) {
                    const after = afterElements[index];
                    if ((after === null || after === void 0 ? void 0 : after.type) === types_1.AST_NODE_TYPES.ObjectExpression) {
                        return after;
                    }
                    const before = beforeElements[index];
                    if ((before === null || before === void 0 ? void 0 : before.type) === types_1.AST_NODE_TYPES.ObjectExpression) {
                        return before;
                    }
                }
                return null;
            }
            function visitElementExpression(node, state) {
                if (node.type === types_1.AST_NODE_TYPES.ConditionalExpression) {
                    verifyConditionalExpression(node, state);
                }
                else if (node.type === types_1.AST_NODE_TYPES.TemplateLiteral) {
                    const quasis = [...node.quasis];
                    let beforeQuasiWk = quasis.shift();
                    for (const expression of node.expressions) {
                        const beforeQuasi = beforeQuasiWk;
                        const afterQuasi = quasis.shift();
                        visitElementExpression(expression, {
                            beforeIsWord() {
                                const beforeElements = [];
                                const targetIndex = node.expressions.indexOf(expression);
                                for (let index = 0; index < targetIndex; index++) {
                                    beforeElements.push(node.quasis[index], node.expressions[index]);
                                }
                                beforeElements.push(node.quasis[targetIndex]);
                                const isSpace = endsWithSpace(beforeElements);
                                return isSpace == null ? state.beforeIsWord() : !isSpace;
                            },
                            afterIsWord() {
                                const targetIndex = node.expressions.indexOf(expression);
                                const afterElements = [node.quasis[targetIndex + 1]];
                                for (let index = targetIndex + 1; index < node.expressions.length; index++) {
                                    afterElements.push(node.expressions[index], node.quasis[index + 1]);
                                }
                                const isSpace = startsWithSpace(afterElements);
                                return isSpace == null ? state.afterIsWord() : !isSpace;
                            },
                            fixArrayElement: state.fixArrayElement,
                            *fixExpression(data) {
                                const fixer = data.fixer;
                                if (beforeQuasi.value.cooked.trim() ||
                                    afterQuasi.value.cooked.trim() ||
                                    node.expressions.length > 1) {
                                    yield fixer.replaceTextRange([beforeQuasi.range[1] - 2, beforeQuasi.range[1]], data.beforeSpaces);
                                    yield fixer.replaceTextRange([afterQuasi.range[0], afterQuasi.range[0] + 1], data.afterSpaces);
                                    yield* state.fixArrayElement(data);
                                    return;
                                }
                                const tokens = (0, ast_utils_1.getParenthesizedTokens)(node, sourceCode);
                                yield fixer.removeRange([
                                    tokens.left.range[0],
                                    beforeQuasi.range[1],
                                ]);
                                yield fixer.removeRange([
                                    afterQuasi.range[0],
                                    tokens.right.range[1],
                                ]);
                                yield* state.fixExpression(Object.assign(Object.assign({}, data), { beforeSpaces: beforeQuasi.value.cooked + data.beforeSpaces, afterSpaces: data.afterSpaces + afterQuasi.value.cooked }));
                            },
                        });
                        beforeQuasiWk = afterQuasi;
                    }
                }
                else if (node.type === types_1.AST_NODE_TYPES.CallExpression) {
                    if ((0, ast_utils_1.isStringCallExpression)(node) &&
                        node.arguments[0] &&
                        node.arguments[0].type !== types_1.AST_NODE_TYPES.SpreadElement) {
                        visitElementExpression(node.arguments[0], {
                            beforeIsWord: state.beforeIsWord,
                            afterIsWord: state.afterIsWord,
                            fixArrayElement: state.fixArrayElement,
                            *fixExpression(data) {
                                const openParen = sourceCode.getTokenAfter((0, ast_utils_1.getParenthesizedTokens)(node.callee, sourceCode).right);
                                const stripStart = sourceCode.getTokenAfter((0, ast_utils_1.getParenthesizedTokens)(node.arguments[0], sourceCode).right);
                                const tokens = (0, ast_utils_1.getParenthesizedTokens)(node, sourceCode);
                                yield data.fixer.removeRange([
                                    tokens.left.range[0],
                                    openParen.range[1],
                                ]);
                                yield data.fixer.removeRange([
                                    stripStart.range[0],
                                    tokens.right.range[1],
                                ]);
                                yield* state.fixExpression(data);
                            },
                        });
                    }
                    else if (node.callee.type === types_1.AST_NODE_TYPES.MemberExpression &&
                        (0, eslint_utils_1.getPropertyName)(node.callee) === "trim") {
                        const men = node.callee;
                        visitElementExpression(men.object, {
                            beforeIsWord: state.beforeIsWord,
                            afterIsWord: state.afterIsWord,
                            fixArrayElement: state.fixArrayElement,
                            *fixExpression(data) {
                                const tokens = (0, ast_utils_1.getParenthesizedTokens)(men.object, sourceCode);
                                yield data.fixer.removeRange([
                                    tokens.right.range[1],
                                    node.range[1],
                                ]);
                                yield* state.fixExpression(data);
                            },
                        });
                    }
                }
                else if (node.type === types_1.AST_NODE_TYPES.BinaryExpression) {
                    const elements = (0, ast_utils_1.extractConcatExpressions)(node, sourceCode);
                    if (!elements) {
                        return;
                    }
                    for (const expression of elements) {
                        visitElementExpression(expression, {
                            beforeIsWord() {
                                const index = elements.indexOf(expression);
                                const beforeElements = elements.slice(0, index);
                                const isSpace = endsWithSpace(beforeElements);
                                return isSpace == null ? state.beforeIsWord() : !isSpace;
                            },
                            afterIsWord() {
                                const index = elements.indexOf(expression);
                                const afterElements = elements.slice(index + 1);
                                const isSpace = startsWithSpace(afterElements);
                                return isSpace == null ? state.afterIsWord() : !isSpace;
                            },
                            fixArrayElement: state.fixArrayElement,
                            *fixExpression(data) {
                                const fixer = data.fixer;
                                const index = elements.indexOf(expression);
                                const beforeElements = elements.slice(0, index);
                                const afterElements = elements.slice(index + 1);
                                const tokens = (0, ast_utils_1.getParenthesizedTokens)(expression, sourceCode);
                                if (beforeElements.some((element) => {
                                    const str = (0, ast_utils_1.getStringIfConstant)(element);
                                    return str == null || Boolean(str.trim());
                                }) ||
                                    afterElements.some((element) => {
                                        const str = (0, ast_utils_1.getStringIfConstant)(element);
                                        return str == null || Boolean(str.trim());
                                    })) {
                                    const beforeElement = beforeElements[beforeElements.length - 1];
                                    const afterElement = afterElements[0];
                                    if (beforeElement &&
                                        (0, ast_utils_1.isStringLiteral)(beforeElement) &&
                                        afterElement &&
                                        (0, ast_utils_1.isStringLiteral)(afterElement)) {
                                        if (sourceCode.text[beforeElement.range[0]] !==
                                            sourceCode.text[afterElement.range[0]]) {
                                            const targetIsBefore = sourceCode.text[beforeElement.range[0]] === "'";
                                            const replaceLiteral = targetIsBefore
                                                ? beforeElement
                                                : afterElement;
                                            yield fixer.replaceTextRange([
                                                replaceLiteral.range[0] + 1,
                                                replaceLiteral.range[1] - 1,
                                            ], JSON.stringify(replaceLiteral.value).slice(1, -1));
                                            yield fixer.replaceTextRange(targetIsBefore
                                                ? [
                                                    replaceLiteral.range[0],
                                                    replaceLiteral.range[0] + 1,
                                                ]
                                                : [
                                                    replaceLiteral.range[1] - 1,
                                                    replaceLiteral.range[1],
                                                ], '"');
                                        }
                                        yield fixer.replaceTextRange([beforeElement.range[1] - 1, tokens.left.range[0]], data.beforeSpaces);
                                        yield fixer.replaceTextRange([tokens.right.range[1], afterElement.range[0] + 1], data.afterSpaces);
                                    }
                                    else {
                                        const beforeToken = sourceCode.getTokenBefore(tokens.left);
                                        if ((beforeToken === null || beforeToken === void 0 ? void 0 : beforeToken.value) === "+") {
                                            yield fixer.removeRange(beforeToken.range);
                                        }
                                        else {
                                            const afterToken = sourceCode.getTokenAfter(tokens.right);
                                            yield fixer.removeRange(afterToken.range);
                                        }
                                    }
                                    yield* state.fixArrayElement(data);
                                    return;
                                }
                                if (beforeElements.length) {
                                    const beforeToken = sourceCode.getTokenBefore(tokens.left);
                                    yield fixer.removeRange([
                                        beforeElements[0].range[0],
                                        beforeToken.range[1],
                                    ]);
                                }
                                if (afterElements.length) {
                                    const afterToken = sourceCode.getTokenAfter(tokens.right);
                                    yield fixer.removeRange([
                                        afterToken.range[0],
                                        afterElements[afterElements.length - 1].range[1],
                                    ]);
                                }
                                yield* state.fixExpression(Object.assign(Object.assign({}, data), { beforeSpaces: beforeElements
                                        .map((e) => (0, ast_utils_1.getStringIfConstant)(e))
                                        .join("") + data.beforeSpaces, afterSpaces: data.afterSpaces +
                                        afterElements.map((e) => (0, ast_utils_1.getStringIfConstant)(e)).join("") }));
                            },
                        });
                    }
                }
            }
        }
        function extractElements(node) {
            if (node.type === types_1.AST_NODE_TYPES.ArrayExpression) {
                const result = [];
                for (const element of node.elements) {
                    if (!element || element.type === types_1.AST_NODE_TYPES.SpreadElement) {
                        continue;
                    }
                    result.push(...extractElements(element).map((e) => {
                        if (e.array == null) {
                            return {
                                array: node,
                                node: e.node,
                            };
                        }
                        return e;
                    }));
                }
                return result;
            }
            return [{ node, array: null }];
        }
        return {
            JSXAttribute: verifyAttr,
            AstroTemplateLiteralAttribute: verifyAttr,
        };
    },
});
