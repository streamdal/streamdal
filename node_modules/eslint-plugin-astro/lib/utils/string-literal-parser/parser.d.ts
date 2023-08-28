import type { Token } from "./tokens";
export type StringLiteral = {
    tokens: Token[];
    value: string;
    range: [number, number];
};
export type EcmaVersion = 3 | 5 | 6 | 2015 | 7 | 2016 | 8 | 2017 | 9 | 2018 | 10 | 2019 | 11 | 2020 | 12 | 2021;
export declare function parseStringLiteral(source: string, option?: {
    start?: number;
    end?: number;
    ecmaVersion?: EcmaVersion;
}): StringLiteral;
export declare function parseStringTokens(source: string, option?: {
    start?: number;
    end?: number;
    ecmaVersion?: EcmaVersion;
}): Generator<Token>;
