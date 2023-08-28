import type { Token } from "./tokens";
export declare class Tokenizer {
    private readonly source;
    pos: number;
    private readonly end;
    private readonly ecmaVersion;
    constructor(source: string, options: {
        start: number;
        end?: number;
        ecmaVersion: number;
    });
    parseTokens(quote?: number): Generator<Token>;
    private readEscape;
    private readUnicode;
    private readHex;
}
