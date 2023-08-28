"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transform = void 0;
const utils_1 = require("./utils");
function transform(node, context) {
    const less = loadLess(context);
    if (!less) {
        return null;
    }
    const inputRange = (0, utils_1.getContentRange)(node);
    const code = context.getSourceCode().text.slice(...inputRange);
    const filename = `${context.getFilename()}.less`;
    try {
        let output;
        less.render(code, {
            sourceMap: {},
            syncImport: true,
            filename,
            lint: false,
        }, (_error, result) => {
            output = result;
        });
        if (!output) {
            return null;
        }
        return {
            inputRange,
            output: output.css,
            mappings: JSON.parse(output.map).mappings,
        };
    }
    catch (_e) {
        return null;
    }
}
exports.transform = transform;
function loadLess(context) {
    return (0, utils_1.loadModule)(context, "less");
}
