"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rules = void 0;
const no_conflict_set_directives_1 = __importDefault(require("../rules/no-conflict-set-directives"));
const no_deprecated_astro_canonicalurl_1 = __importDefault(require("../rules/no-deprecated-astro-canonicalurl"));
const no_deprecated_astro_fetchcontent_1 = __importDefault(require("../rules/no-deprecated-astro-fetchcontent"));
const no_deprecated_astro_resolve_1 = __importDefault(require("../rules/no-deprecated-astro-resolve"));
const no_set_html_directive_1 = __importDefault(require("../rules/no-set-html-directive"));
const no_set_text_directive_1 = __importDefault(require("../rules/no-set-text-directive"));
const no_unused_css_selector_1 = __importDefault(require("../rules/no-unused-css-selector"));
const no_unused_define_vars_in_style_1 = __importDefault(require("../rules/no-unused-define-vars-in-style"));
const prefer_class_list_directive_1 = __importDefault(require("../rules/prefer-class-list-directive"));
const prefer_object_class_list_1 = __importDefault(require("../rules/prefer-object-class-list"));
const prefer_split_class_list_1 = __importDefault(require("../rules/prefer-split-class-list"));
const semi_1 = __importDefault(require("../rules/semi"));
const valid_compile_1 = __importDefault(require("../rules/valid-compile"));
const a11y_1 = require("../a11y");
exports.rules = [
    no_conflict_set_directives_1.default,
    no_deprecated_astro_canonicalurl_1.default,
    no_deprecated_astro_fetchcontent_1.default,
    no_deprecated_astro_resolve_1.default,
    no_set_html_directive_1.default,
    no_set_text_directive_1.default,
    no_unused_css_selector_1.default,
    no_unused_define_vars_in_style_1.default,
    prefer_class_list_directive_1.default,
    prefer_object_class_list_1.default,
    prefer_split_class_list_1.default,
    semi_1.default,
    valid_compile_1.default,
    ...(0, a11y_1.buildA11yRules)(),
];
