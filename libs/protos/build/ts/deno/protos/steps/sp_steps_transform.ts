// @generated by protobuf-ts 2.9.0 with parameter long_type_string
// @generated from protobuf file "steps/sp_steps_transform.proto" (package "protos.steps", syntax proto3)
// tslint:disable
import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import { WireType } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import { UnknownFieldHandler } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { reflectionMergePartial } from "@protobuf-ts/runtime";
import { MESSAGE_TYPE } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
/**
 * @generated from protobuf message protos.steps.TransformStep
 */
export interface TransformStep {
    /**
     * @deprecated
     * @generated from protobuf field: string path = 1 [deprecated = true];
     */
    path: string;
    /**
     * @deprecated
     * @generated from protobuf field: string value = 2 [deprecated = true];
     */
    value: string; // Should this be bytes? ~DS
    /**
     * @generated from protobuf field: protos.steps.TransformType type = 3;
     */
    type: TransformType;
    /**
     * @generated from protobuf oneof: options
     */
    options: {
        oneofKind: "replaceValueOptions";
        /**
         * Replace the value of a field with a new value
         *
         * @generated from protobuf field: protos.steps.TransformReplaceValueOptions replace_value_options = 101;
         */
        replaceValueOptions: TransformReplaceValueOptions;
    } | {
        oneofKind: "deleteFieldOptions";
        /**
         * Delete a field from a JSON payload
         *
         * @generated from protobuf field: protos.steps.TransformDeleteFieldOptions delete_field_options = 102;
         */
        deleteFieldOptions: TransformDeleteFieldOptions;
    } | {
        oneofKind: "obfuscateOptions";
        /**
         * Obfuscate hashes the value of a field with sha256
         *
         * @generated from protobuf field: protos.steps.TransformObfuscateOptions obfuscate_options = 103;
         */
        obfuscateOptions: TransformObfuscateOptions;
    } | {
        oneofKind: "maskOptions";
        /**
         * Mask part of a field's value with the given character
         *
         * @generated from protobuf field: protos.steps.TransformMaskOptions mask_options = 104;
         */
        maskOptions: TransformMaskOptions;
    } | {
        oneofKind: "truncateOptions";
        /**
         * Truncate the value of a field to a maximum number of characters,
         * or to a percentage of characters based on the field length
         *
         * @generated from protobuf field: protos.steps.TransformTruncateOptions truncate_options = 105;
         */
        truncateOptions: TransformTruncateOptions;
    } | {
        oneofKind: "extractOptions";
        /**
         * Extract one or multiple values from a payload
         *
         * @generated from protobuf field: protos.steps.TransformExtractOptions extract_options = 106;
         */
        extractOptions: TransformExtractOptions;
    } | {
        oneofKind: undefined;
    };
}
/**
 * @generated from protobuf message protos.steps.TransformTruncateOptions
 */
export interface TransformTruncateOptions {
    /**
     * @generated from protobuf field: protos.steps.TransformTruncateType type = 1;
     */
    type: TransformTruncateType;
    /**
     * @generated from protobuf field: string path = 2;
     */
    path: string;
    /**
     * Truncate after this many bytes or this percentage of the original value
     *
     * @generated from protobuf field: int32 value = 3;
     */
    value: number;
}
/**
 * @generated from protobuf message protos.steps.TransformDeleteFieldOptions
 */
export interface TransformDeleteFieldOptions {
    /**
     * @generated from protobuf field: repeated string paths = 1;
     */
    paths: string[];
}
/**
 * @generated from protobuf message protos.steps.TransformReplaceValueOptions
 */
export interface TransformReplaceValueOptions {
    /**
     * @generated from protobuf field: string path = 1;
     */
    path: string;
    /**
     * @generated from protobuf field: string value = 2;
     */
    value: string;
}
/**
 * @generated from protobuf message protos.steps.TransformObfuscateOptions
 */
export interface TransformObfuscateOptions {
    /**
     * @generated from protobuf field: string path = 1;
     */
    path: string;
}
/**
 * @generated from protobuf message protos.steps.TransformMaskOptions
 */
export interface TransformMaskOptions {
    /**
     * @generated from protobuf field: string path = 1;
     */
    path: string;
    /**
     * @generated from protobuf field: string mask = 2;
     */
    mask: string;
}
/**
 * @generated from protobuf message protos.steps.TransformExtractOptions
 */
