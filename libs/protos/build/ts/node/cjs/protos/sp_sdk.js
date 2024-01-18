"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StepStatus = exports.PipelineStatus = exports.SDKResponse = void 0;
const runtime_1 = require("@protobuf-ts/runtime");
const runtime_2 = require("@protobuf-ts/runtime");
const runtime_3 = require("@protobuf-ts/runtime");
const runtime_4 = require("@protobuf-ts/runtime");
const runtime_5 = require("@protobuf-ts/runtime");
const sp_pipeline_1 = require("./sp_pipeline");
// @generated message type with reflection information, may provide speed optimized methods
class SDKResponse$Type extends runtime_5.MessageType {
    constructor() {
        super("protos.SDKResponse", [
            { no: 1, name: "data", kind: "scalar", T: 12 /*ScalarType.BYTES*/ },
            { no: 2, name: "error", kind: "scalar", T: 8 /*ScalarType.BOOL*/ },
            { no: 3, name: "error_message", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 4, name: "pipeline_status", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => exports.PipelineStatus },
            { no: 5, name: "metadata", kind: "map", K: 9 /*ScalarType.STRING*/, V: { kind: "scalar", T: 9 /*ScalarType.STRING*/ } }
        ]);
    }
    create(value) {
        const message = { data: new Uint8Array(0), error: false, errorMessage: "", pipelineStatus: [], metadata: {} };
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
                case /* bytes data */ 1:
                    message.data = reader.bytes();
                    break;
                case /* bool error */ 2:
                    message.error = reader.bool();
                    break;
                case /* string error_message */ 3:
                    message.errorMessage = reader.string();
                    break;
                case /* repeated protos.PipelineStatus pipeline_status */ 4:
                    message.pipelineStatus.push(exports.PipelineStatus.internalBinaryRead(reader, reader.uint32(), options));
                    break;
                case /* map<string, string> metadata */ 5:
                    this.binaryReadMap5(message.metadata, reader, options);
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
    binaryReadMap5(map, reader, options) {
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
                default: throw new globalThis.Error("unknown map entry field for field protos.SDKResponse.metadata");
            }
        }
        map[key !== null && key !== void 0 ? key : ""] = val !== null && val !== void 0 ? val : "";
    }
    internalBinaryWrite(message, writer, options) {
        /* bytes data = 1; */
        if (message.data.length)
            writer.tag(1, runtime_1.WireType.LengthDelimited).bytes(message.data);
        /* bool error = 2; */
        if (message.error !== false)
            writer.tag(2, runtime_1.WireType.Varint).bool(message.error);
        /* string error_message = 3; */
        if (message.errorMessage !== "")
            writer.tag(3, runtime_1.WireType.LengthDelimited).string(message.errorMessage);
        /* repeated protos.PipelineStatus pipeline_status = 4; */
        for (let i = 0; i < message.pipelineStatus.length; i++)
            exports.PipelineStatus.internalBinaryWrite(message.pipelineStatus[i], writer.tag(4, runtime_1.WireType.LengthDelimited).fork(), options).join();
        /* map<string, string> metadata = 5; */
        for (let k of Object.keys(message.metadata))
            writer.tag(5, runtime_1.WireType.LengthDelimited).fork().tag(1, runtime_1.WireType.LengthDelimited).string(k).tag(2, runtime_1.WireType.LengthDelimited).string(message.metadata[k]).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.SDKResponse
 */
exports.SDKResponse = new SDKResponse$Type();
// @generated message type with reflection information, may provide speed optimized methods
class PipelineStatus$Type extends runtime_5.MessageType {
    constructor() {
        super("protos.PipelineStatus", [
            { no: 1, name: "id", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "name", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 3, name: "step_status", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => exports.StepStatus }
        ]);
    }
    create(value) {
        const message = { id: "", name: "", stepStatus: [] };
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
                case /* repeated protos.StepStatus step_status */ 3:
                    message.stepStatus.push(exports.StepStatus.internalBinaryRead(reader, reader.uint32(), options));
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
        /* repeated protos.StepStatus step_status = 3; */
        for (let i = 0; i < message.stepStatus.length; i++)
            exports.StepStatus.internalBinaryWrite(message.stepStatus[i], writer.tag(3, runtime_1.WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.PipelineStatus
 */
exports.PipelineStatus = new PipelineStatus$Type();
// @generated message type with reflection information, may provide speed optimized methods
class StepStatus$Type extends runtime_5.MessageType {
    constructor() {
        super("protos.StepStatus", [
            { no: 1, name: "name", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "error", kind: "scalar", T: 8 /*ScalarType.BOOL*/ },
            { no: 3, name: "error_message", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 4, name: "abort_condition", kind: "enum", T: () => ["protos.AbortCondition", sp_pipeline_1.AbortCondition, "ABORT_CONDITION_"] }
        ]);
    }
    create(value) {
        const message = { name: "", error: false, errorMessage: "", abortCondition: 0 };
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
                case /* bool error */ 2:
                    message.error = reader.bool();
                    break;
                case /* string error_message */ 3:
                    message.errorMessage = reader.string();
                    break;
                case /* protos.AbortCondition abort_condition */ 4:
                    message.abortCondition = reader.int32();
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
        /* bool error = 2; */
        if (message.error !== false)
            writer.tag(2, runtime_1.WireType.Varint).bool(message.error);
        /* string error_message = 3; */
        if (message.errorMessage !== "")
            writer.tag(3, runtime_1.WireType.LengthDelimited).string(message.errorMessage);
        /* protos.AbortCondition abort_condition = 4; */
        if (message.abortCondition !== 0)
            writer.tag(4, runtime_1.WireType.Varint).int32(message.abortCondition);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.StepStatus
 */
exports.StepStatus = new StepStatus$Type();
