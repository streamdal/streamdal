"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGlobals = void 0;
const getGlobals = (sources, initialGlobals = {}) => (Array.isArray(sources)
    ?
        sources
    : Object.keys(sources)).reduce((globals, source) => Object.assign(globals, {
    [source]: false,
}), initialGlobals);
exports.getGlobals = getGlobals;
//# sourceMappingURL=helpers.js.map