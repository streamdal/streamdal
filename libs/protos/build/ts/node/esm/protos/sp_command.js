import { WireType } from "@protobuf-ts/runtime";
import { UnknownFieldHandler } from "@protobuf-ts/runtime";
import { reflectionMergePartial } from "@protobuf-ts/runtime";
import { MESSAGE_TYPE } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
import { TailRequest } from "./sp_common.js";
import { KVInstruction } from "./sp_kv.js";
import { Pipeline } from "./sp_pipeline.js";
import { Audience } from "./sp_common.js";
// @generated message type with reflection information, may provide speed optimized methods
class Command$Type extends MessageType {
    constructor() {
        super("protos.Command", [
            { no: 1, name: "audience", kind: "message", T: () => Audience },
            { no: 100, name: "attach_pipeline", kind: "message", oneof: "command", T: () => AttachPipelineCommand },
            { no: 101, name: "detach_pipeline", kind: "message", oneof: "command", T: () => DetachPipelineCommand },
            { no: 102, name: "pause_pipeline", kind: "message", oneof: "command", T: () => PausePipelineCommand },
            { no: 103, name: "resume_pipeline", kind: "message", oneof: "command", T: () => ResumePipelineCommand },
            { no: 104, name: "keep_alive", kind: "message", oneof: "command", T: () => KeepAliveCommand },
            { no: 105, name: "kv", kind: "message", oneof: "command", T: () => KVCommand },
            { no: 106, name: "tail", kind: "message", oneof: "command", T: () => TailCommand },
            { no: 107, name: "pipeline_list", kind: "message", oneof: "command", T: () => PipelineList }
        ]);
    }
    create(value) {
        const message = { command: { oneofKind: undefined } };
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
                case /* protos.Audience audience */ 1:
                    message.audience = Audience.internalBinaryRead(reader, reader.uint32(), options, message.audience);
                    break;
                case /* protos.AttachPipelineCommand attach_pipeline = 100 [deprecated = true];*/ 100:
                    message.command = {
                        oneofKind: "attachPipeline",
                        attachPipeline: AttachPipelineCommand.internalBinaryRead(reader, reader.uint32(), options, message.command.attachPipeline)
                    };
                    break;
                case /* protos.DetachPipelineCommand detach_pipeline = 101 [deprecated = true];*/ 101:
                    message.command = {
                        oneofKind: "detachPipeline",
                        detachPipeline: DetachPipelineCommand.internalBinaryRead(reader, reader.uint32(), options, message.command.detachPipeline)
                    };
                    break;
                case /* protos.PausePipelineCommand pause_pipeline */ 102:
                    message.command = {
                        oneofKind: "pausePipeline",
                        pausePipeline: PausePipelineCommand.internalBinaryRead(reader, reader.uint32(), options, message.command.pausePipeline)
                    };
                    break;
                case /* protos.ResumePipelineCommand resume_pipeline */ 103:
                    message.command = {
                        oneofKind: "resumePipeline",
                        resumePipeline: ResumePipelineCommand.internalBinaryRead(reader, reader.uint32(), options, message.command.resumePipeline)
                    };
                    break;
                case /* protos.KeepAliveCommand keep_alive */ 104:
                    message.command = {
                        oneofKind: "keepAlive",
                        keepAlive: KeepAliveCommand.internalBinaryRead(reader, reader.uint32(), options, message.command.keepAlive)
                    };
                    break;
                case /* protos.KVCommand kv */ 105:
                    message.command = {
                        oneofKind: "kv",
                        kv: KVCommand.internalBinaryRead(reader, reader.uint32(), options, message.command.kv)
                    };
                    break;
                case /* protos.TailCommand tail */ 106:
                    message.command = {
                        oneofKind: "tail",
                        tail: TailCommand.internalBinaryRead(reader, reader.uint32(), options, message.command.tail)
                    };
                    break;
                case /* protos.PipelineList pipeline_list */ 107:
                    message.command = {
                        oneofKind: "pipelineList",
                        pipelineList: PipelineList.internalBinaryRead(reader, reader.uint32(), options, message.command.pipelineList)
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
        /* protos.Audience audience = 1; */
        if (message.audience)
            Audience.internalBinaryWrite(message.audience, writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        /* protos.AttachPipelineCommand attach_pipeline = 100 [deprecated = true]; */
        if (message.command.oneofKind === "attachPipeline")
            AttachPipelineCommand.internalBinaryWrite(message.command.attachPipeline, writer.tag(100, WireType.LengthDelimited).fork(), options).join();
        /* protos.DetachPipelineCommand detach_pipeline = 101 [deprecated = true]; */
        if (message.command.oneofKind === "detachPipeline")
            DetachPipelineCommand.internalBinaryWrite(message.command.detachPipeline, writer.tag(101, WireType.LengthDelimited).fork(), options).join();
        /* protos.PausePipelineCommand pause_pipeline = 102; */
        if (message.command.oneofKind === "pausePipeline")
            PausePipelineCommand.internalBinaryWrite(message.command.pausePipeline, writer.tag(102, WireType.LengthDelimited).fork(), options).join();
        /* protos.ResumePipelineCommand resume_pipeline = 103; */
        if (message.command.oneofKind === "resumePipeline")
            ResumePipelineCommand.internalBinaryWrite(message.command.resumePipeline, writer.tag(103, WireType.LengthDelimited).fork(), options).join();
        /* protos.KeepAliveCommand keep_alive = 104; */
        if (message.command.oneofKind === "keepAlive")
            KeepAliveCommand.internalBinaryWrite(message.command.keepAlive, writer.tag(104, WireType.LengthDelimited).fork(), options).join();
        /* protos.KVCommand kv = 105; */
        if (message.command.oneofKind === "kv")
            KVCommand.internalBinaryWrite(message.command.kv, writer.tag(105, WireType.LengthDelimited).fork(), options).join();
        /* protos.TailCommand tail = 106; */
        if (message.command.oneofKind === "tail")
            TailCommand.internalBinaryWrite(message.command.tail, writer.tag(106, WireType.LengthDelimited).fork(), options).join();
        /* protos.PipelineList pipeline_list = 107; */
        if (message.command.oneofKind === "pipelineList")
            PipelineList.internalBinaryWrite(message.command.pipelineList, writer.tag(107, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.Command
 */
export const Command = new Command$Type();
// @generated message type with reflection information, may provide speed optimized methods
class PipelineList$Type extends MessageType {
    constructor() {
        super("protos.PipelineList", [
            { no: 1, name: "pipelines", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => Pipeline }
        ]);
    }
    create(value) {
        const message = { pipelines: [] };
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
                case /* repeated protos.Pipeline pipelines */ 1:
                    message.pipelines.push(Pipeline.internalBinaryRead(reader, reader.uint32(), options));
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
        /* repeated protos.Pipeline pipelines = 1; */
        for (let i = 0; i < message.pipelines.length; i++)
            Pipeline.internalBinaryWrite(message.pipelines[i], writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.PipelineList
 */
export const PipelineList = new PipelineList$Type();
// @generated message type with reflection information, may provide speed optimized methods
class AttachPipelineCommand$Type extends MessageType {
    constructor() {
        super("protos.AttachPipelineCommand", [
            { no: 1, name: "pipeline", kind: "message", T: () => Pipeline }
        ]);
    }
    create(value) {
        const message = {};
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
                case /* protos.Pipeline pipeline */ 1:
                    message.pipeline = Pipeline.internalBinaryRead(reader, reader.uint32(), options, message.pipeline);
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
        /* protos.Pipeline pipeline = 1; */
        if (message.pipeline)
            Pipeline.internalBinaryWrite(message.pipeline, writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.AttachPipelineCommand
 */
export const AttachPipelineCommand = new AttachPipelineCommand$Type();
// @generated message type with reflection information, may provide speed optimized methods
class DetachPipelineCommand$Type extends MessageType {
    constructor() {
        super("protos.DetachPipelineCommand", [
            { no: 1, name: "pipeline_id", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value) {
        const message = { pipelineId: "" };
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
                case /* string pipeline_id */ 1:
                    message.pipelineId = reader.string();
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
        /* string pipeline_id = 1; */
        if (message.pipelineId !== "")
            writer.tag(1, WireType.LengthDelimited).string(message.pipelineId);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.DetachPipelineCommand
 */
export const DetachPipelineCommand = new DetachPipelineCommand$Type();
// @generated message type with reflection information, may provide speed optimized methods
class PausePipelineCommand$Type extends MessageType {
    constructor() {
        super("protos.PausePipelineCommand", [
            { no: 1, name: "pipeline_id", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value) {
        const message = { pipelineId: "" };
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
                case /* string pipeline_id */ 1:
                    message.pipelineId = reader.string();
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
        /* string pipeline_id = 1; */
        if (message.pipelineId !== "")
            writer.tag(1, WireType.LengthDelimited).string(message.pipelineId);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.PausePipelineCommand
 */
export const PausePipelineCommand = new PausePipelineCommand$Type();
// @generated message type with reflection information, may provide speed optimized methods
class ResumePipelineCommand$Type extends MessageType {
    constructor() {
        super("protos.ResumePipelineCommand", [
            { no: 1, name: "pipeline_id", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value) {
        const message = { pipelineId: "" };
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
                case /* string pipeline_id */ 1:
                    message.pipelineId = reader.string();
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
        /* string pipeline_id = 1; */
        if (message.pipelineId !== "")
            writer.tag(1, WireType.LengthDelimited).string(message.pipelineId);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.ResumePipelineCommand
 */
export const ResumePipelineCommand = new ResumePipelineCommand$Type();
// @generated message type with reflection information, may provide speed optimized methods
class KeepAliveCommand$Type extends MessageType {
    constructor() {
        super("protos.KeepAliveCommand", []);
    }
    create(value) {
        const message = {};
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        return target !== null && target !== void 0 ? target : this.create();
    }
    internalBinaryWrite(message, writer, options) {
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.KeepAliveCommand
 */
export const KeepAliveCommand = new KeepAliveCommand$Type();
// @generated message type with reflection information, may provide speed optimized methods
class KVCommand$Type extends MessageType {
    constructor() {
        super("protos.KVCommand", [
            { no: 1, name: "instructions", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => KVInstruction },
            { no: 2, name: "overwrite", kind: "scalar", T: 8 /*ScalarType.BOOL*/ }
        ]);
    }
    create(value) {
        const message = { instructions: [], overwrite: false };
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
                case /* repeated protos.KVInstruction instructions */ 1:
                    message.instructions.push(KVInstruction.internalBinaryRead(reader, reader.uint32(), options));
                    break;
                case /* bool overwrite */ 2:
                    message.overwrite = reader.bool();
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
        /* repeated protos.KVInstruction instructions = 1; */
        for (let i = 0; i < message.instructions.length; i++)
            KVInstruction.internalBinaryWrite(message.instructions[i], writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        /* bool overwrite = 2; */
        if (message.overwrite !== false)
            writer.tag(2, WireType.Varint).bool(message.overwrite);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.KVCommand
 */
export const KVCommand = new KVCommand$Type();
// @generated message type with reflection information, may provide speed optimized methods
class TailCommand$Type extends MessageType {
    constructor() {
        super("protos.TailCommand", [
            { no: 2, name: "request", kind: "message", T: () => TailRequest }
        ]);
    }
    create(value) {
        const message = {};
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
                case /* protos.TailRequest request */ 2:
                    message.request = TailRequest.internalBinaryRead(reader, reader.uint32(), options, message.request);
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
        /* protos.TailRequest request = 2; */
        if (message.request)
            TailRequest.internalBinaryWrite(message.request, writer.tag(2, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.TailCommand
 */
export const TailCommand = new TailCommand$Type();
