"use strict";
const has_typescript_eslint_parser_1 = require("./has-typescript-eslint-parser");
module.exports = {
    plugins: ["astro"],
    overrides: [
        {
            files: ["*.astro"],
            plugins: ["astro"],
            env: {
                node: true,
                "astro/astro": true,
                es2020: true,
            },
            parser: require.resolve("astro-eslint-parser"),
            parserOptions: {
                parser: has_typescript_eslint_parser_1.hasTypescriptEslintParser
                    ? "@typescript-eslint/parser"
                    : undefined,
                extraFileExtensions: [".astro"],
                sourceType: "module",
            },
            rules: {},
        },
        {
            files: ["**/*.astro/*.js", "*.astro/*.js"],
            env: {
                browser: true,
                es2020: true,
            },
            parserOptions: {
                sourceType: "module",
            },
            rules: {
                "prettier/prettier": "off",
            },
        },
    ],
};
