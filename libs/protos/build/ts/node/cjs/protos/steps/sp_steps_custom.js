"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomStep = void 0;
const runtime_1 = require("@protobuf-ts/runtime");
const runtime_2 = require("@protobuf-ts/runtime");
const runtime_3 = require("@protobuf-ts/runtime");
const runtime_4 = require("@protobuf-ts/runtime");
const runtime_5 = require("@protobuf-ts/runtime");
// @generated message type with reflection information, may provide speed optimized methods
class CustomStep$Type extends runtime_5.MessageType {
    constructor() {
        super("protos.steps.CustomStep", [
            { no: 1, name: "args", kind: "map", K: 9 /*ScalarType.STRING*/, V: { kind: "scalar", T: 12 /*ScalarType.BYTES*/ } }
        ]);
    }
    create(value) {
        const message = { args: {} };
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
                case /* map<string, bytes> args */ 1:
                    this.binaryReadMap1(message.args, reader, options);
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
    binaryReadMap1(map, reader, options) {
        let len = reader.uint32(), end = reader.pos + len, key, val;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case 1:
                    key = reader.string();
                    break;
                case 2:
                    val = reader.bytes();
                    break;
                default: throw new globalThis.Error("unknown map entry field for field protos.steps.CustomStep.args");
            }
        }
        map[key !== null && key !== void 0 ? key : ""] = val !== null && val !== void 0 ? val : new Uint8Array(0);
    }
    internalBinaryWrite(message, writer, options) {
        /* map<string, bytes> args = 1; */
        for (let k of Object.keys(message.args))
            writer.tag(1, runtime_1.WireType.LengthDelimited).fork().tag(1, runtime_1.WireType.LengthDelimited).string(k).tag(2, runtime_1.WireType.LengthDelimited).bytes(message.args[k]).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.steps.CustomStep
 */
exports.CustomStep = new CustomStep$Type();
