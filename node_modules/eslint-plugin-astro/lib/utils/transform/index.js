"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStyleContentCSS = void 0;
const sourcemap_codec_1 = require("@jridgewell/sourcemap-codec");
const ast_utils_1 = require("../ast-utils");
const utils_1 = require("./utils");
const postcss_1 = require("./postcss");
const sass_1 = require("./sass");
const less_1 = require("./less");
const stylus_1 = require("./stylus");
const lines_and_columns_1 = require("./lines-and-columns");
const cache = new WeakMap();
function getStyleContentCSS(node, context) {
    const cachedResult = cache.get(node);
    if (cachedResult) {
        return cachedResult;
    }
    const langNode = (0, ast_utils_1.findAttribute)(node, "lang");
    const lang = langNode && (0, ast_utils_1.getStaticAttributeStringValue)(langNode);
    if (!langNode || lang === "css") {
        const inputRange = (0, utils_1.getContentRange)(node);
        return {
            css: context.getSourceCode().text.slice(...inputRange),
            remap: (i) => inputRange[0] + i,
        };
    }
    let transform = null;
    if (lang === "postcss") {
        transform = (0, postcss_1.transform)(node, context);
    }
    else if (lang === "scss" || lang === "sass") {
        transform = (0, sass_1.transform)(node, context, lang);
    }
    else if (lang === "less") {
        transform = (0, less_1.transform)(node, context);
    }
    else if (lang === "styl" || lang === "stylus") {
        transform = (0, stylus_1.transform)(node, context);
    }
    if (!transform) {
        return null;
    }
    const result = transformToStyleContentCSS(transform, context);
    cache.set(node, result);
    return result;
}
exports.getStyleContentCSS = getStyleContentCSS;
function transformToStyleContentCSS(transform, context) {
    let outputLocs = null;
    let inputLocs = null;
    let decoded = null;
    return {
        css: transform.output,
        remap: (index) => {
            outputLocs = outputLocs !== null && outputLocs !== void 0 ? outputLocs : new lines_and_columns_1.LinesAndColumns(transform.output);
            inputLocs =
                inputLocs !== null && inputLocs !== void 0 ? inputLocs : new lines_and_columns_1.LinesAndColumns(context.getSourceCode().text.slice(...transform.inputRange));
            const outputCodePos = outputLocs.getLocFromIndex(index);
            const inputCodePos = remapPosition(outputCodePos);
            return inputLocs.getIndexFromLoc(inputCodePos) + transform.inputRange[0];
        },
    };
    function remapPosition(pos) {
        decoded = decoded !== null && decoded !== void 0 ? decoded : (0, sourcemap_codec_1.decode)(transform.mappings);
        const lineMaps = decoded[pos.line - 1];
        if (!(lineMaps === null || lineMaps === void 0 ? void 0 : lineMaps.length)) {
            for (let line = pos.line - 1; line >= 0; line--) {
                const prevLineMaps = decoded[line];
                if (prevLineMaps === null || prevLineMaps === void 0 ? void 0 : prevLineMaps.length) {
                    const [, , sourceCodeLine, sourceCodeColumn] = prevLineMaps[prevLineMaps.length - 1];
                    return {
                        line: sourceCodeLine + 1,
                        column: sourceCodeColumn,
                    };
                }
            }
            return { line: -1, column: -1 };
        }
        for (let index = 0; index < lineMaps.length - 1; index++) {
            const [generateCodeColumn, , sourceCodeLine, sourceCodeColumn] = lineMaps[index];
            if (generateCodeColumn <= pos.column &&
                pos.column < lineMaps[index + 1][0]) {
                return {
                    line: sourceCodeLine + 1,
                    column: sourceCodeColumn + (pos.column - generateCodeColumn),
                };
            }
        }
        const [generateCodeColumn, , sourceCodeLine, sourceCodeColumn] = lineMaps[lineMaps.length - 1];
        return {
            line: sourceCodeLine + 1,
            column: sourceCodeColumn + (pos.column - generateCodeColumn),
        };
    }
}
