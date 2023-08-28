import type { AST } from "astro-eslint-parser";
import type { RuleContext } from "../../types";
export type StyleContentCSS = {
    css: string;
    remap: (index: number) => number;
};
export declare function getStyleContentCSS(node: AST.JSXElement, context: RuleContext): StyleContentCSS | null;
