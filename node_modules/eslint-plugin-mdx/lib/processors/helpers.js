"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getShortLang = exports.DEFAULT_LANGUAGE_MAPPER = void 0;
const eslint_mdx_1 = require("eslint-mdx");
exports.DEFAULT_LANGUAGE_MAPPER = {
    javascript: 'js',
    javascriptreact: 'jsx',
    typescript: 'ts',
    typescriptreact: 'tsx',
    markdown: 'md',
    mdown: 'md',
    mkdn: 'md',
};
function getShortLang(filename, languageMapper) {
    const language = (0, eslint_mdx_1.last)(filename.split('.'));
    if (languageMapper === false) {
        return language;
    }
    languageMapper = Object.assign(Object.assign({}, exports.DEFAULT_LANGUAGE_MAPPER), languageMapper);
    const lang = language.toLowerCase();
    return languageMapper[language] || languageMapper[lang] || lang;
}
exports.getShortLang = getShortLang;
//# sourceMappingURL=helpers.js.map