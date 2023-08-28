"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.iterateCSSVars = void 0;
const tokenizer_1 = require("./tokenizer");
class CSSTokenScanner {
    constructor(text, options) {
        this.reconsuming = [];
        this.tokenizer = new tokenizer_1.CSSTokenizer(text, 0, options);
    }
    nextToken() {
        return this.reconsuming.shift() || this.tokenizer.nextToken();
    }
    reconsume(...tokens) {
        this.reconsuming.push(...tokens);
    }
}
function* iterateCSSVars(code, cssOptions) {
    const tokenizer = new CSSTokenScanner(code, cssOptions);
    let token;
    while ((token = tokenizer.nextToken())) {
        if (token.type === "Word" || token.value.startsWith("--")) {
            yield token.value;
        }
    }
}
exports.iterateCSSVars = iterateCSSVars;
