import type { AST } from "astro-eslint-parser";
import type { RuleContext } from "../../types";
export declare function loadModule<R>(context: RuleContext, name: string): R | null;
export declare function getContentRange(node: AST.JSXElement): AST.Range;
