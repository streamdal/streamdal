"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransformStep = exports.TransformType = void 0;
const runtime_1 = require("@protobuf-ts/runtime");
const runtime_2 = require("@protobuf-ts/runtime");
const runtime_3 = require("@protobuf-ts/runtime");
const runtime_4 = require("@protobuf-ts/runtime");
const runtime_5 = require("@protobuf-ts/runtime");
/**
 * @generated from protobuf enum protos.steps.TransformType
 */
var TransformType;
(function (TransformType) {
    /**
     * @generated from protobuf enum value: TRANSFORM_TYPE_UNKNOWN = 0;
     */
    TransformType[TransformType["UNKNOWN"] = 0] = "UNKNOWN";
    /**
     * @generated from protobuf enum value: TRANSFORM_TYPE_REPLACE_VALUE = 1;
     */
    TransformType[TransformType["REPLACE_VALUE"] = 1] = "REPLACE_VALUE";
    /**
     * @generated from protobuf enum value: TRANSFORM_TYPE_DELETE_FIELD = 2;
     */
    TransformType[TransformType["DELETE_FIELD"] = 2] = "DELETE_FIELD";
    /**
     * @generated from protobuf enum value: TRANSFORM_TYPE_OBFUSCATE_VALUE = 3;
     */
    TransformType[TransformType["OBFUSCATE_VALUE"] = 3] = "OBFUSCATE_VALUE";
    /**
     * @generated from protobuf enum value: TRANSFORM_TYPE_MASK_VALUE = 4;
     */
    TransformType[TransformType["MASK_VALUE"] = 4] = "MASK_VALUE";
})(TransformType || (exports.TransformType = TransformType = {}));
// @generated message type with reflection information, may provide speed optimized methods
class TransformStep$Type extends runtime_5.MessageType {
    constructor() {
        super("protos.steps.TransformStep", [
            { no: 1, name: "path", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "value", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 3, name: "type", kind: "enum", T: () => ["protos.steps.TransformType", TransformType, "TRANSFORM_TYPE_"] }
        ]);
    }
    create(value) {
        const message = { path: "", value: "", type: 0 };
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
                case /* string path */ 1:
                    message.path = reader.string();
                    break;
                case /* string value */ 2:
                    message.value = reader.string();
                    break;
                case /* protos.steps.TransformType type */ 3:
                    message.type = reader.int32();
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
        /* string path = 1; */
        if (message.path !== "")
            writer.tag(1, runtime_1.WireType.LengthDelimited).string(message.path);
        /* string value = 2; */
        if (message.value !== "")
            writer.tag(2, runtime_1.WireType.LengthDelimited).string(message.value);
        /* protos.steps.TransformType type = 3; */
        if (message.type !== 0)
            writer.tag(3, runtime_1.WireType.Varint).int32(message.type);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.steps.TransformStep
 */
exports.TransformStep = new TransformStep$Type();
