import { WireType } from "@protobuf-ts/runtime";
import { UnknownFieldHandler } from "@protobuf-ts/runtime";
import { reflectionMergePartial } from "@protobuf-ts/runtime";
import { MESSAGE_TYPE } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
import { KVAction } from "./shared/sp_shared.js";
// @generated message type with reflection information, may provide speed optimized methods
class KVObject$Type extends MessageType {
    constructor() {
        super("protos.KVObject", [
            { no: 1, name: "key", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "value", kind: "scalar", T: 12 /*ScalarType.BYTES*/ },
            { no: 3, name: "created_at_unix_ts_nano_utc", kind: "scalar", T: 3 /*ScalarType.INT64*/ },
            { no: 4, name: "updated_at_unix_ts_nano_utc", kind: "scalar", T: 3 /*ScalarType.INT64*/ }
        ]);
    }
    create(value) {
        const message = { key: "", value: new Uint8Array(0), createdAtUnixTsNanoUtc: "0", updatedAtUnixTsNanoUtc: "0" };
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
                case /* string key */ 1:
                    message.key = reader.string();
                    break;
                case /* bytes value */ 2:
                    message.value = reader.bytes();
                    break;
                case /* int64 created_at_unix_ts_nano_utc */ 3:
                    message.createdAtUnixTsNanoUtc = reader.int64().toString();
                    break;
                case /* int64 updated_at_unix_ts_nano_utc */ 4:
                    message.updatedAtUnixTsNanoUtc = reader.int64().toString();
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
        /* string key = 1; */
        if (message.key !== "")
            writer.tag(1, WireType.LengthDelimited).string(message.key);
        /* bytes value = 2; */
        if (message.value.length)
            writer.tag(2, WireType.LengthDelimited).bytes(message.value);
        /* int64 created_at_unix_ts_nano_utc = 3; */
        if (message.createdAtUnixTsNanoUtc !== "0")
            writer.tag(3, WireType.Varint).int64(message.createdAtUnixTsNanoUtc);
        /* int64 updated_at_unix_ts_nano_utc = 4; */
        if (message.updatedAtUnixTsNanoUtc !== "0")
            writer.tag(4, WireType.Varint).int64(message.updatedAtUnixTsNanoUtc);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.KVObject
 */
export const KVObject = new KVObject$Type();
// @generated message type with reflection information, may provide speed optimized methods
class KVInstruction$Type extends MessageType {
    constructor() {
        super("protos.KVInstruction", [
            { no: 1, name: "id", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "action", kind: "enum", T: () => ["protos.shared.KVAction", KVAction] },
            { no: 3, name: "object", kind: "message", T: () => KVObject },
            { no: 4, name: "requested_at_unix_ts_nano_utc", kind: "scalar", T: 3 /*ScalarType.INT64*/ }
        ]);
    }
    create(value) {
        const message = { id: "", action: 0, requestedAtUnixTsNanoUtc: "0" };
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
                case /* protos.shared.KVAction action */ 2:
                    message.action = reader.int32();
                    break;
                case /* protos.KVObject object */ 3:
                    message.object = KVObject.internalBinaryRead(reader, reader.uint32(), options, message.object);
                    break;
                case /* int64 requested_at_unix_ts_nano_utc */ 4:
                    message.requestedAtUnixTsNanoUtc = reader.int64().toString();
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
        /* protos.shared.KVAction action = 2; */
        if (message.action !== 0)
            writer.tag(2, WireType.Varint).int32(message.action);
        /* protos.KVObject object = 3; */
        if (message.object)
            KVObject.internalBinaryWrite(message.object, writer.tag(3, WireType.LengthDelimited).fork(), options).join();
        /* int64 requested_at_unix_ts_nano_utc = 4; */
        if (message.requestedAtUnixTsNanoUtc !== "0")
            writer.tag(4, WireType.Varint).int64(message.requestedAtUnixTsNanoUtc);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.KVInstruction
 */
export const KVInstruction = new KVInstruction$Type();
// @generated message type with reflection information, may provide speed optimized methods
class KVRequest$Type extends MessageType {
    constructor() {
        super("protos.KVRequest", [
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
 * @generated MessageType for protobuf message protos.KVRequest
 */
export const KVRequest = new KVRequest$Type();
// @generated message type with reflection information, may provide speed optimized methods
class KVCreateHTTPRequest$Type extends MessageType {
    constructor() {
        super("protos.KVCreateHTTPRequest", [
            { no: 1, name: "kvs", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => KVObject },
            { no: 2, name: "overwrite", kind: "scalar", T: 8 /*ScalarType.BOOL*/ }
        ]);
    }
    create(value) {
        const message = { kvs: [], overwrite: false };
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
                case /* repeated protos.KVObject kvs */ 1:
                    message.kvs.push(KVObject.internalBinaryRead(reader, reader.uint32(), options));
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
        /* repeated protos.KVObject kvs = 1; */
        for (let i = 0; i < message.kvs.length; i++)
            KVObject.internalBinaryWrite(message.kvs[i], writer.tag(1, WireType.LengthDelimited).fork(), options).join();
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
 * @generated MessageType for protobuf message protos.KVCreateHTTPRequest
 */
export const KVCreateHTTPRequest = new KVCreateHTTPRequest$Type();
// @generated message type with reflection information, may provide speed optimized methods
class KVUpdateHTTPRequest$Type extends MessageType {
    constructor() {
        super("protos.KVUpdateHTTPRequest", [
            { no: 1, name: "kvs", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => KVObject }
        ]);
    }
    create(value) {
        const message = { kvs: [] };
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
                case /* repeated protos.KVObject kvs */ 1:
                    message.kvs.push(KVObject.internalBinaryRead(reader, reader.uint32(), options));
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
        /* repeated protos.KVObject kvs = 1; */
        for (let i = 0; i < message.kvs.length; i++)
            KVObject.internalBinaryWrite(message.kvs[i], writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.KVUpdateHTTPRequest
 */
export const KVUpdateHTTPRequest = new KVUpdateHTTPRequest$Type();
