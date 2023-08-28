"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const ast_utils_1 = require("../utils/ast-utils");
exports.default = (0, utils_1.createRule)("no-set-html-directive", {
    meta: {
        docs: {
            description: "disallow use of `set:html` to prevent XSS attack",
            category: "Security Vulnerability",
            recommended: false,
        },
        schema: [],
        messages: {
            unexpected: "`set:html` can lead to XSS attack.",
        },
        type: "suggestion",
    },
    create(context) {
        if (!context.parserServices.isAstro) {
            return {};
        }
        function verifyName(attr) {
            if ((0, ast_utils_1.getAttributeName)(attr) !== "set:html") {
                return;
            }
            context.report({
                node: attr.name,
                messageId: "unexpected",
            });
        }
        return {
            JSXAttribute: verifyName,
            AstroTemplateLiteralAttribute: verifyName,
        };
    },
});
