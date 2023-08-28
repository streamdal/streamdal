"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.a11yConfigKeys = exports.a11yRuleKeys = void 0;
const load_1 = require("./load");
const plugin = (0, load_1.getPluginJsxA11y)();
exports.a11yRuleKeys = (plugin === null || plugin === void 0 ? void 0 : plugin.rules)
    ? Object.keys(plugin.rules).filter((s) => { var _a, _b, _c; return !((_c = (_b = (_a = plugin === null || plugin === void 0 ? void 0 : plugin.rules) === null || _a === void 0 ? void 0 : _a[s]) === null || _b === void 0 ? void 0 : _b.meta) === null || _c === void 0 ? void 0 : _c.deprecated); })
    : [
        "alt-text",
        "anchor-ambiguous-text",
        "anchor-has-content",
        "anchor-is-valid",
        "aria-activedescendant-has-tabindex",
        "aria-props",
        "aria-proptypes",
        "aria-role",
        "aria-unsupported-elements",
        "autocomplete-valid",
        "click-events-have-key-events",
        "control-has-associated-label",
        "heading-has-content",
        "html-has-lang",
        "iframe-has-title",
        "img-redundant-alt",
        "interactive-supports-focus",
        "label-has-associated-control",
        "lang",
        "media-has-caption",
        "mouse-events-have-key-events",
        "no-access-key",
        "no-aria-hidden-on-focusable",
        "no-autofocus",
        "no-distracting-elements",
        "no-interactive-element-to-noninteractive-role",
        "no-noninteractive-element-interactions",
        "no-noninteractive-element-to-interactive-role",
        "no-noninteractive-tabindex",
        "no-redundant-roles",
        "no-static-element-interactions",
        "prefer-tag-over-role",
        "role-has-required-aria-props",
        "role-supports-aria-props",
        "scope",
        "tabindex-no-positive",
    ];
exports.a11yConfigKeys = (plugin === null || plugin === void 0 ? void 0 : plugin.configs)
    ? Object.keys(plugin.configs)
    : ["recommended", "strict"];
