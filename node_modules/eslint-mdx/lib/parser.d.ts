import type { Linter } from 'eslint';
import type { ParserOptions } from './types';
export declare const DEFAULT_EXTENSIONS: readonly string[];
export declare const MARKDOWN_EXTENSIONS: readonly string[];
export declare class Parser {
    constructor();
    parse(code: string, options: ParserOptions): import("eslint").AST.Program;
    parseForESLint(code: string, { filePath, sourceType, ignoreRemarkConfig, extensions, markdownExtensions, }: ParserOptions): Linter.ESLintParseResult;
}
export declare const parser: Parser;
export declare const parse: (code: string, options: ParserOptions) => import("eslint").AST.Program, parseForESLint: (code: string, { filePath, sourceType, ignoreRemarkConfig, extensions, markdownExtensions, }: ParserOptions) => Linter.ESLintParseResult;
