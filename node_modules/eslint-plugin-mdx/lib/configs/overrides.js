"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.overrides = void 0;
const eslint_mdx_1 = require("eslint-mdx");
const base_1 = require("./base");
let isReactPluginAvailable = false;
try {
    require.resolve('eslint-plugin-react');
    isReactPluginAvailable = true;
}
catch (_a) { }
exports.overrides = Object.assign(Object.assign({}, base_1.base), { globals: {
        React: false,
    }, plugins: (0, eslint_mdx_1.arrayify)(base_1.base.plugins, isReactPluginAvailable ? 'react' : null), rules: {
        'react/jsx-no-undef': isReactPluginAvailable
            ? [
                2,
                {
                    allowGlobals: true,
                },
            ]
            : 0,
        'react/react-in-jsx-scope': 0,
    } });
//# sourceMappingURL=overrides.js.map