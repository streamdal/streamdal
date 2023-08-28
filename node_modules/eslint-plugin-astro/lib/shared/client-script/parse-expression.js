"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseExpression = void 0;
const astro_eslint_parser_1 = require("astro-eslint-parser");
const resolve_parser_1 = require("../../utils/resolve-parser");
function parseExpression(code) {
    const result = (0, resolve_parser_1.resolveParser)().parseForESLint(`(
${code}
)`, { range: true, loc: true });
    const statement = result.ast.body[0];
    const expression = statement.expression;
    (0, astro_eslint_parser_1.traverseNodes)(expression, {
        visitorKeys: result.visitorKeys,
        enterNode(node) {
            node.loc.start = Object.assign(Object.assign({}, node.loc.start), { line: node.loc.start.line - 1 });
            node.loc.end = Object.assign(Object.assign({}, node.loc.end), { line: node.loc.end.line - 1 });
            node.range = [node.range[0] - 2, node.range[1] - 2];
        },
        leaveNode() {
        },
    });
    return expression;
}
exports.parseExpression = parseExpression;
