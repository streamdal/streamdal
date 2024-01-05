"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaValidationJSONSchema = exports.SchemaValidationStep = exports.JSONSchemaDraft = exports.SchemaValidationCondition = exports.SchemaValidationType = void 0;
const runtime_1 = require("@protobuf-ts/runtime");
const runtime_2 = require("@protobuf-ts/runtime");
const runtime_3 = require("@protobuf-ts/runtime");
const runtime_4 = require("@protobuf-ts/runtime");
const runtime_5 = require("@protobuf-ts/runtime");
/**
 * TODO: expand for protobuf, avro, etc.
 *
 * @generated from protobuf enum protos.steps.SchemaValidationType
 */
var SchemaValidationType;
(function (SchemaValidationType) {
    /**
     * @generated from protobuf enum value: SCHEMA_VALIDATION_TYPE_UNKNOWN = 0;
     */
    SchemaValidationType[SchemaValidationType["UNKNOWN"] = 0] = "UNKNOWN";
    /**
     * @generated from protobuf enum value: SCHEMA_VALIDATION_TYPE_JSONSCHEMA = 1;
     */
    SchemaValidationType[SchemaValidationType["JSONSCHEMA"] = 1] = "JSONSCHEMA";
})(SchemaValidationType || (exports.SchemaValidationType = SchemaValidationType = {}));
/**
 * @generated from protobuf enum protos.steps.SchemaValidationCondition
 */
var SchemaValidationCondition;
(function (SchemaValidationCondition) {
    /**
     * @generated from protobuf enum value: SCHEMA_VALIDATION_CONDITION_UNKNOWN = 0;
     */
    SchemaValidationCondition[SchemaValidationCondition["UNKNOWN"] = 0] = "UNKNOWN";
    /**
     * @generated from protobuf enum value: SCHEMA_VALIDATION_CONDITION_MATCH = 1;
     */
    SchemaValidationCondition[SchemaValidationCondition["MATCH"] = 1] = "MATCH";
    /**
     * TODO: backwards compat, evolve, etc.
     *
     * @generated from protobuf enum value: SCHEMA_VALIDATION_CONDITION_NOT_MATCH = 2;
     */
    SchemaValidationCondition[SchemaValidationCondition["NOT_MATCH"] = 2] = "NOT_MATCH";
})(SchemaValidationCondition || (exports.SchemaValidationCondition = SchemaValidationCondition = {}));
/**
 * @generated from protobuf enum protos.steps.JSONSchemaDraft
 */
var JSONSchemaDraft;
(function (JSONSchemaDraft) {
    /**
     * @generated from protobuf enum value: JSON_SCHEMA_DRAFT_UNKNOWN = 0;
     */
    JSONSchemaDraft[JSONSchemaDraft["JSON_SCHEMA_DRAFT_UNKNOWN"] = 0] = "JSON_SCHEMA_DRAFT_UNKNOWN";
    /**
     * @generated from protobuf enum value: JSON_SCHEMA_DRAFT_04 = 1;
     */
    JSONSchemaDraft[JSONSchemaDraft["JSON_SCHEMA_DRAFT_04"] = 1] = "JSON_SCHEMA_DRAFT_04";
    /**
     * @generated from protobuf enum value: JSON_SCHEMA_DRAFT_06 = 2;
     */
    JSONSchemaDraft[JSONSchemaDraft["JSON_SCHEMA_DRAFT_06"] = 2] = "JSON_SCHEMA_DRAFT_06";
    /**
     * @generated from protobuf enum value: JSON_SCHEMA_DRAFT_07 = 3;
     */
    JSONSchemaDraft[JSONSchemaDraft["JSON_SCHEMA_DRAFT_07"] = 3] = "JSON_SCHEMA_DRAFT_07";
})(JSONSchemaDraft || (exports.JSONSchemaDraft = JSONSchemaDraft = {}));
// @generated message type with reflection information, may provide speed optimized methods
class SchemaValidationStep$Type extends runtime_5.MessageType {
    constructor() {
        super("protos.steps.SchemaValidationStep", [
            { no: 1, name: "type", kind: "enum", T: () => ["protos.steps.SchemaValidationType", SchemaValidationType, "SCHEMA_VALIDATION_TYPE_"] },
            { no: 2, name: "condition", kind: "enum", T: () => ["protos.steps.SchemaValidationCondition", SchemaValidationCondition, "SCHEMA_VALIDATION_CONDITION_"] },
            { no: 101, name: "json_schema", kind: "message", oneof: "options", T: () => exports.SchemaValidationJSONSchema }
        ]);
    }
    create(value) {
        const message = { type: 0, condition: 0, options: { oneofKind: undefined } };
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
                case /* protos.steps.SchemaValidationType type */ 1:
                    message.type = reader.int32();
                    break;
                case /* protos.steps.SchemaValidationCondition condition */ 2:
                    message.condition = reader.int32();
                    break;
                case /* protos.steps.SchemaValidationJSONSchema json_schema */ 101:
                    message.options = {
                        oneofKind: "jsonSchema",
                        jsonSchema: exports.SchemaValidationJSONSchema.internalBinaryRead(reader, reader.uint32(), options, message.options.jsonSchema)
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
        /* protos.steps.SchemaValidationType type = 1; */
        if (message.type !== 0)
            writer.tag(1, runtime_1.WireType.Varint).int32(message.type);
        /* protos.steps.SchemaValidationCondition condition = 2; */
        if (message.condition !== 0)
            writer.tag(2, runtime_1.WireType.Varint).int32(message.condition);
        /* protos.steps.SchemaValidationJSONSchema json_schema = 101; */
        if (message.options.oneofKind === "jsonSchema")
            exports.SchemaValidationJSONSchema.internalBinaryWrite(message.options.jsonSchema, writer.tag(101, runtime_1.WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.steps.SchemaValidationStep
 */
exports.SchemaValidationStep = new SchemaValidationStep$Type();
// @generated message type with reflection information, may provide speed optimized methods
class SchemaValidationJSONSchema$Type extends runtime_5.MessageType {
    constructor() {
        super("protos.steps.SchemaValidationJSONSchema", [
            { no: 1, name: "json_schema", kind: "scalar", T: 12 /*ScalarType.BYTES*/ },
            { no: 2, name: "draft", kind: "enum", T: () => ["protos.steps.JSONSchemaDraft", JSONSchemaDraft] }
        ]);
    }
    create(value) {
        const message = { jsonSchema: new Uint8Array(0), draft: 0 };
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
                case /* bytes json_schema */ 1:
                    message.jsonSchema = reader.bytes();
                    break;
                case /* protos.steps.JSONSchemaDraft draft */ 2:
                    message.draft = reader.int32();
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
        /* bytes json_schema = 1; */
        if (message.jsonSchema.length)
            writer.tag(1, runtime_1.WireType.LengthDelimited).bytes(message.jsonSchema);
        /* protos.steps.JSONSchemaDraft draft = 2; */
        if (message.draft !== 0)
            writer.tag(2, runtime_1.WireType.Varint).int32(message.draft);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.steps.SchemaValidationJSONSchema
 */
exports.SchemaValidationJSONSchema = new SchemaValidationJSONSchema$Type();
