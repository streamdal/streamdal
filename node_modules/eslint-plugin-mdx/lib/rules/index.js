"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rules = exports.remark = void 0;
const tslib_1 = require("tslib");
const remark_1 = require("./remark");
Object.defineProperty(exports, "remark", { enumerable: true, get: function () { return remark_1.remark; } });
tslib_1.__exportStar(require("./types"), exports);
exports.rules = { remark: remark_1.remark };
//# sourceMappingURL=index.js.map