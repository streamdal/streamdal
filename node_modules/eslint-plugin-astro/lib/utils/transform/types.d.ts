import type { AST } from "astro-eslint-parser";
export type TransformResult = {
    inputRange: AST.Range;
    output: string;
    mappings: string;
};
