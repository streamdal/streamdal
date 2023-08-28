"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.performSyncWork = void 0;
const synckit_1 = require("synckit");
const workerPath = require.resolve('./worker');
exports.performSyncWork = (0, synckit_1.createSyncFn)(workerPath);
//# sourceMappingURL=sync.js.map