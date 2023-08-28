import type { parseForESLint } from "@typescript-eslint/parser";
export declare function resolveParser(): {
    parseForESLint: typeof parseForESLint;
};
export declare function getInstalledParserId(): "@typescript-eslint/parser" | "@babel/eslint-parser" | undefined;