export interface TransformExtractOptions {
    /**
     * @generated from protobuf field: repeated string paths = 1;
     */
    paths: string[];
    /**
     * @generated from protobuf field: bool flatten = 2;
     */
    flatten: boolean;
}
/**
 * @generated from protobuf enum protos.steps.TransformType
 */
export enum TransformType {
    /**
     * @generated from protobuf enum value: TRANSFORM_TYPE_UNKNOWN = 0;
     */
    UNKNOWN = 0,
    /**
     * @generated from protobuf enum value: TRANSFORM_TYPE_REPLACE_VALUE = 1;
     */
    REPLACE_VALUE = 1,
    /**
     * @generated from protobuf enum value: TRANSFORM_TYPE_DELETE_FIELD = 2;
     */
    DELETE_FIELD = 2,
    /**
     * @generated from protobuf enum value: TRANSFORM_TYPE_OBFUSCATE_VALUE = 3;
     */
    OBFUSCATE_VALUE = 3,
    /**
     * @generated from protobuf enum value: TRANSFORM_TYPE_MASK_VALUE = 4;
     */
    MASK_VALUE = 4,
    /**
     * @generated from protobuf enum value: TRANSFORM_TYPE_TRUNCATE_VALUE = 5;
     */
    TRUNCATE_VALUE = 5,
    /**
     * @generated from protobuf enum value: TRANSFORM_TYPE_EXTRACT = 6;
     */
    EXTRACT = 6
}
/**
 * @generated from protobuf enum protos.steps.TransformTruncateType
 */
