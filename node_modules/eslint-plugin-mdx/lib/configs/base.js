"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.base = void 0;
exports.base = {
    parser: 'eslint-mdx',
    parserOptions: {
        sourceType: 'module',
        ecmaVersion: 'latest',
    },
    plugins: ['mdx'],
    processor: 'mdx/remark',
    rules: {
        'mdx/remark': 'warn',
        'no-unused-expressions': 'error',
    },
};
//# sourceMappingURL=base.js.map