import type { TSESTree } from "@typescript-eslint/types";
export declare const enum CSSTokenType {
    quoted = "Quoted",
    block = "Block",
    line = "Line",
    word = "Word",
    punctuator = "Punctuator"
}
export interface CSSWordToken {
    type: CSSTokenType.word;
    value: string;
    range: TSESTree.Range;
}
export interface CSSQuotedToken {
    type: CSSTokenType.quoted;
    valueRange: TSESTree.Range;
    value: string;
    range: TSESTree.Range;
    quote: '"' | "'";
}
export interface CSSPunctuatorToken {
    type: CSSTokenType.punctuator;
    value: string;
    range: TSESTree.Range;
}
export interface CSSCommentToken {
    type: CSSTokenType.block | CSSTokenType.line;
    valueRange: TSESTree.Range;
    value: string;
    range: TSESTree.Range;
}
export type CSSToken = CSSWordToken | CSSQuotedToken | CSSPunctuatorToken | CSSCommentToken;
export type CSSTokenizeOption = {
    inlineComment?: boolean;
};
export declare class CSSTokenizer {
    readonly text: string;
    private readonly options;
    private cp;
    private offset;
    private nextOffset;
    private reconsuming;
    constructor(text: string, startOffset: number, options?: CSSTokenizeOption);
    nextToken(): CSSToken | null;
    private nextCodePoint;
    private consumeNextCodePoint;
    private consumeNextToken;
    private consumeWord;
    private consumeString;
    private consumeComment;
    private consumeInlineComment;
}
