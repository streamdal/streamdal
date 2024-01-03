import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
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
    value: string;
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
         * @generated from protobuf field: protos.steps.TransformReplaceValueOptions replace_value_options = 101;
         */
        replaceValueOptions: TransformReplaceValueOptions;
    } | {
        oneofKind: "deleteFieldOptions";
        /**
         * @generated from protobuf field: protos.steps.TransformDeleteFieldOptions delete_field_options = 102;
         */
        deleteFieldOptions: TransformDeleteFieldOptions;
    } | {
        oneofKind: "obfuscateOptions";
        /**
         * @generated from protobuf field: protos.steps.TransformObfuscateOptions obfuscate_options = 103;
         */
        obfuscateOptions: TransformObfuscateOptions;
    } | {
        oneofKind: "maskOptions";
        /**
         * @generated from protobuf field: protos.steps.TransformMaskOptions mask_options = 104;
         */
        maskOptions: TransformMaskOptions;
    } | {
        oneofKind: "truncateOptions";
        /**
         * @generated from protobuf field: protos.steps.TransformTruncateOptions truncate_options = 105;
         */
        truncateOptions: TransformTruncateOptions;
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
     * @generated from protobuf field: string path = 1;
     */
    path: string;
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
 * @generated from protobuf enum protos.steps.TransformType
 */
export declare enum TransformType {
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
     * TODO: type for delete all keys except specified ones
     *
     * @generated from protobuf enum value: TRANSFORM_TYPE_TRUNCATE_VALUE = 5;
     */
    TRUNCATE_VALUE = 5
}
/**
 * @generated from protobuf enum protos.steps.TransformTruncateType
 */
export declare enum TransformTruncateType {
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
declare class TransformStep$Type extends MessageType<TransformStep> {
    constructor();
    create(value?: PartialMessage<TransformStep>): TransformStep;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: TransformStep): TransformStep;
    internalBinaryWrite(message: TransformStep, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.steps.TransformStep
 */
export declare const TransformStep: TransformStep$Type;
declare class TransformTruncateOptions$Type extends MessageType<TransformTruncateOptions> {
    constructor();
    create(value?: PartialMessage<TransformTruncateOptions>): TransformTruncateOptions;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: TransformTruncateOptions): TransformTruncateOptions;
    internalBinaryWrite(message: TransformTruncateOptions, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.steps.TransformTruncateOptions
 */
export declare const TransformTruncateOptions: TransformTruncateOptions$Type;
declare class TransformDeleteFieldOptions$Type extends MessageType<TransformDeleteFieldOptions> {
    constructor();
    create(value?: PartialMessage<TransformDeleteFieldOptions>): TransformDeleteFieldOptions;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: TransformDeleteFieldOptions): TransformDeleteFieldOptions;
    internalBinaryWrite(message: TransformDeleteFieldOptions, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.steps.TransformDeleteFieldOptions
 */
export declare const TransformDeleteFieldOptions: TransformDeleteFieldOptions$Type;
declare class TransformReplaceValueOptions$Type extends MessageType<TransformReplaceValueOptions> {
    constructor();
    create(value?: PartialMessage<TransformReplaceValueOptions>): TransformReplaceValueOptions;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: TransformReplaceValueOptions): TransformReplaceValueOptions;
    internalBinaryWrite(message: TransformReplaceValueOptions, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.steps.TransformReplaceValueOptions
 */
export declare const TransformReplaceValueOptions: TransformReplaceValueOptions$Type;
declare class TransformObfuscateOptions$Type extends MessageType<TransformObfuscateOptions> {
    constructor();
    create(value?: PartialMessage<TransformObfuscateOptions>): TransformObfuscateOptions;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: TransformObfuscateOptions): TransformObfuscateOptions;
    internalBinaryWrite(message: TransformObfuscateOptions, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.steps.TransformObfuscateOptions
 */
export declare const TransformObfuscateOptions: TransformObfuscateOptions$Type;
declare class TransformMaskOptions$Type extends MessageType<TransformMaskOptions> {
    constructor();
    create(value?: PartialMessage<TransformMaskOptions>): TransformMaskOptions;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: TransformMaskOptions): TransformMaskOptions;
    internalBinaryWrite(message: TransformMaskOptions, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.steps.TransformMaskOptions
 */
export declare const TransformMaskOptions: TransformMaskOptions$Type;
export {};
