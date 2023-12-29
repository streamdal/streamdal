import { WireType } from "@protobuf-ts/runtime";
import { UnknownFieldHandler } from "@protobuf-ts/runtime";
import { reflectionMergePartial } from "@protobuf-ts/runtime";
import { MESSAGE_TYPE } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
/**
 * TODO: expand for protobuf, avro, etc.
 *
 * @generated from protobuf enum protos.steps.SchemaValidationType
 */
export var SchemaValidationType;
(function (SchemaValidationType) {
    /**
     * @generated from protobuf enum value: SCHEMA_VALIDATION_TYPE_UNKNOWN = 0;
     */
    SchemaValidationType[SchemaValidationType["UNKNOWN"] = 0] = "UNKNOWN";
    /**
     * @generated from protobuf enum value: SCHEMA_VALIDATION_TYPE_JSONSCHEMA = 1;
     */
    SchemaValidationType[SchemaValidationType["JSONSCHEMA"] = 1] = "JSONSCHEMA";
})(SchemaValidationType || (SchemaValidationType = {}));
/**
 * @generated from protobuf enum protos.steps.SchemaValidationCondition
 */
export var SchemaValidationCondition;
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
})(SchemaValidationCondition || (SchemaValidationCondition = {}));
// @generated message type with reflection information, may provide speed optimized methods
class SchemaValidationStep$Type extends MessageType {
    constructor() {
        super("protos.steps.SchemaValidationStep", [
            { no: 1, name: "type", kind: "enum", T: () => ["protos.steps.SchemaValidationType", SchemaValidationType, "SCHEMA_VALIDATION_TYPE_"] },
            { no: 101, name: "json_schema", kind: "message", oneof: "options", T: () => SchemaValidationJSONSchema }
        ]);
    }
    create(value) {
        const message = { type: 0, options: { oneofKind: undefined } };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial(this, message, value);
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
                case /* protos.steps.SchemaValidationJSONSchema json_schema */ 101:
                    message.options = {
                        oneofKind: "jsonSchema",
                        jsonSchema: SchemaValidationJSONSchema.internalBinaryRead(reader, reader.uint32(), options, message.options.jsonSchema)
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
    internalBinaryWrite(message, writer, options) {
        /* protos.steps.SchemaValidationType type = 1; */
        if (message.type !== 0)
            writer.tag(1, WireType.Varint).int32(message.type);
        /* protos.steps.SchemaValidationJSONSchema json_schema = 101; */
        if (message.options.oneofKind === "jsonSchema")
            SchemaValidationJSONSchema.internalBinaryWrite(message.options.jsonSchema, writer.tag(101, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.steps.SchemaValidationStep
 */
export const SchemaValidationStep = new SchemaValidationStep$Type();
// @generated message type with reflection information, may provide speed optimized methods
class SchemaValidationJSONSchema$Type extends MessageType {
    constructor() {
        super("protos.steps.SchemaValidationJSONSchema", [
            { no: 1, name: "json_schema", kind: "scalar", T: 12 /*ScalarType.BYTES*/ }
        ]);
    }
    create(value) {
        const message = { jsonSchema: new Uint8Array(0) };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial(this, message, value);
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
    internalBinaryWrite(message, writer, options) {
        /* bytes json_schema = 1; */
        if (message.jsonSchema.length)
            writer.tag(1, WireType.LengthDelimited).bytes(message.jsonSchema);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.steps.SchemaValidationJSONSchema
 */
export const SchemaValidationJSONSchema = new SchemaValidationJSONSchema$Type();
