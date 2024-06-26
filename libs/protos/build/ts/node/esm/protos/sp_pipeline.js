import { WireType } from "@protobuf-ts/runtime";
import { UnknownFieldHandler } from "@protobuf-ts/runtime";
import { reflectionMergePartial } from "@protobuf-ts/runtime";
import { MESSAGE_TYPE } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
import { SchemaValidationStep } from "./steps/sp_steps_schema_validation.js";
import { ValidJSONStep } from "./steps/sp_steps_valid_json.js";
import { InferSchemaStep } from "./steps/sp_steps_inferschema.js";
import { KVStep } from "./steps/sp_steps_kv.js";
import { HttpRequestStep } from "./steps/sp_steps_httprequest.js";
import { CustomStep } from "./steps/sp_steps_custom.js";
import { DecodeStep } from "./steps/sp_steps_decode.js";
import { EncodeStep } from "./steps/sp_steps_encode.js";
import { TransformStep } from "./steps/sp_steps_transform.js";
import { DetectiveStep } from "./steps/sp_steps_detective.js";
import { NotificationConfig } from "./sp_notify.js";
/**
 * @generated from protobuf enum protos.PipelineStepNotification.PayloadType
 */
export var PipelineStepNotification_PayloadType;
(function (PipelineStepNotification_PayloadType) {
    /**
     * Same functionality as PAYLOAD_TYPE_EXCLUDE
     *
     * @generated from protobuf enum value: PAYLOAD_TYPE_UNSET = 0;
     */
    PipelineStepNotification_PayloadType[PipelineStepNotification_PayloadType["UNSET"] = 0] = "UNSET";
    /**
     * Default. No payload data included in notification
     *
     * @generated from protobuf enum value: PAYLOAD_TYPE_EXCLUDE = 1;
     */
    PipelineStepNotification_PayloadType[PipelineStepNotification_PayloadType["EXCLUDE"] = 1] = "EXCLUDE";
    /**
     * Entire payload content included in notification
     *
     * @generated from protobuf enum value: PAYLOAD_TYPE_FULL_PAYLOAD = 2;
     */
    PipelineStepNotification_PayloadType[PipelineStepNotification_PayloadType["FULL_PAYLOAD"] = 2] = "FULL_PAYLOAD";
    /**
     * Only specified paths of payload content included in notification
     * Only works on JSON. Plaintext payloads will be ignored.
     *
     * @generated from protobuf enum value: PAYLOAD_TYPE_SELECT_PATHS = 3;
     */
    PipelineStepNotification_PayloadType[PipelineStepNotification_PayloadType["SELECT_PATHS"] = 3] = "SELECT_PATHS";
})(PipelineStepNotification_PayloadType || (PipelineStepNotification_PayloadType = {}));
/**
 * @generated from protobuf enum protos.PipelineDataFormat
 */
export var PipelineDataFormat;
(function (PipelineDataFormat) {
    /**
     * @generated from protobuf enum value: PIPELINE_DATA_FORMAT_UNSET = 0;
     */
    PipelineDataFormat[PipelineDataFormat["UNSET"] = 0] = "UNSET";
    /**
     * @generated from protobuf enum value: PIPELINE_DATA_FORMAT_JSON = 1;
     */
    PipelineDataFormat[PipelineDataFormat["JSON"] = 1] = "JSON";
    /**
     * @generated from protobuf enum value: PIPELINE_DATA_FORMAT_PLAINTEXT = 2;
     */
    PipelineDataFormat[PipelineDataFormat["PLAINTEXT"] = 2] = "PLAINTEXT";
})(PipelineDataFormat || (PipelineDataFormat = {}));
/**
 * Defines the ways in which a pipeline can be aborted
 *
 * @generated from protobuf enum protos.AbortCondition
 */
