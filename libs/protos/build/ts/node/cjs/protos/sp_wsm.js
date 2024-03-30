"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wasm = exports.InterStepResult = exports.WASMResponse = exports.WASMRequest = exports.WASMExitCode = void 0;
const runtime_1 = require("@protobuf-ts/runtime");
const runtime_2 = require("@protobuf-ts/runtime");
const runtime_3 = require("@protobuf-ts/runtime");
const runtime_4 = require("@protobuf-ts/runtime");
const runtime_5 = require("@protobuf-ts/runtime");
const sp_steps_detective_1 = require("./steps/sp_steps_detective");
const sp_pipeline_1 = require("./sp_pipeline");
/**
 * Included in Wasm response; the SDK should use the WASMExitCode to determine
 * what to do next - should it execute next step, should it notify or should it
 * stop execution/abort the rest of the steps in current or all pipelines.
 *
 * Example:
 *
 * a. Wasm func returns WASM_EXIT_CODE_FALSE - read PipelineStep.on_false
 * conditions to determine what to do next.
 *
 * b. Wasm func returns WASM_EXIT_CODE_TRUE - read PipelineStep.on_true
 * conditions to determine what to do next.
 *
 * .. and so on.
 * TODO: This might be a dupe - should Wasm use ExecStatus instead of this?
 * protolint:disable:next ENUM_FIELD_NAMES_PREFIX
 *
 * @generated from protobuf enum protos.WASMExitCode
 */
