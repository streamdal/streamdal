"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransformMaskOptions = exports.TransformObfuscateOptions = exports.TransformReplaceValueStep = exports.TransformDeleteFieldStep = exports.TransformTruncateOptions = exports.TransformStep = exports.TransformTruncateType = exports.TransformType = void 0;
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
    /**
     * TODO: type for delete all keys except specified ones
     *
     * @generated from protobuf enum value: TRANSFORM_TYPE_TRUNCATE_VALUE = 5;
     */
    TransformType[TransformType["TRUNCATE_VALUE"] = 5] = "TRUNCATE_VALUE";
})(TransformType || (exports.TransformType = TransformType = {}));
/**
 * @generated from protobuf enum protos.steps.TransformTruncateType
 */
var TransformTruncateType;
(function (TransformTruncateType) {
    /**
     * @generated from protobuf enum value: TRANSFORM_TRUNCATE_TYPE_UNKNOWN = 0;
     */
    TransformTruncateType[TransformTruncateType["UNKNOWN"] = 0] = "UNKNOWN";
    /**
     * @generated from protobuf enum value: TRANSFORM_TRUNCATE_TYPE_LENGTH = 1;
     */
    TransformTruncateType[TransformTruncateType["LENGTH"] = 1] = "LENGTH";
    /**
     * @generated from protobuf enum value: TRANSFORM_TRUNCATE_TYPE_PERCENTAGE = 2;
     */
    TransformTruncateType[TransformTruncateType["PERCENTAGE"] = 2] = "PERCENTAGE";
})(TransformTruncateType || (exports.TransformTruncateType = TransformTruncateType = {}));
// @generated message type with reflection information, may provide speed optimized methods
class TransformStep$Type extends runtime_5.MessageType {
    constructor() {
        super("protos.steps.TransformStep", [
            { no: 1, name: "path", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "value", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 3, name: "type", kind: "enum", T: () => ["protos.steps.TransformType", TransformType, "TRANSFORM_TYPE_"] },
            { no: 101, name: "replace_value_options", kind: "message", oneof: "options", T: () => exports.TransformReplaceValueStep },
            { no: 102, name: "delete_field_options", kind: "message", oneof: "options", T: () => exports.TransformDeleteFieldStep },
            { no: 103, name: "obfuscate_options", kind: "message", oneof: "options", T: () => exports.TransformObfuscateOptions },
            { no: 104, name: "mask_options", kind: "message", oneof: "options", T: () => exports.TransformMaskOptions },
            { no: 105, name: "truncate_options", kind: "message", oneof: "options", T: () => exports.TransformTruncateOptions }
        ]);
    }
    create(value) {
        const message = { path: "", value: "", type: 0, options: { oneofKind: undefined } };
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
                case /* string path = 1 [deprecated = true];*/ 1:
                    message.path = reader.string();
                    break;
                case /* string value = 2 [deprecated = true];*/ 2:
                    message.value = reader.string();
                    break;
                case /* protos.steps.TransformType type */ 3:
                    message.type = reader.int32();
                    break;
                case /* protos.steps.TransformReplaceValueStep replace_value_options */ 101:
                    message.options = {
                        oneofKind: "replaceValueOptions",
                        replaceValueOptions: exports.TransformReplaceValueStep.internalBinaryRead(reader, reader.uint32(), options, message.options.replaceValueOptions)
                    };
                    break;
                case /* protos.steps.TransformDeleteFieldStep delete_field_options */ 102:
                    message.options = {
                        oneofKind: "deleteFieldOptions",
                        deleteFieldOptions: exports.TransformDeleteFieldStep.internalBinaryRead(reader, reader.uint32(), options, message.options.deleteFieldOptions)
                    };
                    break;
                case /* protos.steps.TransformObfuscateOptions obfuscate_options */ 103:
                    message.options = {
                        oneofKind: "obfuscateOptions",
                        obfuscateOptions: exports.TransformObfuscateOptions.internalBinaryRead(reader, reader.uint32(), options, message.options.obfuscateOptions)
                    };
                    break;
                case /* protos.steps.TransformMaskOptions mask_options */ 104:
                    message.options = {
                        oneofKind: "maskOptions",
                        maskOptions: exports.TransformMaskOptions.internalBinaryRead(reader, reader.uint32(), options, message.options.maskOptions)
                    };
                    break;
                case /* protos.steps.TransformTruncateOptions truncate_options */ 105:
                    message.options = {
                        oneofKind: "truncateOptions",
                        truncateOptions: exports.TransformTruncateOptions.internalBinaryRead(reader, reader.uint32(), options, message.options.truncateOptions)
                    };
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
        /* string path = 1 [deprecated = true]; */
        if (message.path !== "")
            writer.tag(1, runtime_1.WireType.LengthDelimited).string(message.path);
        /* string value = 2 [deprecated = true]; */
        if (message.value !== "")
            writer.tag(2, runtime_1.WireType.LengthDelimited).string(message.value);
        /* protos.steps.TransformType type = 3; */
        if (message.type !== 0)
            writer.tag(3, runtime_1.WireType.Varint).int32(message.type);
        /* protos.steps.TransformReplaceValueStep replace_value_options = 101; */
        if (message.options.oneofKind === "replaceValueOptions")
            exports.TransformReplaceValueStep.internalBinaryWrite(message.options.replaceValueOptions, writer.tag(101, runtime_1.WireType.LengthDelimited).fork(), options).join();
        /* protos.steps.TransformDeleteFieldStep delete_field_options = 102; */
        if (message.options.oneofKind === "deleteFieldOptions")
            exports.TransformDeleteFieldStep.internalBinaryWrite(message.options.deleteFieldOptions, writer.tag(102, runtime_1.WireType.LengthDelimited).fork(), options).join();
        /* protos.steps.TransformObfuscateOptions obfuscate_options = 103; */
        if (message.options.oneofKind === "obfuscateOptions")
            exports.TransformObfuscateOptions.internalBinaryWrite(message.options.obfuscateOptions, writer.tag(103, runtime_1.WireType.LengthDelimited).fork(), options).join();
        /* protos.steps.TransformMaskOptions mask_options = 104; */
        if (message.options.oneofKind === "maskOptions")
            exports.TransformMaskOptions.internalBinaryWrite(message.options.maskOptions, writer.tag(104, runtime_1.WireType.LengthDelimited).fork(), options).join();
        /* protos.steps.TransformTruncateOptions truncate_options = 105; */
        if (message.options.oneofKind === "truncateOptions")
            exports.TransformTruncateOptions.internalBinaryWrite(message.options.truncateOptions, writer.tag(105, runtime_1.WireType.LengthDelimited).fork(), options).join();
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
// @generated message type with reflection information, may provide speed optimized methods
class TransformTruncateOptions$Type extends runtime_5.MessageType {
    constructor() {
        super("protos.steps.TransformTruncateOptions", [
            { no: 1, name: "type", kind: "enum", T: () => ["protos.steps.TransformTruncateType", TransformTruncateType, "TRANSFORM_TRUNCATE_TYPE_"] },
            { no: 2, name: "value", kind: "scalar", T: 5 /*ScalarType.INT32*/ }
        ]);
    }
    create(value) {
        const message = { type: 0, value: 0 };
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
                case /* protos.steps.TransformTruncateType type */ 1:
                    message.type = reader.int32();
                    break;
                case /* int32 value */ 2:
                    message.value = reader.int32();
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
        /* protos.steps.TransformTruncateType type = 1; */
        if (message.type !== 0)
            writer.tag(1, runtime_1.WireType.Varint).int32(message.type);
        /* int32 value = 2; */
        if (message.value !== 0)
            writer.tag(2, runtime_1.WireType.Varint).int32(message.value);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.steps.TransformTruncateOptions
 */
exports.TransformTruncateOptions = new TransformTruncateOptions$Type();
// @generated message type with reflection information, may provide speed optimized methods
class TransformDeleteFieldStep$Type extends runtime_5.MessageType {
    constructor() {
        super("protos.steps.TransformDeleteFieldStep", [
            { no: 1, name: "path", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value) {
        const message = { path: "" };
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
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.steps.TransformDeleteFieldStep
 */
exports.TransformDeleteFieldStep = new TransformDeleteFieldStep$Type();
// @generated message type with reflection information, may provide speed optimized methods
class TransformReplaceValueStep$Type extends runtime_5.MessageType {
    constructor() {
        super("protos.steps.TransformReplaceValueStep", [
            { no: 1, name: "path", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "value", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value) {
        const message = { path: "", value: "" };
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
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.steps.TransformReplaceValueStep
 */
exports.TransformReplaceValueStep = new TransformReplaceValueStep$Type();
// @generated message type with reflection information, may provide speed optimized methods
class TransformObfuscateOptions$Type extends runtime_5.MessageType {
    constructor() {
        super("protos.steps.TransformObfuscateOptions", [
            { no: 1, name: "path", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "value", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value) {
        const message = { path: "", value: "" };
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
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.steps.TransformObfuscateOptions
 */
exports.TransformObfuscateOptions = new TransformObfuscateOptions$Type();
// @generated message type with reflection information, may provide speed optimized methods
class TransformMaskOptions$Type extends runtime_5.MessageType {
    constructor() {
        super("protos.steps.TransformMaskOptions", [
            { no: 1, name: "path", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "value", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 3, name: "mask", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value) {
        const message = { path: "", value: "", mask: "" };
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
                case /* string mask */ 3:
                    message.mask = reader.string();
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
        /* string mask = 3; */
        if (message.mask !== "")
            writer.tag(3, runtime_1.WireType.LengthDelimited).string(message.mask);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.steps.TransformMaskOptions
 */
exports.TransformMaskOptions = new TransformMaskOptions$Type();
