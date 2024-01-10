import { WireType } from "@protobuf-ts/runtime";
import { UnknownFieldHandler } from "@protobuf-ts/runtime";
import { reflectionMergePartial } from "@protobuf-ts/runtime";
import { MESSAGE_TYPE } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
/**
 * @generated from protobuf enum protos.AbortStatus
 */
export var AbortStatus;
(function (AbortStatus) {
    /**
     * @generated from protobuf enum value: ABORT_STATUS_UNSET = 0;
     */
    AbortStatus[AbortStatus["UNSET"] = 0] = "UNSET";
    /**
     * @generated from protobuf enum value: ABORT_STATUS_CURRENT = 1;
     */
    AbortStatus[AbortStatus["CURRENT"] = 1] = "CURRENT";
    /**
     * @generated from protobuf enum value: ABORT_STATUS_ALL = 2;
     */
    AbortStatus[AbortStatus["ALL"] = 2] = "ALL";
    /**
     * @generated from protobuf enum value: ABORT_STATUS_DROP_MESSAGE = 3;
     */
    AbortStatus[AbortStatus["DROP_MESSAGE"] = 3] = "DROP_MESSAGE";
})(AbortStatus || (AbortStatus = {}));
// @generated message type with reflection information, may provide speed optimized methods
class SDKResponse$Type extends MessageType {
    constructor() {
        super("protos.SDKResponse", [
            { no: 1, name: "data", kind: "scalar", T: 12 /*ScalarType.BYTES*/ },
            { no: 2, name: "error", kind: "scalar", T: 8 /*ScalarType.BOOL*/ },
            { no: 3, name: "error_message", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 4, name: "pipeline_status", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => PipelineStatus },
            { no: 5, name: "drop_message", kind: "scalar", T: 8 /*ScalarType.BOOL*/ }
        ]);
    }
    create(value) {
        const message = { data: new Uint8Array(0), error: false, errorMessage: "", pipelineStatus: [], dropMessage: false };
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
                    message.pipelineStatus.push(PipelineStatus.internalBinaryRead(reader, reader.uint32(), options));
                    break;
                case /* bool drop_message */ 5:
                    message.dropMessage = reader.bool();
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
        /* bytes data = 1; */
        if (message.data.length)
            writer.tag(1, WireType.LengthDelimited).bytes(message.data);
        /* bool error = 2; */
        if (message.error !== false)
            writer.tag(2, WireType.Varint).bool(message.error);
        /* string error_message = 3; */
        if (message.errorMessage !== "")
            writer.tag(3, WireType.LengthDelimited).string(message.errorMessage);
        /* repeated protos.PipelineStatus pipeline_status = 4; */
        for (let i = 0; i < message.pipelineStatus.length; i++)
            PipelineStatus.internalBinaryWrite(message.pipelineStatus[i], writer.tag(4, WireType.LengthDelimited).fork(), options).join();
        /* bool drop_message = 5; */
        if (message.dropMessage !== false)
            writer.tag(5, WireType.Varint).bool(message.dropMessage);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.SDKResponse
 */
export const SDKResponse = new SDKResponse$Type();
// @generated message type with reflection information, may provide speed optimized methods
class PipelineStatus$Type extends MessageType {
    constructor() {
        super("protos.PipelineStatus", [
            { no: 1, name: "id", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "name", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 3, name: "step_status", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => StepStatus }
        ]);
    }
    create(value) {
        const message = { id: "", name: "", stepStatus: [] };
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
                case /* repeated protos.StepStatus step_status */ 3:
                    message.stepStatus.push(StepStatus.internalBinaryRead(reader, reader.uint32(), options));
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
        /* repeated protos.StepStatus step_status = 3; */
        for (let i = 0; i < message.stepStatus.length; i++)
            StepStatus.internalBinaryWrite(message.stepStatus[i], writer.tag(3, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.PipelineStatus
 */
export const PipelineStatus = new PipelineStatus$Type();
// @generated message type with reflection information, may provide speed optimized methods
class StepStatus$Type extends MessageType {
    constructor() {
        super("protos.StepStatus", [
            { no: 1, name: "name", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "error", kind: "scalar", T: 8 /*ScalarType.BOOL*/ },
            { no: 3, name: "error_message", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 4, name: "abort_status", kind: "enum", T: () => ["protos.AbortStatus", AbortStatus, "ABORT_STATUS_"] }
        ]);
    }
    create(value) {
        const message = { name: "", error: false, errorMessage: "", abortStatus: 0 };
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
                case /* bool error */ 2:
                    message.error = reader.bool();
                    break;
                case /* string error_message */ 3:
                    message.errorMessage = reader.string();
                    break;
                case /* protos.AbortStatus abort_status */ 4:
                    message.abortStatus = reader.int32();
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
        /* bool error = 2; */
        if (message.error !== false)
            writer.tag(2, WireType.Varint).bool(message.error);
        /* string error_message = 3; */
        if (message.errorMessage !== "")
            writer.tag(3, WireType.LengthDelimited).string(message.errorMessage);
        /* protos.AbortStatus abort_status = 4; */
        if (message.abortStatus !== 0)
            writer.tag(4, WireType.Varint).int32(message.abortStatus);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.StepStatus
 */
export const StepStatus = new StepStatus$Type();
