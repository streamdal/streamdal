"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transform = void 0;
const utils_1 = require("./utils");
function transform(node, context) {
    const stylus = loadStylus(context);
    if (!stylus) {
        return null;
    }
    const inputRange = (0, utils_1.getContentRange)(node);
    const code = context.getSourceCode().text.slice(...inputRange);
    const filename = `${context.getFilename()}.stylus`;
    try {
        let output;
        const style = stylus(code, {
            filename,
        }).set("sourcemap", {});
        style.render((_error, code) => {
            output = code;
        });
        if (output == null) {
            return null;
        }
        return {
            inputRange,
            output,
            mappings: style.sourcemap
                .mappings,
        };
    }
    catch (_e) {
        return null;
    }
}
exports.transform = transform;
function loadStylus(context) {
    return (0, utils_1.loadModule)(context, "stylus");
}
