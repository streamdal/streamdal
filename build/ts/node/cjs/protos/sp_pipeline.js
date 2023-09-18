"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PipelineStep = exports.Pipeline = exports.PipelineStepCondition = void 0;
const runtime_1 = require("@protobuf-ts/runtime");
const runtime_2 = require("@protobuf-ts/runtime");
const runtime_3 = require("@protobuf-ts/runtime");
const runtime_4 = require("@protobuf-ts/runtime");
const runtime_5 = require("@protobuf-ts/runtime");
const sp_steps_inferschema_1 = require("./steps/sp_steps_inferschema");
const sp_steps_kv_1 = require("./steps/sp_steps_kv");
const sp_steps_httprequest_1 = require("./steps/sp_steps_httprequest");
const sp_steps_custom_1 = require("./steps/sp_steps_custom");
const sp_steps_decode_1 = require("./steps/sp_steps_decode");
const sp_steps_encode_1 = require("./steps/sp_steps_encode");
const sp_steps_transform_1 = require("./steps/sp_steps_transform");
const sp_steps_detective_1 = require("./steps/sp_steps_detective");
/**
 * A condition defines how the SDK should handle a step response -- should it
 * continue executing the pipeline, should it abort, should it notify the server?
 * Each step can have multiple conditions.
 *
 * @generated from protobuf enum protos.PipelineStepCondition
 */
