"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WASMResponse = exports.WASMRequest = exports.WASMExitCode = void 0;
const runtime_1 = require("@protobuf-ts/runtime");
const runtime_2 = require("@protobuf-ts/runtime");
const runtime_3 = require("@protobuf-ts/runtime");
const runtime_4 = require("@protobuf-ts/runtime");
const runtime_5 = require("@protobuf-ts/runtime");
const sp_pipeline_1 = require("./sp_pipeline");
/**
 * Included in WASM response; the SDK should use the WASMExitCode to determine
 * what to do next - should it execute next step, should it notify or should it
 * stop executing/abort the rest of the steps in the pipeline.
 *
 * Example:
 *
 * a. WASM func returns WASM_EXIT_CODE_FAILURE - read PipelineStep.on_failure
 * conditions to determine what to do next.
 *
 * b. WASM func returns WASM_EXIT_CODE_SUCCESS - read PipelineStep.on_success
 * conditions to determine what to do next.
 *
 * .. and so on.
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
     * @generated from protobuf enum value: WASM_EXIT_CODE_SUCCESS = 1;
     */
    WASMExitCode[WASMExitCode["WASM_EXIT_CODE_SUCCESS"] = 1] = "WASM_EXIT_CODE_SUCCESS";
    /**
     * Probably need better names for these as FAILURE is too harsh
     *
     * @generated from protobuf enum value: WASM_EXIT_CODE_FAILURE = 2;
     */
    WASMExitCode[WASMExitCode["WASM_EXIT_CODE_FAILURE"] = 2] = "WASM_EXIT_CODE_FAILURE";
    /**
     * @generated from protobuf enum value: WASM_EXIT_CODE_INTERNAL_ERROR = 3;
     */
    WASMExitCode[WASMExitCode["WASM_EXIT_CODE_INTERNAL_ERROR"] = 3] = "WASM_EXIT_CODE_INTERNAL_ERROR";
})(WASMExitCode || (exports.WASMExitCode = WASMExitCode = {}));
// @generated message type with reflection information, may provide speed optimized methods
class WASMRequest$Type extends runtime_5.MessageType {
    constructor() {
        super("protos.WASMRequest", [
            { no: 1, name: "step", kind: "message", T: () => sp_pipeline_1.PipelineStep },
            { no: 2, name: "input_payload", kind: "scalar", T: 12 /*ScalarType.BYTES*/ },
            { no: 3, name: "input_step", kind: "scalar", opt: true, T: 12 /*ScalarType.BYTES*/ }
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
            { no: 4, name: "output_step", kind: "scalar", opt: true, T: 12 /*ScalarType.BYTES*/ }
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
