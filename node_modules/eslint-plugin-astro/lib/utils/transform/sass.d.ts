import type { AST } from "astro-eslint-parser";
import type { TransformResult } from "./types";
import type { RuleContext } from "../../types";
export declare function transform(node: AST.JSXElement, context: RuleContext, type: "scss" | "sass"): TransformResult | null;
