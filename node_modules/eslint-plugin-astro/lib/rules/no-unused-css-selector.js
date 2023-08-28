"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("@typescript-eslint/types");
const eslint_utils_1 = require("@eslint-community/eslint-utils");
const postcss_1 = __importDefault(require("postcss"));
const postcss_selector_parser_1 = __importDefault(require("postcss-selector-parser"));
const utils_1 = require("../utils");
const ast_utils_1 = require("../utils/ast-utils");
const transform_1 = require("../utils/transform");
exports.default = (0, utils_1.createRule)("no-unused-css-selector", {
    meta: {
        docs: {
            description: "disallow selectors defined in `style` tag that don't use in HTML",
            category: "Best Practices",
            recommended: false,
        },
        schema: [],
        messages: {
            unused: "Unused CSS selector `{{selector}}`",
        },
        type: "problem",
    },
    create(context) {
        if (!context.parserServices.isAstro) {
            return {};
        }
        const styles = [];
        const rootTree = {
            parent: null,
            node: null,
            childElements: [],
        };
        const allTreeElements = [];
        let currTree = rootTree;
        function verifyCSS(css) {
            let root;
            try {
                root = postcss_1.default.parse(css.css);
            }
            catch (_e) {
                return;
            }
            const ignoreNodes = new Set();
            root.walk((psNode) => {
                if (psNode.parent && ignoreNodes.has(psNode.parent)) {
                    ignoreNodes.add(psNode);
                    return;
                }
                if (psNode.type !== "rule") {
                    if (psNode.type === "atrule") {
                        if (psNode.name === "keyframes") {
                            ignoreNodes.add(psNode);
                        }
                    }
                    return;
                }
                const rule = psNode;
                const raws = rule.raws;
                const rawSelectorText = raws.selector
                    ? raws.selector.raw
                    : rule.selector;
                for (const selector of parseSelector(rawSelectorText, context)) {
                    if (selector.error) {
                        continue;
                    }
                    if (allTreeElements.some((tree) => selector.test(tree))) {
                        continue;
                    }
                    reportSelector(rule.source.start.offset + selector.offset, selector.selector);
                }
            });
            function reportSelector(start, selector) {
                const remapStart = css.remap(start);
                const remapEnd = css.remap(start + selector.length);
                const sourceCode = context.getSourceCode();
                context.report({
                    loc: {
                        start: sourceCode.getLocFromIndex(remapStart),
                        end: sourceCode.getLocFromIndex(remapEnd),
                    },
                    messageId: "unused",
                    data: {
                        selector,
                    },
                });
            }
        }
        return {
            JSXElement(node) {
                const name = (0, ast_utils_1.getElementName)(node);
                if (name === "Fragment" || name === "slot") {
                    return;
                }
                if (name === "style" && !(0, ast_utils_1.findAttribute)(node, "is:global")) {
                    styles.push(node);
                }
                const tree = {
                    parent: currTree,
                    node,
                    childElements: [],
                };
                allTreeElements.unshift(tree);
                currTree.childElements.push(tree);
                currTree = tree;
            },
            "JSXElement:exit"(node) {
                if (currTree.node === node) {
                    if (currTree.node) {
                        const expressions = currTree.node.children.filter((e) => e.type === "JSXExpressionContainer");
                        if (expressions.length) {
                            for (const child of currTree.childElements) {
                                child.withinExpression = expressions.some((e) => e.range[0] <= child.node.range[0] &&
                                    child.node.range[1] <= e.range[1]);
                            }
                        }
                    }
                    currTree = currTree.parent;
                }
            },
            "Program:exit"() {
                for (const style of styles) {
                    const css = (0, transform_1.getStyleContentCSS)(style, context);
                    if (css) {
                        verifyCSS(css);
                    }
                }
            },
        };
    },
});
class SelectorError extends Error {
}
function parseSelector(selector, context) {
    let astSelector;
    try {
        astSelector = (0, postcss_selector_parser_1.default)().astSync(selector);
    }
    catch (error) {
        return [
            {
                error,
                selector,
                offset: 0,
                test: () => false,
            },
        ];
    }
    return astSelector.nodes.map((sel) => {
        var _a, _b;
        const nodes = removeGlobals(cleanSelectorChildren(sel));
        try {
            const test = selectorToJSXElementMatcher(nodes, context);
            return {
                selector: sel.toString().trim(),
                offset: (_a = sel.sourceIndex) !== null && _a !== void 0 ? _a : sel.nodes[0].sourceIndex,
                test(element) {
                    return test(element, null);
                },
            };
        }
        catch (error) {
            if (error instanceof SelectorError) {
                return {
                    error,
                    selector: sel.toString().trim(),
                    offset: (_b = sel.sourceIndex) !== null && _b !== void 0 ? _b : sel.nodes[0].sourceIndex,
                    test: () => false,
                };
            }
            throw error;
        }
    });
    function removeGlobals(nodes) {
        var _a, _b, _c;
        let start = 0;
        let end = nodes.length;
        while (nodes[end - 1] && isGlobalPseudo(nodes[end - 1])) {
            end--;
            if (((_a = nodes[end - 1]) === null || _a === void 0 ? void 0 : _a.type) === "combinator") {
                end--;
            }
        }
        while (nodes[start] && isGlobalPseudo(nodes[start])) {
            start++;
            if (((_b = nodes[start]) === null || _b === void 0 ? void 0 : _b.type) === "combinator") {
                start++;
            }
        }
        if (nodes.some(isRootPseudo)) {
            while (nodes[start] && !isRootPseudo(nodes[start])) {
                start++;
            }
            start++;
            while (nodes[start] && nodes[start].type !== "combinator") {
                start++;
            }
            if (((_c = nodes[start]) === null || _c === void 0 ? void 0 : _c.type) === "combinator") {
                start++;
            }
        }
        return nodes.slice(start, end);
    }
}
function selectorsToJSXElementMatcher(selectorNodes, context) {
    const selectors = selectorNodes.map((n) => selectorToJSXElementMatcher(cleanSelectorChildren(n), context));
    return (element, subject) => selectors.some((sel) => sel(element, subject));
}
function isDescendantCombinator(node) {
    return Boolean(node && node.type === "combinator" && !node.value.trim());
}
function cleanSelectorChildren(selector) {
    const nodes = [];
    let last = null;
    for (const node of selector.nodes) {
        if (node.type === "root") {
            throw new SelectorError("Unexpected state type=root");
        }
        if (node.type === "comment") {
            continue;
        }
        if ((last == null || last.type === "combinator") &&
            isDescendantCombinator(node)) {
            continue;
        }
        if (isDescendantCombinator(last) && node.type === "combinator") {
            nodes.pop();
        }
        nodes.push(node);
        last = node;
    }
    if (isDescendantCombinator(last)) {
        nodes.pop();
    }
    return nodes;
}
function selectorToJSXElementMatcher(selectorChildren, context) {
    const nodes = [...selectorChildren];
    let node = nodes.shift();
    let result = null;
    while (node) {
        if (node.type === "combinator") {
            const combinator = node.value;
            node = nodes.shift();
            if (!node) {
                throw new SelectorError(`Expected selector after '${combinator}'.`);
            }
            if (node.type === "combinator") {
                throw new SelectorError(`Unexpected combinator '${node.value}'.`);
            }
            const right = nodeToJSXElementMatcher(node, context);
            result = combination(result ||
                ((element, subject) => element === subject), combinator, right);
        }
        else {
            const sel = nodeToJSXElementMatcher(node, context);
            result = result ? compound(result, sel) : sel;
        }
        node = nodes.shift();
    }
    if (!result) {
        return () => true;
    }
    return result;
}
function combination(left, combinator, right) {
    switch (combinator.trim()) {
        case "":
            return (element, subject) => {
                if (right(element, null)) {
                    let parent = element.parent;
                    while (parent.node) {
                        if (left(parent, subject)) {
                            return true;
                        }
                        parent = parent.parent;
                    }
                }
                return false;
            };
        case ">":
            return (element, subject) => {
                if (right(element, null)) {
                    const parent = element.parent;
                    if (parent.node) {
                        return left(parent, subject);
                    }
                }
                return false;
            };
        case "+":
            return (element, subject) => {
                if (right(element, null)) {
                    const before = getBeforeElement(element);
                    if (before) {
                        return left(before, subject);
                    }
                }
                return false;
            };
        case "~":
            return (element, subject) => {
                if (right(element, null)) {
                    for (const before of getBeforeElements(element)) {
                        if (left(before, subject)) {
                            return true;
                        }
                    }
                }
                return false;
            };
        default:
            throw new SelectorError(`Unknown combinator: ${combinator}.`);
    }
}
function nodeToJSXElementMatcher(selector, context) {
    const baseMatcher = (() => {
        switch (selector.type) {
            case "attribute":
                return attributeNodeToJSXElementMatcher(selector, context);
            case "class":
                return classNameNodeToJSXElementMatcher(selector, context);
            case "id":
                return identifierNodeToJSXElementMatcher(selector, context);
            case "tag":
                return tagNodeToJSXElementMatcher(selector);
            case "universal":
                return universalNodeToJSXElementMatcher(selector);
            case "pseudo":
                return pseudoNodeToJSXElementMatcher(selector, context);
            case "nesting":
                throw new SelectorError("Unsupported nesting selector.");
            case "string":
                throw new SelectorError(`Unknown selector: ${selector.value}.`);
            default:
                throw new SelectorError(`Unknown selector: ${selector.value}.`);
        }
    })();
    return (element, subject) => {
        if (isComponentElement(element)) {
            return false;
        }
        return baseMatcher(element, subject);
    };
}
function attributeNodeToJSXElementMatcher(selector, context) {
    const key = selector.attribute;
    if (!selector.operator) {
        return (element, _) => {
            return hasAttribute(element, key, context);
        };
    }
    const value = selector.value || "";
    switch (selector.operator) {
        case "=":
            return buildJSXElementMatcher(value, (attr, val) => attr === val);
        case "~=":
            return buildJSXElementMatcher(value, (attr, val) => attr.split(/\s+/u).includes(val));
        case "|=":
            return buildJSXElementMatcher(value, (attr, val) => attr === val || attr.startsWith(`${val}-`));
        case "^=":
            return buildJSXElementMatcher(value, (attr, val) => attr.startsWith(val));
        case "$=":
            return buildJSXElementMatcher(value, (attr, val) => attr.endsWith(val));
        case "*=":
            return buildJSXElementMatcher(value, (attr, val) => attr.includes(val));
        default:
            throw new SelectorError(`Unsupported operator: ${selector.operator}.`);
    }
    function buildJSXElementMatcher(selectorValue, test) {
        const val = selector.insensitive
            ? selectorValue.toLowerCase()
            : selectorValue;
        return (element) => {
            const attr = getAttribute(element, key, context);
            if (attr == null) {
                return false;
            }
            if (attr.unknown || !attr.staticValue) {
                return true;
            }
            const attrValue = attr.staticValue.value;
            return test(selector.insensitive ? attrValue.toLowerCase() : attrValue, val);
        };
    }
}
function classNameNodeToJSXElementMatcher(selector, context) {
    const className = selector.value;
    return (element) => {
        const attr = getAttribute(element, "class", context);
        if (attr == null) {
            return false;
        }
        if (attr.unknown || !attr.staticValue) {
            return true;
        }
        const attrValue = attr.staticValue.value;
        return attrValue.split(/\s+/u).includes(className);
    };
}
function identifierNodeToJSXElementMatcher(selector, context) {
    const id = selector.value;
    return (element) => {
        const attr = getAttribute(element, "id", context);
        if (attr == null) {
            return false;
        }
        if (attr.unknown || !attr.staticValue) {
            return true;
        }
        const attrValue = attr.staticValue.value;
        return attrValue === id;
    };
}
function tagNodeToJSXElementMatcher(selector) {
    const name = selector.value;
    return (element) => {
        const elementName = (0, ast_utils_1.getElementName)(element.node);
        return elementName === name;
    };
}
function universalNodeToJSXElementMatcher(_selector) {
    return () => true;
}
function pseudoNodeToJSXElementMatcher(selector, context) {
    const pseudo = selector.value;
    switch (pseudo) {
        case ":is":
        case ":where":
            return selectorsToJSXElementMatcher(selector.nodes, context);
        case ":has":
            return pseudoHasSelectorsToJSXElementMatcher(selector.nodes, context);
        case ":empty":
            return (element) => element.node.children.every((child) => (child.type === "JSXText" && !child.value.trim()) ||
                child.type === "AstroHTMLComment");
        case ":global": {
            return () => true;
        }
        default:
            return () => true;
    }
}
function pseudoHasSelectorsToJSXElementMatcher(selectorNodes, context) {
    const selectors = selectorNodes.map((n) => pseudoHasSelectorToJSXElementMatcher(n, context));
    return (element, subject) => selectors.some((sel) => sel(element, subject));
}
function pseudoHasSelectorToJSXElementMatcher(selector, context) {
    const nodes = cleanSelectorChildren(selector);
    const selectors = selectorToJSXElementMatcher(nodes, context);
    const firstNode = nodes[0];
    if (firstNode.type === "combinator" &&
        (firstNode.value === "+" || firstNode.value === "~")) {
        return buildJSXElementMatcher((element) => getAfterElements(element));
    }
    return buildJSXElementMatcher((element) => element.childElements);
    function buildJSXElementMatcher(getStartElements) {
        return (element) => {
            const elements = [...getStartElements(element)];
            let curr;
            while ((curr = elements.shift())) {
                const el = curr;
                if (selectors(el, element)) {
                    return true;
                }
                elements.push(...el.childElements);
            }
            return false;
        };
    }
}
function getBeforeElement(element) {
    return getBeforeElements(element).pop() || null;
}
function getBeforeElements(element) {
    const parent = element.parent;
    if (!parent) {
        return [];
    }
    const index = parent.childElements.indexOf(element);
    return parent.childElements.slice(0, element.withinExpression ? index + 1 : index);
}
function getAfterElements(element) {
    const parent = element.parent;
    if (!parent) {
        return [];
    }
    const index = parent.childElements.indexOf(element);
    return parent.childElements.slice(element.withinExpression ? index : index + 1);
}
function compound(a, b) {
    return (element, subject) => a(element, subject) && b(element, subject);
}
function isComponentElement(element) {
    const elementName = (0, ast_utils_1.getElementName)(element.node);
    return elementName == null || elementName.toLowerCase() !== elementName;
}
function isGlobalPseudo(node) {
    return node.type === "pseudo" && node.value === ":global";
}
function isRootPseudo(node) {
    return node.type === "pseudo" && node.value === ":root";
}
function hasAttribute(element, attribute, context) {
    const attr = getAttribute(element, attribute, context);
    if (attr) {
        return true;
    }
    return false;
}
function getAttribute(element, attribute, context) {
    const attr = (0, ast_utils_1.findAttribute)(element.node, attribute);
    if (attr) {
        if (attr.value == null) {
            return {
                unknown: false,
                hasAttr: true,
                staticValue: { value: "" },
            };
        }
        const value = (0, ast_utils_1.getStaticAttributeStringValue)(attr, context);
        if (value == null) {
            return {
                unknown: false,
                hasAttr: true,
                staticValue: null,
            };
        }
        return {
            unknown: false,
            hasAttr: true,
            staticValue: { value },
        };
    }
    if (attribute === "class") {
        const result = getClassListAttribute(element, context);
        if (result) {
            return result;
        }
    }
    const spreadAttributes = (0, ast_utils_1.getSpreadAttributes)(element.node);
    if (spreadAttributes.length === 0) {
        return null;
    }
    return {
        unknown: true,
    };
}
function getClassListAttribute(element, context) {
    const attr = (0, ast_utils_1.findAttribute)(element.node, "class:list");
    if (attr) {
        if (attr.value == null) {
            return {
                unknown: false,
                hasAttr: true,
                staticValue: { value: "" },
            };
        }
        const classList = extractClassList(attr, context);
        if (classList === null) {
            return {
                unknown: false,
                hasAttr: true,
                staticValue: null,
            };
        }
        return {
            unknown: false,
            hasAttr: true,
            staticValue: { value: classList.classList.join(" ") },
        };
    }
    return null;
}
function extractClassList(node, context) {
    var _a, _b;
    if (((_a = node.value) === null || _a === void 0 ? void 0 : _a.type) === types_1.AST_NODE_TYPES.Literal) {
        return { classList: [String(node.value.value)] };
    }
    if (((_b = node.value) === null || _b === void 0 ? void 0 : _b.type) === "JSXExpressionContainer" &&
        node.value.expression.type !== "JSXEmptyExpression") {
        const classList = [];
        for (const className of extractClassListFromExpression(node.value.expression, context)) {
            if (className == null) {
                return null;
            }
            classList.push(className);
        }
        return { classList };
    }
    return null;
}
function* extractClassListFromExpression(node, context) {
    if (node.type === types_1.AST_NODE_TYPES.ArrayExpression) {
        for (const element of node.elements) {
            if (element == null)
                continue;
            if (element.type === types_1.AST_NODE_TYPES.SpreadElement) {
                yield* extractClassListFromExpression(element.argument, context);
            }
            else {
                yield* extractClassListFromExpression(element, context);
            }
        }
        return;
    }
    if (node.type === types_1.AST_NODE_TYPES.ObjectExpression) {
        for (const prop of node.properties) {
            if (prop.type === types_1.AST_NODE_TYPES.SpreadElement) {
                yield* extractClassListFromExpression(prop.argument, context);
            }
            else {
                if (!prop.computed) {
                    if (prop.key.type === types_1.AST_NODE_TYPES.Literal) {
                        yield String(prop.key.value);
                    }
                    else {
                        yield prop.key.name;
                    }
                }
                else {
                    yield* extractClassListFromExpression(prop.key, context);
                }
            }
        }
        return;
    }
    const staticValue = (0, eslint_utils_1.getStaticValue)(node, context.getSourceCode().scopeManager.globalScope);
    if (staticValue) {
        yield* extractClassListFromUnknown(staticValue.value);
        return;
    }
    yield null;
}
function* extractClassListFromUnknown(value) {
    if (!value) {
        return;
    }
    if (Array.isArray(value)) {
        for (const e of value) {
            yield* extractClassListFromUnknown(e);
        }
        return;
    }
    if (typeof value === "object") {
        yield* Object.keys(value);
        return;
    }
    yield String(value);
}
