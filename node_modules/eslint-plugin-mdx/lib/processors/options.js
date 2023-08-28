"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processorOptions = void 0;
exports.processorOptions = {};
const linterPath = Object.keys(require.cache).find(path => /([/\\])eslint\1lib(?:\1linter){2}\.js$/.test(path));
if (!linterPath) {
    throw new Error('Could not find ESLint Linter in require cache');
}
const ESLinter = require(linterPath).Linter;
const { verify } = ESLinter.prototype;
ESLinter.prototype.verify = function (code, config, options) {
    const settings = ((config &&
        (typeof config.extractConfig === 'function'
            ? config.extractConfig(typeof options === 'undefined' || typeof options === 'string'
                ? options
                : options.filename)
            : config).settings) ||
        {});
    exports.processorOptions.lintCodeBlocks = settings['mdx/code-blocks'] === true;
    exports.processorOptions.languageMapper = settings['mdx/language-mapper'];
    return verify.call(this, code, config, options);
};
//# sourceMappingURL=options.js.map