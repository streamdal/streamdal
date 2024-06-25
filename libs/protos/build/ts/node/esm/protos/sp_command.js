import { WireType } from "@protobuf-ts/runtime";
import { UnknownFieldHandler } from "@protobuf-ts/runtime";
import { reflectionMergePartial } from "@protobuf-ts/runtime";
import { MESSAGE_TYPE } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
import { TailRequest } from "./sp_common.js";
import { KVInstruction } from "./sp_kv.js";
import { WasmModule } from "./shared/sp_shared.js";
import { Pipeline } from "./sp_pipeline.js";
import { Audience } from "./sp_common.js";
// @generated message type with reflection information, may provide speed optimized methods
class Command$Type extends MessageType {
    constructor() {
        super("protos.Command", [
            { no: 1, name: "audience", kind: "message", T: () => Audience },
            { no: 100, name: "set_pipelines", kind: "message", oneof: "command", T: () => SetPipelinesCommand },
            { no: 101, name: "keep_alive", kind: "message", oneof: "command", T: () => KeepAliveCommand },
            { no: 102, name: "kv", kind: "message", oneof: "command", T: () => KVCommand },
            { no: 103, name: "tail", kind: "message", oneof: "command", T: () => TailCommand },
            { no: 104, name: "delete", kind: "message", oneof: "command", T: () => DeleteAudiencesCommand }
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
                case /* protos.SetPipelinesCommand set_pipelines */ 100:
                    message.command = {
                        oneofKind: "setPipelines",
                        setPipelines: SetPipelinesCommand.internalBinaryRead(reader, reader.uint32(), options, message.command.setPipelines)
                    };
                    break;
                case /* protos.KeepAliveCommand keep_alive */ 101:
                    message.command = {
                        oneofKind: "keepAlive",
                        keepAlive: KeepAliveCommand.internalBinaryRead(reader, reader.uint32(), options, message.command.keepAlive)
                    };
                    break;
                case /* protos.KVCommand kv */ 102:
                    message.command = {
                        oneofKind: "kv",
                        kv: KVCommand.internalBinaryRead(reader, reader.uint32(), options, message.command.kv)
                    };
                    break;
                case /* protos.TailCommand tail */ 103:
                    message.command = {
                        oneofKind: "tail",
                        tail: TailCommand.internalBinaryRead(reader, reader.uint32(), options, message.command.tail)
                    };
                    break;
                case /* protos.DeleteAudiencesCommand delete */ 104:
                    message.command = {
                        oneofKind: "delete",
                        delete: DeleteAudiencesCommand.internalBinaryRead(reader, reader.uint32(), options, message.command.delete)
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
        /* protos.SetPipelinesCommand set_pipelines = 100; */
        if (message.command.oneofKind === "setPipelines")
            SetPipelinesCommand.internalBinaryWrite(message.command.setPipelines, writer.tag(100, WireType.LengthDelimited).fork(), options).join();
        /* protos.KeepAliveCommand keep_alive = 101; */
        if (message.command.oneofKind === "keepAlive")
            KeepAliveCommand.internalBinaryWrite(message.command.keepAlive, writer.tag(101, WireType.LengthDelimited).fork(), options).join();
        /* protos.KVCommand kv = 102; */
        if (message.command.oneofKind === "kv")
            KVCommand.internalBinaryWrite(message.command.kv, writer.tag(102, WireType.LengthDelimited).fork(), options).join();
        /* protos.TailCommand tail = 103; */
        if (message.command.oneofKind === "tail")
            TailCommand.internalBinaryWrite(message.command.tail, writer.tag(103, WireType.LengthDelimited).fork(), options).join();
        /* protos.DeleteAudiencesCommand delete = 104; */
        if (message.command.oneofKind === "delete")
            DeleteAudiencesCommand.internalBinaryWrite(message.command.delete, writer.tag(104, WireType.LengthDelimited).fork(), options).join();
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
class SetPipelinesCommand$Type extends MessageType {
    constructor() {
        super("protos.SetPipelinesCommand", [
            { no: 1, name: "pipelines", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => Pipeline },
            { no: 2, name: "wasm_modules", kind: "map", K: 9 /*ScalarType.STRING*/, V: { kind: "message", T: () => WasmModule } }
        ]);
    }
    create(value) {
        const message = { pipelines: [], wasmModules: {} };
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
                case /* map<string, protos.shared.WasmModule> wasm_modules */ 2:
                    this.binaryReadMap2(message.wasmModules, reader, options);
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
    binaryReadMap2(map, reader, options) {
        let len = reader.uint32(), end = reader.pos + len, key, val;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case 1:
                    key = reader.string();
                    break;
                case 2:
                    val = WasmModule.internalBinaryRead(reader, reader.uint32(), options);
                    break;
                default: throw new globalThis.Error("unknown map entry field for field protos.SetPipelinesCommand.wasm_modules");
            }
        }
        map[key !== null && key !== void 0 ? key : ""] = val !== null && val !== void 0 ? val : WasmModule.create();
    }
    internalBinaryWrite(message, writer, options) {
        /* repeated protos.Pipeline pipelines = 1; */
        for (let i = 0; i < message.pipelines.length; i++)
            Pipeline.internalBinaryWrite(message.pipelines[i], writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        /* map<string, protos.shared.WasmModule> wasm_modules = 2; */
        for (let k of Object.keys(message.wasmModules)) {
            writer.tag(2, WireType.LengthDelimited).fork().tag(1, WireType.LengthDelimited).string(k);
            writer.tag(2, WireType.LengthDelimited).fork();
            WasmModule.internalBinaryWrite(message.wasmModules[k], writer, options);
            writer.join().join();
        }
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.SetPipelinesCommand
 */
export const SetPipelinesCommand = new SetPipelinesCommand$Type();
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
// @generated message type with reflection information, may provide speed optimized methods
class DeleteAudiencesCommand$Type extends MessageType {
    constructor() {
        super("protos.DeleteAudiencesCommand", [
            { no: 1, name: "audience", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => Audience }
        ]);
    }
    create(value) {
        const message = { audience: [] };
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
                case /* repeated protos.Audience audience */ 1:
                    message.audience.push(Audience.internalBinaryRead(reader, reader.uint32(), options));
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
        /* repeated protos.Audience audience = 1; */
        for (let i = 0; i < message.audience.length; i++)
            Audience.internalBinaryWrite(message.audience[i], writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.DeleteAudiencesCommand
 */
export const DeleteAudiencesCommand = new DeleteAudiencesCommand$Type();
