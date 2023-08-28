"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transform = void 0;
const utils_1 = require("./utils");
function transform(node, context, type) {
    const sass = loadSass(context);
    if (!sass) {
        return null;
    }
    const inputRange = (0, utils_1.getContentRange)(node);
    const code = context.getSourceCode().text.slice(...inputRange);
    try {
        const output = sass.compileString(code, {
            sourceMap: true,
            syntax: type === "sass" ? "indented" : undefined,
        });
        if (!output) {
            return null;
        }
        return {
            inputRange,
            output: output.css,
            mappings: output.sourceMap.mappings,
        };
    }
    catch (_e) {
        return null;
    }
}
exports.transform = transform;
function loadSass(context) {
    return (0, utils_1.loadModule)(context, "sass");
}
