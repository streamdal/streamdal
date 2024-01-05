import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
/**
 * @generated from protobuf message protos.steps.SchemaValidationStep
 */
export interface SchemaValidationStep {
    /**
     * @generated from protobuf field: protos.steps.SchemaValidationType type = 1;
     */
    type: SchemaValidationType;
    /**
     * @generated from protobuf field: protos.steps.SchemaValidationCondition condition = 2;
     */
    condition: SchemaValidationCondition;
    /**
     * @generated from protobuf oneof: options
     */
    options: {
        oneofKind: "jsonSchema";
        /**
         * @generated from protobuf field: protos.steps.SchemaValidationJSONSchema json_schema = 101;
         */
        jsonSchema: SchemaValidationJSONSchema;
    } | {
        oneofKind: undefined;
    };
}
/**
 * @generated from protobuf message protos.steps.SchemaValidationJSONSchema
 */
export interface SchemaValidationJSONSchema {
    /**
     * @generated from protobuf field: bytes json_schema = 1;
     */
    jsonSchema: Uint8Array;
    /**
     * @generated from protobuf field: protos.steps.JSONSchemaDraft draft = 2;
     */
    draft: JSONSchemaDraft;
}
/**
 * @generated from protobuf enum protos.steps.SchemaValidationType
 */
export declare enum SchemaValidationType {
    /**
     * @generated from protobuf enum value: SCHEMA_VALIDATION_TYPE_UNKNOWN = 0;
     */
    UNKNOWN = 0,
    /**
     * @generated from protobuf enum value: SCHEMA_VALIDATION_TYPE_JSONSCHEMA = 1;
     */
    JSONSCHEMA = 1
}
/**
 * @generated from protobuf enum protos.steps.SchemaValidationCondition
 */
export declare enum SchemaValidationCondition {
    /**
     * @generated from protobuf enum value: SCHEMA_VALIDATION_CONDITION_UNKNOWN = 0;
     */
    UNKNOWN = 0,
    /**
     * @generated from protobuf enum value: SCHEMA_VALIDATION_CONDITION_MATCH = 1;
     */
    MATCH = 1,
    /**
     * @generated from protobuf enum value: SCHEMA_VALIDATION_CONDITION_NOT_MATCH = 2;
     */
    NOT_MATCH = 2
}
/**
 * @generated from protobuf enum protos.steps.JSONSchemaDraft
 */
export declare enum JSONSchemaDraft {
    /**
     * @generated from protobuf enum value: JSON_SCHEMA_DRAFT_UNKNOWN = 0;
     */
    JSON_SCHEMA_DRAFT_UNKNOWN = 0,
    /**
     * @generated from protobuf enum value: JSON_SCHEMA_DRAFT_04 = 1;
     */
    JSON_SCHEMA_DRAFT_04 = 1,
    /**
     * @generated from protobuf enum value: JSON_SCHEMA_DRAFT_06 = 2;
     */
    JSON_SCHEMA_DRAFT_06 = 2,
    /**
     * @generated from protobuf enum value: JSON_SCHEMA_DRAFT_07 = 3;
     */
    JSON_SCHEMA_DRAFT_07 = 3
}
declare class SchemaValidationStep$Type extends MessageType<SchemaValidationStep> {
    constructor();
    create(value?: PartialMessage<SchemaValidationStep>): SchemaValidationStep;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: SchemaValidationStep): SchemaValidationStep;
    internalBinaryWrite(message: SchemaValidationStep, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.steps.SchemaValidationStep
 */
export declare const SchemaValidationStep: SchemaValidationStep$Type;
declare class SchemaValidationJSONSchema$Type extends MessageType<SchemaValidationJSONSchema> {
    constructor();
    create(value?: PartialMessage<SchemaValidationJSONSchema>): SchemaValidationJSONSchema;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: SchemaValidationJSONSchema): SchemaValidationJSONSchema;
    internalBinaryWrite(message: SchemaValidationJSONSchema, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.steps.SchemaValidationJSONSchema
 */
export declare const SchemaValidationJSONSchema: SchemaValidationJSONSchema$Type;
export {};