export var AbortCondition;
(function (AbortCondition) {
    /**
     * @generated from protobuf enum value: ABORT_CONDITION_UNSET = 0;
     */
    AbortCondition[AbortCondition["UNSET"] = 0] = "UNSET";
    /**
     * @generated from protobuf enum value: ABORT_CONDITION_ABORT_CURRENT = 1;
     */
    AbortCondition[AbortCondition["ABORT_CURRENT"] = 1] = "ABORT_CURRENT";
    /**
     * @generated from protobuf enum value: ABORT_CONDITION_ABORT_ALL = 2;
     */
    AbortCondition[AbortCondition["ABORT_ALL"] = 2] = "ABORT_ALL";
})(AbortCondition || (AbortCondition = {}));
// @generated message type with reflection information, may provide speed optimized methods
class Pipeline$Type extends MessageType {
    constructor() {
        super("protos.Pipeline", [
            { no: 1, name: "id", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "name", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 3, name: "steps", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => PipelineStep },
            { no: 4, name: "_notification_configs", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => NotificationConfig },
            { no: 5, name: "data_format", kind: "enum", T: () => ["protos.PipelineDataFormat", PipelineDataFormat, "PIPELINE_DATA_FORMAT_"] },
            { no: 1000, name: "_paused", kind: "scalar", opt: true, T: 8 /*ScalarType.BOOL*/ },
            { no: 1001, name: "_description", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 1002, name: "_version", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 1003, name: "_url", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 1004, name: "_created_at_unix_ts_utc", kind: "scalar", opt: true, T: 3 /*ScalarType.INT64*/ },
            { no: 1005, name: "_updated_at_unix_ts_utc", kind: "scalar", opt: true, T: 3 /*ScalarType.INT64*/ },
            { no: 1006, name: "_created_by", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value) {
        const message = { id: "", name: "", steps: [], NotificationConfigs: [], dataFormat: 0 };
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
                case /* string id */ 1:
                    message.id = reader.string();
                    break;
                case /* string name */ 2:
                    message.name = reader.string();
                    break;
                case /* repeated protos.PipelineStep steps */ 3:
                    message.steps.push(PipelineStep.internalBinaryRead(reader, reader.uint32(), options));
                    break;
                case /* repeated protos.NotificationConfig _notification_configs = 4 [deprecated = true];*/ 4:
                    message.NotificationConfigs.push(NotificationConfig.internalBinaryRead(reader, reader.uint32(), options));
                    break;
                case /* protos.PipelineDataFormat data_format */ 5:
                    message.dataFormat = reader.int32();
                    break;
                case /* optional bool _paused */ 1000:
                    message.Paused = reader.bool();
                    break;
                case /* optional string _description */ 1001:
                    message.Description = reader.string();
                    break;
                case /* optional string _version */ 1002:
                    message.Version = reader.string();
                    break;
                case /* optional string _url */ 1003:
                    message.Url = reader.string();
                    break;
                case /* optional int64 _created_at_unix_ts_utc */ 1004:
                    message.CreatedAtUnixTsUtc = reader.int64().toString();
                    break;
                case /* optional int64 _updated_at_unix_ts_utc */ 1005:
                    message.UpdatedAtUnixTsUtc = reader.int64().toString();
                    break;
                case /* optional string _created_by */ 1006:
                    message.CreatedBy = reader.string();
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
        /* string id = 1; */
        if (message.id !== "")
            writer.tag(1, WireType.LengthDelimited).string(message.id);
        /* string name = 2; */
        if (message.name !== "")
            writer.tag(2, WireType.LengthDelimited).string(message.name);
        /* repeated protos.PipelineStep steps = 3; */
        for (let i = 0; i < message.steps.length; i++)
            PipelineStep.internalBinaryWrite(message.steps[i], writer.tag(3, WireType.LengthDelimited).fork(), options).join();
        /* repeated protos.NotificationConfig _notification_configs = 4 [deprecated = true]; */
        for (let i = 0; i < message.NotificationConfigs.length; i++)
            NotificationConfig.internalBinaryWrite(message.NotificationConfigs[i], writer.tag(4, WireType.LengthDelimited).fork(), options).join();
        /* protos.PipelineDataFormat data_format = 5; */
        if (message.dataFormat !== 0)
            writer.tag(5, WireType.Varint).int32(message.dataFormat);
        /* optional bool _paused = 1000; */
        if (message.Paused !== undefined)
            writer.tag(1000, WireType.Varint).bool(message.Paused);
        /* optional string _description = 1001; */
        if (message.Description !== undefined)
            writer.tag(1001, WireType.LengthDelimited).string(message.Description);
        /* optional string _version = 1002; */
        if (message.Version !== undefined)
            writer.tag(1002, WireType.LengthDelimited).string(message.Version);
        /* optional string _url = 1003; */
        if (message.Url !== undefined)
            writer.tag(1003, WireType.LengthDelimited).string(message.Url);
        /* optional int64 _created_at_unix_ts_utc = 1004; */
        if (message.CreatedAtUnixTsUtc !== undefined)
            writer.tag(1004, WireType.Varint).int64(message.CreatedAtUnixTsUtc);
        /* optional int64 _updated_at_unix_ts_utc = 1005; */
        if (message.UpdatedAtUnixTsUtc !== undefined)
            writer.tag(1005, WireType.Varint).int64(message.UpdatedAtUnixTsUtc);
        /* optional string _created_by = 1006; */
        if (message.CreatedBy !== undefined)
            writer.tag(1006, WireType.LengthDelimited).string(message.CreatedBy);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.Pipeline
 */
export const Pipeline = new Pipeline$Type();
// @generated message type with reflection information, may provide speed optimized methods
class PipelineStepConditions$Type extends MessageType {
    constructor() {
        super("protos.PipelineStepConditions", [
            { no: 1, name: "abort", kind: "enum", T: () => ["protos.AbortCondition", AbortCondition, "ABORT_CONDITION_"] },
            { no: 2, name: "notify", kind: "scalar", T: 8 /*ScalarType.BOOL*/ },
            { no: 3, name: "metadata", kind: "map", K: 9 /*ScalarType.STRING*/, V: { kind: "scalar", T: 9 /*ScalarType.STRING*/ } },
            { no: 4, name: "notification", kind: "message", T: () => PipelineStepNotification }
        ]);
    }
    create(value) {
        const message = { abort: 0, notify: false, metadata: {} };
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
                case /* protos.AbortCondition abort */ 1:
                    message.abort = reader.int32();
                    break;
                case /* bool notify = 2 [deprecated = true];*/ 2:
                    message.notify = reader.bool();
                    break;
                case /* map<string, string> metadata */ 3:
                    this.binaryReadMap3(message.metadata, reader, options);
                    break;
                case /* protos.PipelineStepNotification notification */ 4:
                    message.notification = PipelineStepNotification.internalBinaryRead(reader, reader.uint32(), options, message.notification);
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
    binaryReadMap3(map, reader, options) {
        let len = reader.uint32(), end = reader.pos + len, key, val;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case 1:
                    key = reader.string();
                    break;
                case 2:
                    val = reader.string();
                    break;
                default: throw new globalThis.Error("unknown map entry field for field protos.PipelineStepConditions.metadata");
            }
        }
        map[key !== null && key !== void 0 ? key : ""] = val !== null && val !== void 0 ? val : "";
    }
    internalBinaryWrite(message, writer, options) {
        /* protos.AbortCondition abort = 1; */
        if (message.abort !== 0)
            writer.tag(1, WireType.Varint).int32(message.abort);
        /* bool notify = 2 [deprecated = true]; */
        if (message.notify !== false)
            writer.tag(2, WireType.Varint).bool(message.notify);
        /* map<string, string> metadata = 3; */
        for (let k of Object.keys(message.metadata))
            writer.tag(3, WireType.LengthDelimited).fork().tag(1, WireType.LengthDelimited).string(k).tag(2, WireType.LengthDelimited).string(message.metadata[k]).join();
        /* protos.PipelineStepNotification notification = 4; */
        if (message.notification)
            PipelineStepNotification.internalBinaryWrite(message.notification, writer.tag(4, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.PipelineStepConditions
 */
export const PipelineStepConditions = new PipelineStepConditions$Type();
// @generated message type with reflection information, may provide speed optimized methods
class PipelineStepNotification$Type extends MessageType {
    constructor() {
        super("protos.PipelineStepNotification", [
            { no: 1, name: "notification_config_ids", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "payload_type", kind: "enum", T: () => ["protos.PipelineStepNotification.PayloadType", PipelineStepNotification_PayloadType, "PAYLOAD_TYPE_"] },
            { no: 3, name: "paths", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value) {
        const message = { notificationConfigIds: [], payloadType: 0, paths: [] };
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
                case /* repeated string notification_config_ids */ 1:
                    message.notificationConfigIds.push(reader.string());
                    break;
                case /* protos.PipelineStepNotification.PayloadType payload_type */ 2:
                    message.payloadType = reader.int32();
                    break;
                case /* repeated string paths */ 3:
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
    internalBinaryWrite(message, writer, options) {
        /* repeated string notification_config_ids = 1; */
        for (let i = 0; i < message.notificationConfigIds.length; i++)
            writer.tag(1, WireType.LengthDelimited).string(message.notificationConfigIds[i]);
        /* protos.PipelineStepNotification.PayloadType payload_type = 2; */
        if (message.payloadType !== 0)
            writer.tag(2, WireType.Varint).int32(message.payloadType);
        /* repeated string paths = 3; */
        for (let i = 0; i < message.paths.length; i++)
            writer.tag(3, WireType.LengthDelimited).string(message.paths[i]);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.PipelineStepNotification
 */
export const PipelineStepNotification = new PipelineStepNotification$Type();
// @generated message type with reflection information, may provide speed optimized methods
class PipelineStep$Type extends MessageType {
    constructor() {
        super("protos.PipelineStep", [
            { no: 1, name: "name", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "on_true", kind: "message", T: () => PipelineStepConditions },
            { no: 3, name: "on_false", kind: "message", T: () => PipelineStepConditions },
            { no: 4, name: "dynamic", kind: "scalar", T: 8 /*ScalarType.BOOL*/ },
            { no: 5, name: "on_error", kind: "message", T: () => PipelineStepConditions },
            { no: 1000, name: "detective", kind: "message", oneof: "step", T: () => DetectiveStep },
            { no: 1001, name: "transform", kind: "message", oneof: "step", T: () => TransformStep },
            { no: 1002, name: "encode", kind: "message", oneof: "step", T: () => EncodeStep },
            { no: 1003, name: "decode", kind: "message", oneof: "step", T: () => DecodeStep },
            { no: 1004, name: "custom", kind: "message", oneof: "step", T: () => CustomStep },
            { no: 1005, name: "http_request", kind: "message", oneof: "step", T: () => HttpRequestStep },
            { no: 1006, name: "kv", kind: "message", oneof: "step", T: () => KVStep },
            { no: 1007, name: "infer_schema", kind: "message", oneof: "step", T: () => InferSchemaStep },
            { no: 1008, name: "valid_json", kind: "message", oneof: "step", T: () => ValidJSONStep },
            { no: 1009, name: "schema_validation", kind: "message", oneof: "step", T: () => SchemaValidationStep },
            { no: 10000, name: "_wasm_id", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 10001, name: "_wasm_bytes", kind: "scalar", opt: true, T: 12 /*ScalarType.BYTES*/ },
            { no: 10002, name: "_wasm_function", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value) {
        const message = { name: "", dynamic: false, step: { oneofKind: undefined } };
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
                case /* string name */ 1:
                    message.name = reader.string();
                    break;
                case /* protos.PipelineStepConditions on_true */ 2:
                    message.onTrue = PipelineStepConditions.internalBinaryRead(reader, reader.uint32(), options, message.onTrue);
                    break;
                case /* protos.PipelineStepConditions on_false */ 3:
                    message.onFalse = PipelineStepConditions.internalBinaryRead(reader, reader.uint32(), options, message.onFalse);
                    break;
                case /* bool dynamic */ 4:
                    message.dynamic = reader.bool();
                    break;
                case /* protos.PipelineStepConditions on_error */ 5:
                    message.onError = PipelineStepConditions.internalBinaryRead(reader, reader.uint32(), options, message.onError);
                    break;
                case /* protos.steps.DetectiveStep detective */ 1000:
                    message.step = {
                        oneofKind: "detective",
                        detective: DetectiveStep.internalBinaryRead(reader, reader.uint32(), options, message.step.detective)
                    };
                    break;
                case /* protos.steps.TransformStep transform */ 1001:
                    message.step = {
                        oneofKind: "transform",
                        transform: TransformStep.internalBinaryRead(reader, reader.uint32(), options, message.step.transform)
                    };
                    break;
                case /* protos.steps.EncodeStep encode */ 1002:
                    message.step = {
                        oneofKind: "encode",
                        encode: EncodeStep.internalBinaryRead(reader, reader.uint32(), options, message.step.encode)
                    };
                    break;
                case /* protos.steps.DecodeStep decode */ 1003:
                    message.step = {
                        oneofKind: "decode",
                        decode: DecodeStep.internalBinaryRead(reader, reader.uint32(), options, message.step.decode)
                    };
                    break;
                case /* protos.steps.CustomStep custom */ 1004:
                    message.step = {
                        oneofKind: "custom",
                        custom: CustomStep.internalBinaryRead(reader, reader.uint32(), options, message.step.custom)
                    };
                    break;
                case /* protos.steps.HttpRequestStep http_request */ 1005:
                    message.step = {
                        oneofKind: "httpRequest",
                        httpRequest: HttpRequestStep.internalBinaryRead(reader, reader.uint32(), options, message.step.httpRequest)
                    };
                    break;
                case /* protos.steps.KVStep kv */ 1006:
                    message.step = {
                        oneofKind: "kv",
                        kv: KVStep.internalBinaryRead(reader, reader.uint32(), options, message.step.kv)
                    };
                    break;
                case /* protos.steps.InferSchemaStep infer_schema */ 1007:
                    message.step = {
                        oneofKind: "inferSchema",
                        inferSchema: InferSchemaStep.internalBinaryRead(reader, reader.uint32(), options, message.step.inferSchema)
                    };
                    break;
                case /* protos.steps.ValidJSONStep valid_json */ 1008:
                    message.step = {
                        oneofKind: "validJson",
                        validJson: ValidJSONStep.internalBinaryRead(reader, reader.uint32(), options, message.step.validJson)
                    };
                    break;
                case /* protos.steps.SchemaValidationStep schema_validation */ 1009:
                    message.step = {
                        oneofKind: "schemaValidation",
                        schemaValidation: SchemaValidationStep.internalBinaryRead(reader, reader.uint32(), options, message.step.schemaValidation)
                    };
                    break;
                case /* optional string _wasm_id */ 10000:
                    message.WasmId = reader.string();
                    break;
                case /* optional bytes _wasm_bytes */ 10001:
                    message.WasmBytes = reader.bytes();
                    break;
                case /* optional string _wasm_function */ 10002:
                    message.WasmFunction = reader.string();
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
        /* string name = 1; */
        if (message.name !== "")
            writer.tag(1, WireType.LengthDelimited).string(message.name);
        /* protos.PipelineStepConditions on_true = 2; */
        if (message.onTrue)
            PipelineStepConditions.internalBinaryWrite(message.onTrue, writer.tag(2, WireType.LengthDelimited).fork(), options).join();
        /* protos.PipelineStepConditions on_false = 3; */
        if (message.onFalse)
            PipelineStepConditions.internalBinaryWrite(message.onFalse, writer.tag(3, WireType.LengthDelimited).fork(), options).join();
        /* bool dynamic = 4; */
        if (message.dynamic !== false)
            writer.tag(4, WireType.Varint).bool(message.dynamic);
        /* protos.PipelineStepConditions on_error = 5; */
        if (message.onError)
            PipelineStepConditions.internalBinaryWrite(message.onError, writer.tag(5, WireType.LengthDelimited).fork(), options).join();
        /* protos.steps.DetectiveStep detective = 1000; */
        if (message.step.oneofKind === "detective")
            DetectiveStep.internalBinaryWrite(message.step.detective, writer.tag(1000, WireType.LengthDelimited).fork(), options).join();
        /* protos.steps.TransformStep transform = 1001; */
        if (message.step.oneofKind === "transform")
            TransformStep.internalBinaryWrite(message.step.transform, writer.tag(1001, WireType.LengthDelimited).fork(), options).join();
        /* protos.steps.EncodeStep encode = 1002; */
        if (message.step.oneofKind === "encode")
            EncodeStep.internalBinaryWrite(message.step.encode, writer.tag(1002, WireType.LengthDelimited).fork(), options).join();
        /* protos.steps.DecodeStep decode = 1003; */
        if (message.step.oneofKind === "decode")
            DecodeStep.internalBinaryWrite(message.step.decode, writer.tag(1003, WireType.LengthDelimited).fork(), options).join();
        /* protos.steps.CustomStep custom = 1004; */
        if (message.step.oneofKind === "custom")
            CustomStep.internalBinaryWrite(message.step.custom, writer.tag(1004, WireType.LengthDelimited).fork(), options).join();
        /* protos.steps.HttpRequestStep http_request = 1005; */
        if (message.step.oneofKind === "httpRequest")
            HttpRequestStep.internalBinaryWrite(message.step.httpRequest, writer.tag(1005, WireType.LengthDelimited).fork(), options).join();
        /* protos.steps.KVStep kv = 1006; */
        if (message.step.oneofKind === "kv")
            KVStep.internalBinaryWrite(message.step.kv, writer.tag(1006, WireType.LengthDelimited).fork(), options).join();
        /* protos.steps.InferSchemaStep infer_schema = 1007; */
        if (message.step.oneofKind === "inferSchema")
            InferSchemaStep.internalBinaryWrite(message.step.inferSchema, writer.tag(1007, WireType.LengthDelimited).fork(), options).join();
        /* protos.steps.ValidJSONStep valid_json = 1008; */
        if (message.step.oneofKind === "validJson")
            ValidJSONStep.internalBinaryWrite(message.step.validJson, writer.tag(1008, WireType.LengthDelimited).fork(), options).join();
        /* protos.steps.SchemaValidationStep schema_validation = 1009; */
        if (message.step.oneofKind === "schemaValidation")
            SchemaValidationStep.internalBinaryWrite(message.step.schemaValidation, writer.tag(1009, WireType.LengthDelimited).fork(), options).join();
        /* optional string _wasm_id = 10000; */
        if (message.WasmId !== undefined)
            writer.tag(10000, WireType.LengthDelimited).string(message.WasmId);
        /* optional bytes _wasm_bytes = 10001; */
        if (message.WasmBytes !== undefined)
            writer.tag(10001, WireType.LengthDelimited).bytes(message.WasmBytes);
        /* optional string _wasm_function = 10002; */
        if (message.WasmFunction !== undefined)
            writer.tag(10002, WireType.LengthDelimited).string(message.WasmFunction);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.PipelineStep
 */
export const PipelineStep = new PipelineStep$Type();
// @generated message type with reflection information, may provide speed optimized methods
class PipelineConfigs$Type extends MessageType {
    constructor() {
        super("protos.PipelineConfigs", [
            { no: 1, name: "configs", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => PipelineConfig },
            { no: 1000, name: "_is_empty", kind: "scalar", opt: true, T: 8 /*ScalarType.BOOL*/ },
            { no: 1001, name: "_created_by", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value) {
        const message = { configs: [] };
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
                case /* repeated protos.PipelineConfig configs */ 1:
                    message.configs.push(PipelineConfig.internalBinaryRead(reader, reader.uint32(), options));
                    break;
                case /* optional bool _is_empty */ 1000:
                    message.IsEmpty = reader.bool();
                    break;
                case /* optional string _created_by */ 1001:
                    message.CreatedBy = reader.string();
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
        /* repeated protos.PipelineConfig configs = 1; */
        for (let i = 0; i < message.configs.length; i++)
            PipelineConfig.internalBinaryWrite(message.configs[i], writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        /* optional bool _is_empty = 1000; */
        if (message.IsEmpty !== undefined)
            writer.tag(1000, WireType.Varint).bool(message.IsEmpty);
        /* optional string _created_by = 1001; */
        if (message.CreatedBy !== undefined)
            writer.tag(1001, WireType.LengthDelimited).string(message.CreatedBy);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.PipelineConfigs
 */
export const PipelineConfigs = new PipelineConfigs$Type();
// @generated message type with reflection information, may provide speed optimized methods
class PipelineConfig$Type extends MessageType {
    constructor() {
        super("protos.PipelineConfig", [
            { no: 1, name: "id", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "paused", kind: "scalar", T: 8 /*ScalarType.BOOL*/ },
            { no: 3, name: "created_at_unix_ts_utc", kind: "scalar", T: 3 /*ScalarType.INT64*/ }
        ]);
    }
    create(value) {
        const message = { id: "", paused: false, createdAtUnixTsUtc: "0" };
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
                case /* string id */ 1:
                    message.id = reader.string();
                    break;
                case /* bool paused */ 2:
                    message.paused = reader.bool();
                    break;
                case /* int64 created_at_unix_ts_utc */ 3:
                    message.createdAtUnixTsUtc = reader.int64().toString();
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
        /* string id = 1; */
        if (message.id !== "")
            writer.tag(1, WireType.LengthDelimited).string(message.id);
        /* bool paused = 2; */
        if (message.paused !== false)
            writer.tag(2, WireType.Varint).bool(message.paused);
        /* int64 created_at_unix_ts_utc = 3; */
        if (message.createdAtUnixTsUtc !== "0")
            writer.tag(3, WireType.Varint).int64(message.createdAtUnixTsUtc);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.PipelineConfig
 */
export const PipelineConfig = new PipelineConfig$Type();
