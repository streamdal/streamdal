"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CSSTokenizer = void 0;
const EOF = -1;
const NULL = 0x00;
const TABULATION = 0x09;
const CARRIAGE_RETURN = 0x0d;
const LINE_FEED = 0x0a;
const FORM_FEED = 0x0c;
const SPACE = 0x20;
const QUOTATION_MARK = 0x22;
const APOSTROPHE = 0x27;
const LEFT_PARENTHESIS = 0x28;
const RIGHT_PARENTHESIS = 0x29;
const ASTERISK = 0x2a;
const COMMA = 0x2c;
const SOLIDUS = 0x2f;
const COLON = 0x3a;
const SEMICOLON = 0x3b;
const LEFT_SQUARE_BRACKET = 0x5b;
const REVERSE_SOLIDUS = 0x5c;
const RIGHT_SQUARE_BRACKET = 0x5d;
const LEFT_CURLY_BRACKET = 0x7b;
const RIGHT_CURLY_BRACKET = 0x7d;
function isWhitespace(cp) {
    return (cp === TABULATION ||
        cp === LINE_FEED ||
        cp === FORM_FEED ||
        cp === CARRIAGE_RETURN ||
        cp === SPACE);
}
class CSSTokenizer {
    constructor(text, startOffset, options) {
        var _a;
        this.text = text;
        this.options = {
            inlineComment: (_a = options === null || options === void 0 ? void 0 : options.inlineComment) !== null && _a !== void 0 ? _a : false,
        };
        this.cp = NULL;
        this.offset = startOffset - 1;
        this.nextOffset = startOffset;
        this.reconsuming = false;
    }
    nextToken() {
        let cp;
        if (this.reconsuming) {
            cp = this.cp;
            this.reconsuming = false;
        }
        else {
            cp = this.consumeNextCodePoint();
        }
        while (isWhitespace(cp)) {
            cp = this.consumeNextCodePoint();
        }
        if (cp === EOF) {
            return null;
        }
        const start = this.offset;
        return this.consumeNextToken(cp, start);
    }
    nextCodePoint() {
        if (this.nextOffset >= this.text.length) {
            return EOF;
        }
        return this.text.codePointAt(this.nextOffset);
    }
    consumeNextCodePoint() {
        if (this.offset >= this.text.length) {
            this.cp = EOF;
            return EOF;
        }
        this.offset = this.nextOffset;
        if (this.offset >= this.text.length) {
            this.cp = EOF;
            return EOF;
        }
        let cp = this.text.codePointAt(this.offset);
        if (cp === CARRIAGE_RETURN) {
            this.nextOffset = this.offset + 1;
            if (this.text.codePointAt(this.nextOffset) === LINE_FEED) {
                this.nextOffset++;
            }
            cp = LINE_FEED;
        }
        else {
            this.nextOffset = this.offset + (cp >= 0x10000 ? 2 : 1);
        }
        this.cp = cp;
        return cp;
    }
    consumeNextToken(cp, start) {
        if (cp === SOLIDUS) {
            const nextCp = this.nextCodePoint();
            if (nextCp === ASTERISK) {
                return this.consumeComment(start);
            }
            if (nextCp === SOLIDUS && this.options.inlineComment) {
                return this.consumeInlineComment(start);
            }
        }
        if (isQuote(cp)) {
            return this.consumeString(start, cp);
        }
        if (isPunctuator(cp)) {
            return {
                type: "Punctuator",
                range: [start, start + 1],
                value: String.fromCodePoint(cp),
            };
        }
        return this.consumeWord(start);
    }
    consumeWord(start) {
        let cp = this.consumeNextCodePoint();
        while (!isWhitespace(cp) && !isPunctuator(cp) && !isQuote(cp)) {
            cp = this.consumeNextCodePoint();
        }
        this.reconsuming = true;
        const range = [start, this.offset];
        const text = this.text;
        let value;
        return {
            type: "Word",
            range,
            get value() {
                return value !== null && value !== void 0 ? value : (value = text.slice(...range));
            },
        };
    }
    consumeString(start, quote) {
        let valueEndOffset = null;
        let cp = this.consumeNextCodePoint();
        while (cp !== EOF) {
            if (cp === quote) {
                valueEndOffset = this.offset;
                break;
            }
            if (cp === REVERSE_SOLIDUS) {
                this.consumeNextCodePoint();
            }
            cp = this.consumeNextCodePoint();
        }
        const text = this.text;
        let value;
        const valueRange = [
            start + 1,
            valueEndOffset !== null && valueEndOffset !== void 0 ? valueEndOffset : this.nextOffset,
        ];
        return {
            type: "Quoted",
            range: [start, this.nextOffset],
            valueRange,
            get value() {
                return value !== null && value !== void 0 ? value : (value = text.slice(...valueRange));
            },
            quote: String.fromCodePoint(quote),
        };
    }
    consumeComment(start) {
        this.consumeNextCodePoint();
        let valueEndOffset = null;
        let cp = this.consumeNextCodePoint();
        while (cp !== EOF) {
            if (cp === ASTERISK) {
                cp = this.consumeNextCodePoint();
                if (cp === SOLIDUS) {
                    valueEndOffset = this.offset - 1;
                    break;
                }
            }
            cp = this.consumeNextCodePoint();
        }
        const valueRange = [
            start + 2,
            valueEndOffset !== null && valueEndOffset !== void 0 ? valueEndOffset : this.nextOffset,
        ];
        const text = this.text;
        let value;
        return {
            type: "Block",
            range: [start, this.nextOffset],
            valueRange,
            get value() {
                return value !== null && value !== void 0 ? value : (value = text.slice(...valueRange));
            },
        };
    }
    consumeInlineComment(start) {
        this.consumeNextCodePoint();
        let valueEndOffset = null;
        let cp = this.consumeNextCodePoint();
        while (cp !== EOF) {
            if (cp === LINE_FEED) {
                valueEndOffset = this.offset - 1;
                break;
            }
            cp = this.consumeNextCodePoint();
        }
        const valueRange = [
            start + 2,
            valueEndOffset !== null && valueEndOffset !== void 0 ? valueEndOffset : this.nextOffset,
        ];
        const text = this.text;
        let value;
        return {
            type: "Line",
            range: [start, this.nextOffset],
            valueRange,
            get value() {
                return value !== null && value !== void 0 ? value : (value = text.slice(...valueRange));
            },
        };
    }
}
exports.CSSTokenizer = CSSTokenizer;
function isPunctuator(cp) {
    return (cp === COLON ||
        cp === SEMICOLON ||
        cp === COMMA ||
        cp === LEFT_PARENTHESIS ||
        cp === RIGHT_PARENTHESIS ||
        cp === LEFT_CURLY_BRACKET ||
        cp === RIGHT_CURLY_BRACKET ||
        cp === LEFT_SQUARE_BRACKET ||
        cp === RIGHT_SQUARE_BRACKET ||
        cp === SOLIDUS ||
        cp === ASTERISK);
}
function isQuote(cp) {
    return cp === APOSTROPHE || cp === QUOTATION_MARK;
}
