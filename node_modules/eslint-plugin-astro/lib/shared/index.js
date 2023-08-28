"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getShared = exports.terminateShared = exports.beginShared = exports.Shared = void 0;
const client_script_1 = require("./client-script");
class Shared {
    constructor() {
        this.clientScripts = [];
    }
    addClientScript(code, node, parsed) {
        const clientScript = new client_script_1.ClientScript(code, node, parsed);
        this.clientScripts.push(clientScript);
        return clientScript;
    }
}
exports.Shared = Shared;
const sharedMap = new Map();
function beginShared(filename) {
    const result = new Shared();
    sharedMap.set(filename, result);
    return result;
}
exports.beginShared = beginShared;
function terminateShared(filename) {
    const result = sharedMap.get(filename);
    sharedMap.delete(filename);
    return result !== null && result !== void 0 ? result : null;
}
exports.terminateShared = terminateShared;
function getShared(filename) {
    var _a;
    return (_a = sharedMap.get(filename)) !== null && _a !== void 0 ? _a : null;
}
exports.getShared = getShared;