var PipelineStepCondition;
(function (PipelineStepCondition) {
    /**
     * @generated from protobuf enum value: PIPELINE_STEP_CONDITION_UNSET = 0;
     */
    PipelineStepCondition[PipelineStepCondition["UNSET"] = 0] = "UNSET";
    /**
     * @generated from protobuf enum value: PIPELINE_STEP_CONDITION_ABORT = 1;
     */
    PipelineStepCondition[PipelineStepCondition["ABORT"] = 1] = "ABORT";
    /**
     * @generated from protobuf enum value: PIPELINE_STEP_CONDITION_NOTIFY = 2;
     */
    PipelineStepCondition[PipelineStepCondition["NOTIFY"] = 2] = "NOTIFY";
})(PipelineStepCondition || (exports.PipelineStepCondition = PipelineStepCondition = {}));
// @generated message type with reflection information, may provide speed optimized methods
class Pipeline$Type extends runtime_5.MessageType {
    constructor() {
        super("protos.Pipeline", [
            { no: 1, name: "id", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "name", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 3, name: "steps", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => exports.PipelineStep }
        ]);
    }
    create(value) {
        const message = { id: "", name: "", steps: [] };
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
                case /* string id */ 1:
                    message.id = reader.string();
                    break;
                case /* string name */ 2:
                    message.name = reader.string();
                    break;
                case /* repeated protos.PipelineStep steps */ 3:
                    message.steps.push(exports.PipelineStep.internalBinaryRead(reader, reader.uint32(), options));
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
        /* string id = 1; */
        if (message.id !== "")
            writer.tag(1, runtime_1.WireType.LengthDelimited).string(message.id);
        /* string name = 2; */
        if (message.name !== "")
            writer.tag(2, runtime_1.WireType.LengthDelimited).string(message.name);
        /* repeated protos.PipelineStep steps = 3; */
        for (let i = 0; i < message.steps.length; i++)
            exports.PipelineStep.internalBinaryWrite(message.steps[i], writer.tag(3, runtime_1.WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.Pipeline
 */
exports.Pipeline = new Pipeline$Type();
// @generated message type with reflection information, may provide speed optimized methods
class PipelineStep$Type extends runtime_5.MessageType {
    constructor() {
        super("protos.PipelineStep", [
            { no: 1, name: "name", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "on_success", kind: "enum", repeat: 1 /*RepeatType.PACKED*/, T: () => ["protos.PipelineStepCondition", PipelineStepCondition, "PIPELINE_STEP_CONDITION_"] },
            { no: 3, name: "on_failure", kind: "enum", repeat: 1 /*RepeatType.PACKED*/, T: () => ["protos.PipelineStepCondition", PipelineStepCondition, "PIPELINE_STEP_CONDITION_"] },
            { no: 1000, name: "detective", kind: "message", oneof: "step", T: () => sp_steps_detective_1.DetectiveStep },
            { no: 1001, name: "transform", kind: "message", oneof: "step", T: () => sp_steps_transform_1.TransformStep },
            { no: 1002, name: "encode", kind: "message", oneof: "step", T: () => sp_steps_encode_1.EncodeStep },
            { no: 1003, name: "decode", kind: "message", oneof: "step", T: () => sp_steps_decode_1.DecodeStep },
            { no: 1004, name: "custom", kind: "message", oneof: "step", T: () => sp_steps_custom_1.CustomStep },
            { no: 1005, name: "http_request", kind: "message", oneof: "step", T: () => sp_steps_httprequest_1.HttpRequestStep },
            { no: 1006, name: "kv", kind: "message", oneof: "step", T: () => sp_steps_kv_1.KVStep },
            { no: 1007, name: "infer_schema", kind: "message", oneof: "step", T: () => sp_steps_inferschema_1.InferSchemaStep },
            { no: 10000, name: "_wasm_id", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 10001, name: "_wasm_bytes", kind: "scalar", opt: true, T: 12 /*ScalarType.BYTES*/ },
            { no: 10002, name: "_wasm_function", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value) {
        const message = { name: "", onSuccess: [], onFailure: [], step: { oneofKind: undefined } };
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
                case /* string name */ 1:
                    message.name = reader.string();
                    break;
                case /* repeated protos.PipelineStepCondition on_success */ 2:
                    if (wireType === runtime_1.WireType.LengthDelimited)
                        for (let e = reader.int32() + reader.pos; reader.pos < e;)
                            message.onSuccess.push(reader.int32());
                    else
                        message.onSuccess.push(reader.int32());
                    break;
                case /* repeated protos.PipelineStepCondition on_failure */ 3:
                    if (wireType === runtime_1.WireType.LengthDelimited)
                        for (let e = reader.int32() + reader.pos; reader.pos < e;)
                            message.onFailure.push(reader.int32());
                    else
                        message.onFailure.push(reader.int32());
                    break;
                case /* protos.steps.DetectiveStep detective */ 1000:
                    message.step = {
                        oneofKind: "detective",
                        detective: sp_steps_detective_1.DetectiveStep.internalBinaryRead(reader, reader.uint32(), options, message.step.detective)
                    };
                    break;
                case /* protos.steps.TransformStep transform */ 1001:
                    message.step = {
                        oneofKind: "transform",
                        transform: sp_steps_transform_1.TransformStep.internalBinaryRead(reader, reader.uint32(), options, message.step.transform)
                    };
                    break;
                case /* protos.steps.EncodeStep encode */ 1002:
                    message.step = {
                        oneofKind: "encode",
                        encode: sp_steps_encode_1.EncodeStep.internalBinaryRead(reader, reader.uint32(), options, message.step.encode)
                    };
                    break;
                case /* protos.steps.DecodeStep decode */ 1003:
                    message.step = {
                        oneofKind: "decode",
                        decode: sp_steps_decode_1.DecodeStep.internalBinaryRead(reader, reader.uint32(), options, message.step.decode)
                    };
                    break;
                case /* protos.steps.CustomStep custom */ 1004:
                    message.step = {
                        oneofKind: "custom",
                        custom: sp_steps_custom_1.CustomStep.internalBinaryRead(reader, reader.uint32(), options, message.step.custom)
                    };
                    break;
                case /* protos.steps.HttpRequestStep http_request */ 1005:
                    message.step = {
                        oneofKind: "httpRequest",
                        httpRequest: sp_steps_httprequest_1.HttpRequestStep.internalBinaryRead(reader, reader.uint32(), options, message.step.httpRequest)
                    };
                    break;
                case /* protos.steps.KVStep kv */ 1006:
                    message.step = {
                        oneofKind: "kv",
                        kv: sp_steps_kv_1.KVStep.internalBinaryRead(reader, reader.uint32(), options, message.step.kv)
                    };
                    break;
                case /* protos.steps.InferSchemaStep infer_schema */ 1007:
                    message.step = {
                        oneofKind: "inferSchema",
                        inferSchema: sp_steps_inferschema_1.InferSchemaStep.internalBinaryRead(reader, reader.uint32(), options, message.step.inferSchema)
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
                        (u === true ? runtime_2.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message, writer, options) {
        /* string name = 1; */
        if (message.name !== "")
            writer.tag(1, runtime_1.WireType.LengthDelimited).string(message.name);
        /* repeated protos.PipelineStepCondition on_success = 2; */
        if (message.onSuccess.length) {
            writer.tag(2, runtime_1.WireType.LengthDelimited).fork();
            for (let i = 0; i < message.onSuccess.length; i++)
                writer.int32(message.onSuccess[i]);
            writer.join();
        }
        /* repeated protos.PipelineStepCondition on_failure = 3; */
        if (message.onFailure.length) {
            writer.tag(3, runtime_1.WireType.LengthDelimited).fork();
            for (let i = 0; i < message.onFailure.length; i++)
                writer.int32(message.onFailure[i]);
            writer.join();
        }
        /* protos.steps.DetectiveStep detective = 1000; */
        if (message.step.oneofKind === "detective")
            sp_steps_detective_1.DetectiveStep.internalBinaryWrite(message.step.detective, writer.tag(1000, runtime_1.WireType.LengthDelimited).fork(), options).join();
        /* protos.steps.TransformStep transform = 1001; */
        if (message.step.oneofKind === "transform")
            sp_steps_transform_1.TransformStep.internalBinaryWrite(message.step.transform, writer.tag(1001, runtime_1.WireType.LengthDelimited).fork(), options).join();
        /* protos.steps.EncodeStep encode = 1002; */
        if (message.step.oneofKind === "encode")
            sp_steps_encode_1.EncodeStep.internalBinaryWrite(message.step.encode, writer.tag(1002, runtime_1.WireType.LengthDelimited).fork(), options).join();
        /* protos.steps.DecodeStep decode = 1003; */
        if (message.step.oneofKind === "decode")
            sp_steps_decode_1.DecodeStep.internalBinaryWrite(message.step.decode, writer.tag(1003, runtime_1.WireType.LengthDelimited).fork(), options).join();
        /* protos.steps.CustomStep custom = 1004; */
        if (message.step.oneofKind === "custom")
            sp_steps_custom_1.CustomStep.internalBinaryWrite(message.step.custom, writer.tag(1004, runtime_1.WireType.LengthDelimited).fork(), options).join();
        /* protos.steps.HttpRequestStep http_request = 1005; */
        if (message.step.oneofKind === "httpRequest")
            sp_steps_httprequest_1.HttpRequestStep.internalBinaryWrite(message.step.httpRequest, writer.tag(1005, runtime_1.WireType.LengthDelimited).fork(), options).join();
        /* protos.steps.KVStep kv = 1006; */
        if (message.step.oneofKind === "kv")
            sp_steps_kv_1.KVStep.internalBinaryWrite(message.step.kv, writer.tag(1006, runtime_1.WireType.LengthDelimited).fork(), options).join();
        /* protos.steps.InferSchemaStep infer_schema = 1007; */
        if (message.step.oneofKind === "inferSchema")
            sp_steps_inferschema_1.InferSchemaStep.internalBinaryWrite(message.step.inferSchema, writer.tag(1007, runtime_1.WireType.LengthDelimited).fork(), options).join();
        /* optional string _wasm_id = 10000; */
        if (message.WasmId !== undefined)
            writer.tag(10000, runtime_1.WireType.LengthDelimited).string(message.WasmId);
        /* optional bytes _wasm_bytes = 10001; */
        if (message.WasmBytes !== undefined)
            writer.tag(10001, runtime_1.WireType.LengthDelimited).bytes(message.WasmBytes);
        /* optional string _wasm_function = 10002; */
        if (message.WasmFunction !== undefined)
            writer.tag(10002, runtime_1.WireType.LengthDelimited).string(message.WasmFunction);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.PipelineStep
 */
exports.PipelineStep = new PipelineStep$Type();
