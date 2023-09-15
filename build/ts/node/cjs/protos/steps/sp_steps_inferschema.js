"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InferSchemaStep = void 0;
const runtime_1 = require("@protobuf-ts/runtime");
const runtime_2 = require("@protobuf-ts/runtime");
const runtime_3 = require("@protobuf-ts/runtime");
const runtime_4 = require("@protobuf-ts/runtime");
const runtime_5 = require("@protobuf-ts/runtime");
// @generated message type with reflection information, may provide speed optimized methods
class InferSchemaStep$Type extends runtime_5.MessageType {
    constructor() {
        super("protos.steps.InferSchemaStep", [
            { no: 1, name: "payload", kind: "scalar", T: 12 /*ScalarType.BYTES*/ },
            { no: 2, name: "current_schema", kind: "scalar", T: 12 /*ScalarType.BYTES*/ }
        ]);
    }
    create(value) {
        const message = { payload: new Uint8Array(0), currentSchema: new Uint8Array(0) };
        globalThis.Object.defineProperty(message, runtime_4.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            (0, runtime_3.reflectionMergePartial)(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target !== null && target !== void 0 ? target : this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* bytes payload */ 1:
                    message.payload = reader.bytes();
                    break;
                case /* bytes current_schema */ 2:
                    message.currentSchema = reader.bytes();
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? runtime_2.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message, writer, options) {
        /* bytes payload = 1; */
        if (message.payload.length)
            writer.tag(1, runtime_1.WireType.LengthDelimited).bytes(message.payload);
        /* bytes current_schema = 2; */
        if (message.currentSchema.length)
            writer.tag(2, runtime_1.WireType.LengthDelimited).bytes(message.currentSchema);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.steps.InferSchemaStep
 */
exports.InferSchemaStep = new InferSchemaStep$Type();
