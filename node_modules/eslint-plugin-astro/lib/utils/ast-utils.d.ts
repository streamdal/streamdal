import type { AST } from "astro-eslint-parser";
import type { TSESTree } from "@typescript-eslint/types";
import type { RuleContext, SourceCode } from "../types";
import type { StaticValue } from "@eslint-community/eslint-utils";
export declare function getAttributeName(node: AST.JSXAttribute | AST.AstroTemplateLiteralAttribute | AST.AstroShorthandAttribute | AST.JSXSpreadAttribute | TSESTree.JSXAttribute | TSESTree.JSXSpreadAttribute): string | null;
export declare function getElementName(node: AST.JSXElement): string | null;
export declare function findAttribute<N extends string>(node: AST.JSXElement, name: N): (AST.JSXAttribute | AST.AstroTemplateLiteralAttribute | AST.AstroShorthandAttribute) | null;
export declare function getSpreadAttributes(node: AST.JSXElement): AST.JSXSpreadAttribute[];
export declare function getStaticAttributeStringValue(node: AST.JSXAttribute | AST.AstroTemplateLiteralAttribute | AST.AstroShorthandAttribute, context?: RuleContext): string | null | undefined;
export declare function getStaticAttributeValue(node: AST.JSXAttribute | AST.AstroTemplateLiteralAttribute | AST.AstroShorthandAttribute, context?: RuleContext): StaticValue | null;
export declare function isStringCallExpression(node: TSESTree.Expression | TSESTree.PrivateIdentifier): node is TSESTree.CallExpression & {
    callee: TSESTree.Identifier;
};
export declare function isStringLiteral(node: TSESTree.Expression | TSESTree.PrivateIdentifier): node is TSESTree.StringLiteral;
export declare function extractConcatExpressions(node: TSESTree.BinaryExpression, sourceCode: SourceCode): null | (TSESTree.Expression | TSESTree.PrivateIdentifier)[];
export declare function getStringIfConstant(node: TSESTree.Expression | TSESTree.PrivateIdentifier): string | null;
export declare function needParentheses(node: TSESTree.Expression, kind: "not" | "logical"): boolean;
export declare function getParenthesizedTokens(node: TSESTree.Expression | TSESTree.SpreadElement | TSESTree.PrivateIdentifier, sourceCode: SourceCode): {
    left: TSESTree.Token;
    right: TSESTree.Token;
};
export declare function getParenthesizedRange(node: TSESTree.Expression, sourceCode: SourceCode): TSESTree.Range;
