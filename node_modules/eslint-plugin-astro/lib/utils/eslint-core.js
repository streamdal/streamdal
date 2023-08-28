"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCoreRule = exports.newProxy = exports.buildProxyListener = exports.getProxyNode = exports.defineWrapperListener = void 0;
const eslint_1 = require("eslint");
function defineWrapperListener(coreRule, context, proxyOptions) {
    var _a, _b;
    const listener = coreRule.create(context);
    const astroListener = (_b = (_a = proxyOptions.createListenerProxy) === null || _a === void 0 ? void 0 : _a.call(proxyOptions, listener)) !== null && _b !== void 0 ? _b : listener;
    return astroListener;
}
exports.defineWrapperListener = defineWrapperListener;
function getProxyNode(node, properties) {
    const cache = {};
    return new Proxy(node, {
        get(_t, key) {
            if (key in cache) {
                return cache[key];
            }
            if (key in properties) {
                return (cache[key] = properties[key]);
            }
            return node[key];
        },
    });
}
exports.getProxyNode = getProxyNode;
function buildProxyListener(base, convertNode) {
    const listeners = {};
    for (const [key, listener] of Object.entries(base)) {
        listeners[key] = function (...args) {
            ;
            listener.call(this, ...args.map((arg) => {
                if (typeof arg === "object" &&
                    "type" in arg &&
                    typeof arg.type === "string" &&
                    "range" in arg) {
                    return convertNode(arg);
                }
                return arg;
            }));
        };
    }
    return listeners;
}
exports.buildProxyListener = buildProxyListener;
function newProxy(target, ...propsArray) {
    const cache = {};
    const result = new Proxy({}, {
        get(_object, k) {
            const key = k;
            if (key in cache) {
                return cache[key];
            }
            for (const props of propsArray) {
                if (key in props) {
                    return (cache[key] = props[key]);
                }
            }
            return target[key];
        },
        has(_object, key) {
            return key in target;
        },
        ownKeys(_object) {
            return Reflect.ownKeys(target);
        },
        getPrototypeOf(_object) {
            return Reflect.getPrototypeOf(target);
        },
    });
    return result;
}
exports.newProxy = newProxy;
let ruleMap = null;
function getCoreRule(ruleName) {
    let map;
    if (ruleMap) {
        map = ruleMap;
    }
    else {
        ruleMap = map = new eslint_1.Linter().getRules();
    }
    return map.get(ruleName);
}
exports.getCoreRule = getCoreRule;
