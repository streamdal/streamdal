"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidJSONStep = void 0;
const runtime_1 = require("@protobuf-ts/runtime");
const runtime_2 = require("@protobuf-ts/runtime");
const runtime_3 = require("@protobuf-ts/runtime");
const runtime_4 = require("@protobuf-ts/runtime");
// @generated message type with reflection information, may provide speed optimized methods
class ValidJSONStep$Type extends runtime_4.MessageType {
    constructor() {
        super("protos.steps.ValidJSONStep", []);
    }
    create(value) {
        const message = {};
        globalThis.Object.defineProperty(message, runtime_3.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            (0, runtime_2.reflectionMergePartial)(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        return target !== null && target !== void 0 ? target : this.create();
    }
    internalBinaryWrite(message, writer, options) {
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_1.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.steps.ValidJSONStep
 */
exports.ValidJSONStep = new ValidJSONStep$Type();
