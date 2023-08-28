"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transform = void 0;
const postcss_1 = __importDefault(require("postcss"));
const utils_1 = require("./utils");
function transform(node, context) {
    var _a, _b;
    const postcssLoadConfig = loadPostcssLoadConfig(context);
    if (!postcssLoadConfig) {
        return null;
    }
    const inputRange = (0, utils_1.getContentRange)(node);
    const code = context.getSourceCode().text.slice(...inputRange);
    const filename = `${context.getFilename()}.css`;
    try {
        const config = postcssLoadConfig.sync({
            cwd: (_b = (_a = context.getCwd) === null || _a === void 0 ? void 0 : _a.call(context)) !== null && _b !== void 0 ? _b : process.cwd(),
            from: filename,
        });
        const result = (0, postcss_1.default)(config.plugins).process(code, Object.assign(Object.assign({}, config.options), { map: {
                inline: false,
            } }));
        return {
            inputRange,
            output: result.content,
            mappings: result.map.toJSON().mappings,
        };
    }
    catch (_e) {
        return null;
    }
}
exports.transform = transform;
function loadPostcssLoadConfig(context) {
    return (0, utils_1.loadModule)(context, "postcss-load-config");
}