export enum TransformTruncateType {
    /**
     * @generated from protobuf enum value: TRANSFORM_TRUNCATE_TYPE_UNKNOWN = 0;
     */
    UNKNOWN = 0,
    /**
     * @generated from protobuf enum value: TRANSFORM_TRUNCATE_TYPE_LENGTH = 1;
     */
    LENGTH = 1,
    /**
     * @generated from protobuf enum value: TRANSFORM_TRUNCATE_TYPE_PERCENTAGE = 2;
     */
    PERCENTAGE = 2
}
// @generated message type with reflection information, may provide speed optimized methods
class TransformStep$Type extends MessageType<TransformStep> {
    constructor() {
        super("protos.steps.TransformStep", [
            { no: 1, name: "path", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "value", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 3, name: "type", kind: "enum", T: () => ["protos.steps.TransformType", TransformType, "TRANSFORM_TYPE_"] },
            { no: 101, name: "replace_value_options", kind: "message", oneof: "options", T: () => TransformReplaceValueOptions },
            { no: 102, name: "delete_field_options", kind: "message", oneof: "options", T: () => TransformDeleteFieldOptions },
            { no: 103, name: "obfuscate_options", kind: "message", oneof: "options", T: () => TransformObfuscateOptions },
            { no: 104, name: "mask_options", kind: "message", oneof: "options", T: () => TransformMaskOptions },
            { no: 105, name: "truncate_options", kind: "message", oneof: "options", T: () => TransformTruncateOptions },
            { no: 106, name: "extract_options", kind: "message", oneof: "options", T: () => TransformExtractOptions }
        ]);
    }
    create(value?: PartialMessage<TransformStep>): TransformStep {
        const message = { path: "", value: "", type: 0, options: { oneofKind: undefined } };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<TransformStep>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: TransformStep): TransformStep {
        let message = target ?? this.create(), end = reader.pos + length;
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
                        replaceValueOptions: TransformReplaceValueOptions.internalBinaryRead(reader, reader.uint32(), options, (message.options as any).replaceValueOptions)
                    };
                    break;
                case /* protos.steps.TransformDeleteFieldOptions delete_field_options */ 102:
                    message.options = {
                        oneofKind: "deleteFieldOptions",
                        deleteFieldOptions: TransformDeleteFieldOptions.internalBinaryRead(reader, reader.uint32(), options, (message.options as any).deleteFieldOptions)
                    };
                    break;
                case /* protos.steps.TransformObfuscateOptions obfuscate_options */ 103:
                    message.options = {
                        oneofKind: "obfuscateOptions",
                        obfuscateOptions: TransformObfuscateOptions.internalBinaryRead(reader, reader.uint32(), options, (message.options as any).obfuscateOptions)
                    };
                    break;
                case /* protos.steps.TransformMaskOptions mask_options */ 104:
                    message.options = {
                        oneofKind: "maskOptions",
                        maskOptions: TransformMaskOptions.internalBinaryRead(reader, reader.uint32(), options, (message.options as any).maskOptions)
                    };
                    break;
                case /* protos.steps.TransformTruncateOptions truncate_options */ 105:
                    message.options = {
                        oneofKind: "truncateOptions",
                        truncateOptions: TransformTruncateOptions.internalBinaryRead(reader, reader.uint32(), options, (message.options as any).truncateOptions)
                    };
                    break;
                case /* protos.steps.TransformExtractOptions extract_options */ 106:
                    message.options = {
                        oneofKind: "extractOptions",
                        extractOptions: TransformExtractOptions.internalBinaryRead(reader, reader.uint32(), options, (message.options as any).extractOptions)
                    };
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: TransformStep, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* string path = 1 [deprecated = true]; */
        if (message.path !== "")
            writer.tag(1, WireType.LengthDelimited).string(message.path);
        /* string value = 2 [deprecated = true]; */
        if (message.value !== "")
            writer.tag(2, WireType.LengthDelimited).string(message.value);
        /* protos.steps.TransformType type = 3; */
        if (message.type !== 0)
            writer.tag(3, WireType.Varint).int32(message.type);
        /* protos.steps.TransformReplaceValueOptions replace_value_options = 101; */
        if (message.options.oneofKind === "replaceValueOptions")
            TransformReplaceValueOptions.internalBinaryWrite(message.options.replaceValueOptions, writer.tag(101, WireType.LengthDelimited).fork(), options).join();
        /* protos.steps.TransformDeleteFieldOptions delete_field_options = 102; */
        if (message.options.oneofKind === "deleteFieldOptions")
            TransformDeleteFieldOptions.internalBinaryWrite(message.options.deleteFieldOptions, writer.tag(102, WireType.LengthDelimited).fork(), options).join();
        /* protos.steps.TransformObfuscateOptions obfuscate_options = 103; */
        if (message.options.oneofKind === "obfuscateOptions")
            TransformObfuscateOptions.internalBinaryWrite(message.options.obfuscateOptions, writer.tag(103, WireType.LengthDelimited).fork(), options).join();
        /* protos.steps.TransformMaskOptions mask_options = 104; */
        if (message.options.oneofKind === "maskOptions")
            TransformMaskOptions.internalBinaryWrite(message.options.maskOptions, writer.tag(104, WireType.LengthDelimited).fork(), options).join();
        /* protos.steps.TransformTruncateOptions truncate_options = 105; */
        if (message.options.oneofKind === "truncateOptions")
            TransformTruncateOptions.internalBinaryWrite(message.options.truncateOptions, writer.tag(105, WireType.LengthDelimited).fork(), options).join();
        /* protos.steps.TransformExtractOptions extract_options = 106; */
        if (message.options.oneofKind === "extractOptions")
            TransformExtractOptions.internalBinaryWrite(message.options.extractOptions, writer.tag(106, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.steps.TransformStep
 */
export const TransformStep = new TransformStep$Type();
// @generated message type with reflection information, may provide speed optimized methods
class TransformTruncateOptions$Type extends MessageType<TransformTruncateOptions> {
    constructor() {
        super("protos.steps.TransformTruncateOptions", [
            { no: 1, name: "type", kind: "enum", T: () => ["protos.steps.TransformTruncateType", TransformTruncateType, "TRANSFORM_TRUNCATE_TYPE_"] },
            { no: 2, name: "path", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 3, name: "value", kind: "scalar", T: 5 /*ScalarType.INT32*/ }
        ]);
    }
    create(value?: PartialMessage<TransformTruncateOptions>): TransformTruncateOptions {
        const message = { type: 0, path: "", value: 0 };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<TransformTruncateOptions>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: TransformTruncateOptions): TransformTruncateOptions {
        let message = target ?? this.create(), end = reader.pos + length;
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
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: TransformTruncateOptions, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* protos.steps.TransformTruncateType type = 1; */
        if (message.type !== 0)
            writer.tag(1, WireType.Varint).int32(message.type);
        /* string path = 2; */
        if (message.path !== "")
            writer.tag(2, WireType.LengthDelimited).string(message.path);
        /* int32 value = 3; */
        if (message.value !== 0)
            writer.tag(3, WireType.Varint).int32(message.value);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.steps.TransformTruncateOptions
 */
export const TransformTruncateOptions = new TransformTruncateOptions$Type();
// @generated message type with reflection information, may provide speed optimized methods
class TransformDeleteFieldOptions$Type extends MessageType<TransformDeleteFieldOptions> {
    constructor() {
        super("protos.steps.TransformDeleteFieldOptions", [
            { no: 1, name: "paths", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value?: PartialMessage<TransformDeleteFieldOptions>): TransformDeleteFieldOptions {
        const message = { paths: [] };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<TransformDeleteFieldOptions>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: TransformDeleteFieldOptions): TransformDeleteFieldOptions {
        let message = target ?? this.create(), end = reader.pos + length;
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
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: TransformDeleteFieldOptions, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* repeated string paths = 1; */
        for (let i = 0; i < message.paths.length; i++)
            writer.tag(1, WireType.LengthDelimited).string(message.paths[i]);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.steps.TransformDeleteFieldOptions
 */
export const TransformDeleteFieldOptions = new TransformDeleteFieldOptions$Type();
// @generated message type with reflection information, may provide speed optimized methods
class TransformReplaceValueOptions$Type extends MessageType<TransformReplaceValueOptions> {
    constructor() {
        super("protos.steps.TransformReplaceValueOptions", [
            { no: 1, name: "path", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "value", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value?: PartialMessage<TransformReplaceValueOptions>): TransformReplaceValueOptions {
        const message = { path: "", value: "" };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<TransformReplaceValueOptions>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: TransformReplaceValueOptions): TransformReplaceValueOptions {
        let message = target ?? this.create(), end = reader.pos + length;
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
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: TransformReplaceValueOptions, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* string path = 1; */
        if (message.path !== "")
            writer.tag(1, WireType.LengthDelimited).string(message.path);
        /* string value = 2; */
        if (message.value !== "")
            writer.tag(2, WireType.LengthDelimited).string(message.value);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.steps.TransformReplaceValueOptions
 */
export const TransformReplaceValueOptions = new TransformReplaceValueOptions$Type();
// @generated message type with reflection information, may provide speed optimized methods
class TransformObfuscateOptions$Type extends MessageType<TransformObfuscateOptions> {
    constructor() {
        super("protos.steps.TransformObfuscateOptions", [
            { no: 1, name: "path", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value?: PartialMessage<TransformObfuscateOptions>): TransformObfuscateOptions {
        const message = { path: "" };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<TransformObfuscateOptions>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: TransformObfuscateOptions): TransformObfuscateOptions {
        let message = target ?? this.create(), end = reader.pos + length;
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
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: TransformObfuscateOptions, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* string path = 1; */
        if (message.path !== "")
            writer.tag(1, WireType.LengthDelimited).string(message.path);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.steps.TransformObfuscateOptions
 */
export const TransformObfuscateOptions = new TransformObfuscateOptions$Type();
// @generated message type with reflection information, may provide speed optimized methods
class TransformMaskOptions$Type extends MessageType<TransformMaskOptions> {
    constructor() {
        super("protos.steps.TransformMaskOptions", [
            { no: 1, name: "path", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "mask", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value?: PartialMessage<TransformMaskOptions>): TransformMaskOptions {
        const message = { path: "", mask: "" };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<TransformMaskOptions>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: TransformMaskOptions): TransformMaskOptions {
        let message = target ?? this.create(), end = reader.pos + length;
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
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: TransformMaskOptions, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* string path = 1; */
        if (message.path !== "")
            writer.tag(1, WireType.LengthDelimited).string(message.path);
        /* string mask = 2; */
        if (message.mask !== "")
            writer.tag(2, WireType.LengthDelimited).string(message.mask);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.steps.TransformMaskOptions
 */
export const TransformMaskOptions = new TransformMaskOptions$Type();
// @generated message type with reflection information, may provide speed optimized methods
class TransformExtractOptions$Type extends MessageType<TransformExtractOptions> {
    constructor() {
        super("protos.steps.TransformExtractOptions", [
            { no: 1, name: "paths", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "flatten", kind: "scalar", T: 8 /*ScalarType.BOOL*/ }
        ]);
    }
    create(value?: PartialMessage<TransformExtractOptions>): TransformExtractOptions {
        const message = { paths: [], flatten: false };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<TransformExtractOptions>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: TransformExtractOptions): TransformExtractOptions {
        let message = target ?? this.create(), end = reader.pos + length;
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
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: TransformExtractOptions, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* repeated string paths = 1; */
        for (let i = 0; i < message.paths.length; i++)
            writer.tag(1, WireType.LengthDelimited).string(message.paths[i]);
        /* bool flatten = 2; */
        if (message.flatten !== false)
            writer.tag(2, WireType.Varint).bool(message.flatten);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.steps.TransformExtractOptions
 */
export const TransformExtractOptions = new TransformExtractOptions$Type();
