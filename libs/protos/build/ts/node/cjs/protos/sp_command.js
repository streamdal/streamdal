"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TailCommand = exports.KVCommand = exports.KeepAliveCommand = exports.SetPipelinesCommand = exports.Command = void 0;
const runtime_1 = require("@protobuf-ts/runtime");
const runtime_2 = require("@protobuf-ts/runtime");
const runtime_3 = require("@protobuf-ts/runtime");
const runtime_4 = require("@protobuf-ts/runtime");
const runtime_5 = require("@protobuf-ts/runtime");
const sp_common_1 = require("./sp_common");
const sp_kv_1 = require("./sp_kv");
const sp_pipeline_1 = require("./sp_pipeline");
const sp_common_2 = require("./sp_common");
// @generated message type with reflection information, may provide speed optimized methods
class Command$Type extends runtime_5.MessageType {
    constructor() {
        super("protos.Command", [
            { no: 1, name: "audience", kind: "message", T: () => sp_common_2.Audience },
            { no: 100, name: "set_pipelines", kind: "message", oneof: "command", T: () => exports.SetPipelinesCommand },
            { no: 101, name: "keep_alive", kind: "message", oneof: "command", T: () => exports.KeepAliveCommand },
            { no: 102, name: "kv", kind: "message", oneof: "command", T: () => exports.KVCommand },
            { no: 103, name: "tail", kind: "message", oneof: "command", T: () => exports.TailCommand }
        ]);
    }
    create(value) {
        const message = { command: { oneofKind: undefined } };
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
                case /* protos.Audience audience */ 1:
                    message.audience = sp_common_2.Audience.internalBinaryRead(reader, reader.uint32(), options, message.audience);
                    break;
                case /* protos.SetPipelinesCommand set_pipelines */ 100:
                    message.command = {
                        oneofKind: "setPipelines",
                        setPipelines: exports.SetPipelinesCommand.internalBinaryRead(reader, reader.uint32(), options, message.command.setPipelines)
                    };
                    break;
                case /* protos.KeepAliveCommand keep_alive */ 101:
                    message.command = {
                        oneofKind: "keepAlive",
                        keepAlive: exports.KeepAliveCommand.internalBinaryRead(reader, reader.uint32(), options, message.command.keepAlive)
                    };
                    break;
                case /* protos.KVCommand kv */ 102:
                    message.command = {
                        oneofKind: "kv",
                        kv: exports.KVCommand.internalBinaryRead(reader, reader.uint32(), options, message.command.kv)
                    };
                    break;
                case /* protos.TailCommand tail */ 103:
                    message.command = {
                        oneofKind: "tail",
                        tail: exports.TailCommand.internalBinaryRead(reader, reader.uint32(), options, message.command.tail)
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
        /* protos.Audience audience = 1; */
        if (message.audience)
            sp_common_2.Audience.internalBinaryWrite(message.audience, writer.tag(1, runtime_1.WireType.LengthDelimited).fork(), options).join();
        /* protos.SetPipelinesCommand set_pipelines = 100; */
        if (message.command.oneofKind === "setPipelines")
            exports.SetPipelinesCommand.internalBinaryWrite(message.command.setPipelines, writer.tag(100, runtime_1.WireType.LengthDelimited).fork(), options).join();
        /* protos.KeepAliveCommand keep_alive = 101; */
        if (message.command.oneofKind === "keepAlive")
            exports.KeepAliveCommand.internalBinaryWrite(message.command.keepAlive, writer.tag(101, runtime_1.WireType.LengthDelimited).fork(), options).join();
        /* protos.KVCommand kv = 102; */
        if (message.command.oneofKind === "kv")
            exports.KVCommand.internalBinaryWrite(message.command.kv, writer.tag(102, runtime_1.WireType.LengthDelimited).fork(), options).join();
        /* protos.TailCommand tail = 103; */
        if (message.command.oneofKind === "tail")
            exports.TailCommand.internalBinaryWrite(message.command.tail, writer.tag(103, runtime_1.WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.Command
 */
exports.Command = new Command$Type();
// @generated message type with reflection information, may provide speed optimized methods
class SetPipelinesCommand$Type extends runtime_5.MessageType {
    constructor() {
        super("protos.SetPipelinesCommand", [
            { no: 1, name: "pipelines", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => sp_pipeline_1.Pipeline }
        ]);
    }
    create(value) {
        const message = { pipelines: [] };
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
                case /* repeated protos.Pipeline pipelines */ 1:
                    message.pipelines.push(sp_pipeline_1.Pipeline.internalBinaryRead(reader, reader.uint32(), options));
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
        /* repeated protos.Pipeline pipelines = 1; */
        for (let i = 0; i < message.pipelines.length; i++)
            sp_pipeline_1.Pipeline.internalBinaryWrite(message.pipelines[i], writer.tag(1, runtime_1.WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.SetPipelinesCommand
 */
exports.SetPipelinesCommand = new SetPipelinesCommand$Type();
// @generated message type with reflection information, may provide speed optimized methods
class KeepAliveCommand$Type extends runtime_5.MessageType {
    constructor() {
        super("protos.KeepAliveCommand", []);
    }
    create(value) {
        const message = {};
        globalThis.Object.defineProperty(message, runtime_4.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            (0, runtime_3.reflectionMergePartial)(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        return target !== null && target !== void 0 ? target : this.create();
    }
    internalBinaryWrite(message, writer, options) {
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.KeepAliveCommand
 */
exports.KeepAliveCommand = new KeepAliveCommand$Type();
// @generated message type with reflection information, may provide speed optimized methods
class KVCommand$Type extends runtime_5.MessageType {
    constructor() {
        super("protos.KVCommand", [
            { no: 1, name: "instructions", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => sp_kv_1.KVInstruction },
            { no: 2, name: "overwrite", kind: "scalar", T: 8 /*ScalarType.BOOL*/ }
        ]);
    }
    create(value) {
        const message = { instructions: [], overwrite: false };
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
                case /* repeated protos.KVInstruction instructions */ 1:
                    message.instructions.push(sp_kv_1.KVInstruction.internalBinaryRead(reader, reader.uint32(), options));
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
                        (u === true ? runtime_2.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message, writer, options) {
        /* repeated protos.KVInstruction instructions = 1; */
        for (let i = 0; i < message.instructions.length; i++)
            sp_kv_1.KVInstruction.internalBinaryWrite(message.instructions[i], writer.tag(1, runtime_1.WireType.LengthDelimited).fork(), options).join();
        /* bool overwrite = 2; */
        if (message.overwrite !== false)
            writer.tag(2, runtime_1.WireType.Varint).bool(message.overwrite);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.KVCommand
 */
exports.KVCommand = new KVCommand$Type();
// @generated message type with reflection information, may provide speed optimized methods
class TailCommand$Type extends runtime_5.MessageType {
    constructor() {
        super("protos.TailCommand", [
            { no: 2, name: "request", kind: "message", T: () => sp_common_1.TailRequest }
        ]);
    }
    create(value) {
        const message = {};
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
                case /* protos.TailRequest request */ 2:
                    message.request = sp_common_1.TailRequest.internalBinaryRead(reader, reader.uint32(), options, message.request);
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
        /* protos.TailRequest request = 2; */
        if (message.request)
            sp_common_1.TailRequest.internalBinaryWrite(message.request, writer.tag(2, runtime_1.WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.TailCommand
 */
exports.TailCommand = new TailCommand$Type();
