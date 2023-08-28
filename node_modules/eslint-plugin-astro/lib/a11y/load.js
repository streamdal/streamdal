"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPluginJsxA11y = void 0;
const require_user_1 = require("../utils/resolve-parser/require-user");
let pluginJsxA11yCache = null;
let loaded = false;
function getPluginJsxA11y() {
    if (loaded) {
        return pluginJsxA11yCache;
    }
    if (!pluginJsxA11yCache) {
        pluginJsxA11yCache = (0, require_user_1.requireUserLocal)("eslint-plugin-jsx-a11y");
    }
    if (!pluginJsxA11yCache) {
        if (typeof require !== "undefined") {
            try {
                pluginJsxA11yCache = require("eslint-plugin-jsx-a11y");
            }
            catch (_a) {
                loaded = true;
            }
        }
    }
    return pluginJsxA11yCache || null;
}
exports.getPluginJsxA11y = getPluginJsxA11y;