var WASMExitCode;
(function (WASMExitCode) {
    /**
     * @generated from protobuf enum value: WASM_EXIT_CODE_UNSET = 0;
     */
    WASMExitCode[WASMExitCode["WASM_EXIT_CODE_UNSET"] = 0] = "WASM_EXIT_CODE_UNSET";
    /**
     * @generated from protobuf enum value: WASM_EXIT_CODE_TRUE = 1;
     */
    WASMExitCode[WASMExitCode["WASM_EXIT_CODE_TRUE"] = 1] = "WASM_EXIT_CODE_TRUE";
    /**
     * @generated from protobuf enum value: WASM_EXIT_CODE_FALSE = 2;
     */
    WASMExitCode[WASMExitCode["WASM_EXIT_CODE_FALSE"] = 2] = "WASM_EXIT_CODE_FALSE";
    /**
     * @generated from protobuf enum value: WASM_EXIT_CODE_ERROR = 3;
     */
    WASMExitCode[WASMExitCode["WASM_EXIT_CODE_ERROR"] = 3] = "WASM_EXIT_CODE_ERROR";
})(WASMExitCode || (exports.WASMExitCode = WASMExitCode = {}));
// @generated message type with reflection information, may provide speed optimized methods
class WASMRequest$Type extends runtime_5.MessageType {
    constructor() {
        super("protos.WASMRequest", [
            { no: 1, name: "step", kind: "message", T: () => sp_pipeline_1.PipelineStep },
            { no: 2, name: "input_payload", kind: "scalar", T: 12 /*ScalarType.BYTES*/ },
            { no: 3, name: "input_step", kind: "scalar", opt: true, T: 12 /*ScalarType.BYTES*/ },
            { no: 4, name: "inter_step_result", kind: "message", T: () => exports.InterStepResult }
        ]);
    }
    create(value) {
        const message = { inputPayload: new Uint8Array(0) };
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
                case /* protos.PipelineStep step */ 1:
                    message.step = sp_pipeline_1.PipelineStep.internalBinaryRead(reader, reader.uint32(), options, message.step);
                    break;
                case /* bytes input_payload */ 2:
                    message.inputPayload = reader.bytes();
                    break;
                case /* optional bytes input_step */ 3:
                    message.inputStep = reader.bytes();
                    break;
                case /* optional protos.InterStepResult inter_step_result */ 4:
                    message.interStepResult = exports.InterStepResult.internalBinaryRead(reader, reader.uint32(), options, message.interStepResult);
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
        /* protos.PipelineStep step = 1; */
        if (message.step)
            sp_pipeline_1.PipelineStep.internalBinaryWrite(message.step, writer.tag(1, runtime_1.WireType.LengthDelimited).fork(), options).join();
        /* bytes input_payload = 2; */
        if (message.inputPayload.length)
            writer.tag(2, runtime_1.WireType.LengthDelimited).bytes(message.inputPayload);
        /* optional bytes input_step = 3; */
        if (message.inputStep !== undefined)
            writer.tag(3, runtime_1.WireType.LengthDelimited).bytes(message.inputStep);
        /* optional protos.InterStepResult inter_step_result = 4; */
        if (message.interStepResult)
            exports.InterStepResult.internalBinaryWrite(message.interStepResult, writer.tag(4, runtime_1.WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.WASMRequest
 */
exports.WASMRequest = new WASMRequest$Type();
// @generated message type with reflection information, may provide speed optimized methods
class WASMResponse$Type extends runtime_5.MessageType {
    constructor() {
        super("protos.WASMResponse", [
            { no: 1, name: "output_payload", kind: "scalar", T: 12 /*ScalarType.BYTES*/ },
            { no: 2, name: "exit_code", kind: "enum", T: () => ["protos.WASMExitCode", WASMExitCode] },
            { no: 3, name: "exit_msg", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 4, name: "output_step", kind: "scalar", opt: true, T: 12 /*ScalarType.BYTES*/ },
            { no: 5, name: "inter_step_result", kind: "message", T: () => exports.InterStepResult }
        ]);
    }
    create(value) {
        const message = { outputPayload: new Uint8Array(0), exitCode: 0, exitMsg: "" };
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
                case /* bytes output_payload */ 1:
                    message.outputPayload = reader.bytes();
                    break;
                case /* protos.WASMExitCode exit_code */ 2:
                    message.exitCode = reader.int32();
                    break;
                case /* string exit_msg */ 3:
                    message.exitMsg = reader.string();
                    break;
                case /* optional bytes output_step */ 4:
                    message.outputStep = reader.bytes();
                    break;
                case /* optional protos.InterStepResult inter_step_result */ 5:
                    message.interStepResult = exports.InterStepResult.internalBinaryRead(reader, reader.uint32(), options, message.interStepResult);
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
        /* bytes output_payload = 1; */
        if (message.outputPayload.length)
            writer.tag(1, runtime_1.WireType.LengthDelimited).bytes(message.outputPayload);
        /* protos.WASMExitCode exit_code = 2; */
        if (message.exitCode !== 0)
            writer.tag(2, runtime_1.WireType.Varint).int32(message.exitCode);
        /* string exit_msg = 3; */
        if (message.exitMsg !== "")
            writer.tag(3, runtime_1.WireType.LengthDelimited).string(message.exitMsg);
        /* optional bytes output_step = 4; */
        if (message.outputStep !== undefined)
            writer.tag(4, runtime_1.WireType.LengthDelimited).bytes(message.outputStep);
        /* optional protos.InterStepResult inter_step_result = 5; */
        if (message.interStepResult)
            exports.InterStepResult.internalBinaryWrite(message.interStepResult, writer.tag(5, runtime_1.WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.WASMResponse
 */
exports.WASMResponse = new WASMResponse$Type();
// @generated message type with reflection information, may provide speed optimized methods
class InterStepResult$Type extends runtime_5.MessageType {
    constructor() {
        super("protos.InterStepResult", [
            { no: 1, name: "detective_result", kind: "message", oneof: "inputFrom", T: () => sp_steps_detective_1.DetectiveStepResult }
        ]);
    }
    create(value) {
        const message = { inputFrom: { oneofKind: undefined } };
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
                case /* protos.steps.DetectiveStepResult detective_result */ 1:
                    message.inputFrom = {
                        oneofKind: "detectiveResult",
                        detectiveResult: sp_steps_detective_1.DetectiveStepResult.internalBinaryRead(reader, reader.uint32(), options, message.inputFrom.detectiveResult)
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
        /* protos.steps.DetectiveStepResult detective_result = 1; */
        if (message.inputFrom.oneofKind === "detectiveResult")
            sp_steps_detective_1.DetectiveStepResult.internalBinaryWrite(message.inputFrom.detectiveResult, writer.tag(1, runtime_1.WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.InterStepResult
 */
exports.InterStepResult = new InterStepResult$Type();
// @generated message type with reflection information, may provide speed optimized methods
class Wasm$Type extends runtime_5.MessageType {
    constructor() {
        super("protos.Wasm", [
            { no: 1, name: "id", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "name", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 3, name: "bytes", kind: "scalar", T: 12 /*ScalarType.BYTES*/ },
            { no: 4, name: "function_name", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 5, name: "_bundled", kind: "scalar", T: 8 /*ScalarType.BOOL*/ },
            { no: 101, name: "description", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 102, name: "version", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 103, name: "url", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 1000, name: "_created_at_unix_ts_ns_utc", kind: "scalar", opt: true, T: 3 /*ScalarType.INT64*/ },
            { no: 1001, name: "_updated_at_unix_ts_ns_utc", kind: "scalar", opt: true, T: 3 /*ScalarType.INT64*/ }
        ]);
    }
    create(value) {
        const message = { id: "", name: "", bytes: new Uint8Array(0), functionName: "", Bundled: false };
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
                case /* bytes bytes */ 3:
                    message.bytes = reader.bytes();
                    break;
                case /* string function_name */ 4:
                    message.functionName = reader.string();
                    break;
                case /* bool _bundled */ 5:
                    message.Bundled = reader.bool();
                    break;
                case /* optional string description */ 101:
                    message.description = reader.string();
                    break;
                case /* optional string version */ 102:
                    message.version = reader.string();
                    break;
                case /* optional string url */ 103:
                    message.url = reader.string();
                    break;
                case /* optional int64 _created_at_unix_ts_ns_utc */ 1000:
                    message.CreatedAtUnixTsNsUtc = reader.int64().toString();
                    break;
                case /* optional int64 _updated_at_unix_ts_ns_utc */ 1001:
                    message.UpdatedAtUnixTsNsUtc = reader.int64().toString();
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
        /* bytes bytes = 3; */
        if (message.bytes.length)
            writer.tag(3, runtime_1.WireType.LengthDelimited).bytes(message.bytes);
        /* string function_name = 4; */
        if (message.functionName !== "")
            writer.tag(4, runtime_1.WireType.LengthDelimited).string(message.functionName);
        /* bool _bundled = 5; */
        if (message.Bundled !== false)
            writer.tag(5, runtime_1.WireType.Varint).bool(message.Bundled);
        /* optional string description = 101; */
        if (message.description !== undefined)
            writer.tag(101, runtime_1.WireType.LengthDelimited).string(message.description);
        /* optional string version = 102; */
        if (message.version !== undefined)
            writer.tag(102, runtime_1.WireType.LengthDelimited).string(message.version);
        /* optional string url = 103; */
        if (message.url !== undefined)
            writer.tag(103, runtime_1.WireType.LengthDelimited).string(message.url);
        /* optional int64 _created_at_unix_ts_ns_utc = 1000; */
        if (message.CreatedAtUnixTsNsUtc !== undefined)
            writer.tag(1000, runtime_1.WireType.Varint).int64(message.CreatedAtUnixTsNsUtc);
        /* optional int64 _updated_at_unix_ts_ns_utc = 1001; */
        if (message.UpdatedAtUnixTsNsUtc !== undefined)
            writer.tag(1001, runtime_1.WireType.Varint).int64(message.UpdatedAtUnixTsNsUtc);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.Wasm
 */
exports.Wasm = new Wasm$Type();
