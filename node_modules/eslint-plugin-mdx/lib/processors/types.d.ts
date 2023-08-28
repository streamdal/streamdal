export interface ESLintMdxSettings {
    'mdx/code-blocks'?: boolean;
    'mdx/language-mapper'?: Record<string, string> | false;
}
export interface ProcessorOptions {
    lintCodeBlocks: boolean;
    languageMapper?: Record<string, string> | false;
}
