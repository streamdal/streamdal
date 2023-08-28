import type { AST } from "astro-eslint-parser";
import type { RuleContext } from "../../types";
import type { TransformResult } from "./types";
export declare function transform(node: AST.JSXElement, context: RuleContext): TransformResult | null;
