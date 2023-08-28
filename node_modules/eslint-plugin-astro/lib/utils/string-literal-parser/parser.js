"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseStringTokens = exports.parseStringLiteral = void 0;
const tokenizer_1 = require("./tokenizer");
function parseStringLiteral(source, option) {
    var _a, _b;
    const startIndex = (_a = option === null || option === void 0 ? void 0 : option.start) !== null && _a !== void 0 ? _a : 0;
    const cp = source.codePointAt(startIndex);
    const ecmaVersion = (_b = option === null || option === void 0 ? void 0 : option.ecmaVersion) !== null && _b !== void 0 ? _b : Infinity;
    const tokenizer = new tokenizer_1.Tokenizer(source, {
        start: startIndex + 1,
        end: option === null || option === void 0 ? void 0 : option.end,
        ecmaVersion: ecmaVersion >= 6 && ecmaVersion < 2015 ? ecmaVersion + 2009 : ecmaVersion,
    });
    const tokens = [...tokenizer.parseTokens(cp)];
    return {
        tokens,
        get value() {
            return tokens.map((t) => t.value).join("");
        },
        range: [startIndex, tokenizer.pos],
    };
}
exports.parseStringLiteral = parseStringLiteral;
function* parseStringTokens(source, option) {
    var _a, _b;
    const startIndex = (_a = option === null || option === void 0 ? void 0 : option.start) !== null && _a !== void 0 ? _a : 0;
    const ecmaVersion = (_b = option === null || option === void 0 ? void 0 : option.ecmaVersion) !== null && _b !== void 0 ? _b : Infinity;
    const tokenizer = new tokenizer_1.Tokenizer(source, {
        start: startIndex,
        end: option === null || option === void 0 ? void 0 : option.end,
        ecmaVersion: ecmaVersion >= 6 && ecmaVersion < 2015 ? ecmaVersion + 2009 : ecmaVersion,
    });
    yield* tokenizer.parseTokens();
}
exports.parseStringTokens = parseStringTokens;
