"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransformExtractOptions = exports.TransformMaskOptions = exports.TransformObfuscateOptions = exports.TransformReplaceValueOptions = exports.TransformDeleteFieldOptions = exports.TransformTruncateOptions = exports.TransformStep = exports.TransformTruncateType = exports.TransformType = void 0;
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
     * @generated from protobuf enum value: TRANSFORM_TYPE_TRUNCATE_VALUE = 5;
     */
    TransformType[TransformType["TRUNCATE_VALUE"] = 5] = "TRUNCATE_VALUE";
    /**
     * @generated from protobuf enum value: TRANSFORM_TYPE_EXTRACT = 6;
     */
    TransformType[TransformType["EXTRACT"] = 6] = "EXTRACT";
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
            { no: 101, name: "replace_value_options", kind: "message", oneof: "options", T: () => exports.TransformReplaceValueOptions },
            { no: 102, name: "delete_field_options", kind: "message", oneof: "options", T: () => exports.TransformDeleteFieldOptions },
            { no: 103, name: "obfuscate_options", kind: "message", oneof: "options", T: () => exports.TransformObfuscateOptions },
            { no: 104, name: "mask_options", kind: "message", oneof: "options", T: () => exports.TransformMaskOptions },
            { no: 105, name: "truncate_options", kind: "message", oneof: "options", T: () => exports.TransformTruncateOptions },
            { no: 106, name: "extract_options", kind: "message", oneof: "options", T: () => exports.TransformExtractOptions }
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
                case /* protos.steps.TransformReplaceValueOptions replace_value_options */ 101:
                    message.options = {
                        oneofKind: "replaceValueOptions",
                        replaceValueOptions: exports.TransformReplaceValueOptions.internalBinaryRead(reader, reader.uint32(), options, message.options.replaceValueOptions)
                    };
                    break;
                case /* protos.steps.TransformDeleteFieldOptions delete_field_options */ 102:
                    message.options = {
                        oneofKind: "deleteFieldOptions",
                        deleteFieldOptions: exports.TransformDeleteFieldOptions.internalBinaryRead(reader, reader.uint32(), options, message.options.deleteFieldOptions)
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
                case /* protos.steps.TransformExtractOptions extract_options */ 106:
                    message.options = {
                        oneofKind: "extractOptions",
                        extractOptions: exports.TransformExtractOptions.internalBinaryRead(reader, reader.uint32(), options, message.options.extractOptions)
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
        /* protos.steps.TransformReplaceValueOptions replace_value_options = 101; */
        if (message.options.oneofKind === "replaceValueOptions")
            exports.TransformReplaceValueOptions.internalBinaryWrite(message.options.replaceValueOptions, writer.tag(101, runtime_1.WireType.LengthDelimited).fork(), options).join();
        /* protos.steps.TransformDeleteFieldOptions delete_field_options = 102; */
        if (message.options.oneofKind === "deleteFieldOptions")
            exports.TransformDeleteFieldOptions.internalBinaryWrite(message.options.deleteFieldOptions, writer.tag(102, runtime_1.WireType.LengthDelimited).fork(), options).join();
        /* protos.steps.TransformObfuscateOptions obfuscate_options = 103; */
        if (message.options.oneofKind === "obfuscateOptions")
            exports.TransformObfuscateOptions.internalBinaryWrite(message.options.obfuscateOptions, writer.tag(103, runtime_1.WireType.LengthDelimited).fork(), options).join();
        /* protos.steps.TransformMaskOptions mask_options = 104; */
        if (message.options.oneofKind === "maskOptions")
            exports.TransformMaskOptions.internalBinaryWrite(message.options.maskOptions, writer.tag(104, runtime_1.WireType.LengthDelimited).fork(), options).join();
        /* protos.steps.TransformTruncateOptions truncate_options = 105; */
        if (message.options.oneofKind === "truncateOptions")
            exports.TransformTruncateOptions.internalBinaryWrite(message.options.truncateOptions, writer.tag(105, runtime_1.WireType.LengthDelimited).fork(), options).join();
        /* protos.steps.TransformExtractOptions extract_options = 106; */
        if (message.options.oneofKind === "extractOptions")
            exports.TransformExtractOptions.internalBinaryWrite(message.options.extractOptions, writer.tag(106, runtime_1.WireType.LengthDelimited).fork(), options).join();
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
            { no: 2, name: "path", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 3, name: "value", kind: "scalar", T: 5 /*ScalarType.INT32*/ }
        ]);
    }
    create(value) {
        const message = { type: 0, path: "", value: 0 };
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
                case /* string path */ 2:
                    message.path = reader.string();
                    break;
                case /* int32 value */ 3:
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
        /* string path = 2; */
        if (message.path !== "")
            writer.tag(2, runtime_1.WireType.LengthDelimited).string(message.path);
        /* int32 value = 3; */
        if (message.value !== 0)
            writer.tag(3, runtime_1.WireType.Varint).int32(message.value);
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
class TransformDeleteFieldOptions$Type extends runtime_5.MessageType {
    constructor() {
        super("protos.steps.TransformDeleteFieldOptions", [
            { no: 1, name: "paths", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value) {
        const message = { paths: [] };
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
                case /* repeated string paths */ 1:
                    message.paths.push(reader.string());
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
        /* repeated string paths = 1; */
        for (let i = 0; i < message.paths.length; i++)
            writer.tag(1, runtime_1.WireType.LengthDelimited).string(message.paths[i]);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.steps.TransformDeleteFieldOptions
 */
exports.TransformDeleteFieldOptions = new TransformDeleteFieldOptions$Type();
// @generated message type with reflection information, may provide speed optimized methods
class TransformReplaceValueOptions$Type extends runtime_5.MessageType {
    constructor() {
        super("protos.steps.TransformReplaceValueOptions", [
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
 * @generated MessageType for protobuf message protos.steps.TransformReplaceValueOptions
 */
exports.TransformReplaceValueOptions = new TransformReplaceValueOptions$Type();
// @generated message type with reflection information, may provide speed optimized methods
class TransformObfuscateOptions$Type extends runtime_5.MessageType {
    constructor() {
        super("protos.steps.TransformObfuscateOptions", [
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
 * @generated MessageType for protobuf message protos.steps.TransformObfuscateOptions
 */
exports.TransformObfuscateOptions = new TransformObfuscateOptions$Type();
// @generated message type with reflection information, may provide speed optimized methods
class TransformMaskOptions$Type extends runtime_5.MessageType {
    constructor() {
        super("protos.steps.TransformMaskOptions", [
            { no: 1, name: "path", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "mask", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value) {
        const message = { path: "", mask: "" };
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
                case /* string mask */ 2:
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
        /* string mask = 2; */
        if (message.mask !== "")
            writer.tag(2, runtime_1.WireType.LengthDelimited).string(message.mask);
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
// @generated message type with reflection information, may provide speed optimized methods
class TransformExtractOptions$Type extends runtime_5.MessageType {
    constructor() {
        super("protos.steps.TransformExtractOptions", [
            { no: 1, name: "paths", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "flatten", kind: "scalar", T: 8 /*ScalarType.BOOL*/ }
        ]);
    }
    create(value) {
        const message = { paths: [], flatten: false };
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
                case /* repeated string paths */ 1:
                    message.paths.push(reader.string());
                    break;
                case /* bool flatten */ 2:
                    message.flatten = reader.bool();
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
        /* repeated string paths = 1; */
        for (let i = 0; i < message.paths.length; i++)
            writer.tag(1, runtime_1.WireType.LengthDelimited).string(message.paths[i]);
        /* bool flatten = 2; */
        if (message.flatten !== false)
            writer.tag(2, runtime_1.WireType.Varint).bool(message.flatten);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.steps.TransformExtractOptions
 */
exports.TransformExtractOptions = new TransformExtractOptions$Type();
