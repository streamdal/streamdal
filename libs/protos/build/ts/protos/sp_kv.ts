// @generated by protobuf-ts 2.9.0 with parameter long_type_string
// @generated from protobuf file "sp_kv.proto" (package "protos", syntax proto3)
// tslint:disable
import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import { WireType } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import { UnknownFieldHandler } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { reflectionMergePartial } from "@protobuf-ts/runtime";
import { MESSAGE_TYPE } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
import { KVAction } from "./shared/sp_shared.js";
/**
 * KVObject represents a single KV object used in protos.KVInstruction; this is
 * constructed by server and broadcast out to other server nodes.
 *
 * @generated from protobuf message protos.KVObject
 */
export interface KVObject {
    /**
     * Valid key regex: /^[a-zA-Z0-9_-:]+$/)
     *
     * @generated from protobuf field: string key = 1;
     */
    key: string;
    /**
     * KV value
     *
     * @generated from protobuf field: bytes value = 2;
     */
    value: Uint8Array;
    /**
     * When was this object created
     *
     * @generated from protobuf field: int64 created_at_unix_ts_nano_utc = 3;
     */
    createdAtUnixTsNanoUtc: string;
    /**
     * Last time the object was updated
     *
     * @generated from protobuf field: int64 updated_at_unix_ts_nano_utc = 4;
     */
    updatedAtUnixTsNanoUtc: string;
}
/**
 * Container for one or more KVObject's; server broadcasts KVCommand that
 * contains one or more of these instructions when a "POST /api/v1/kv" request
 * is made.
 *
 * @generated from protobuf message protos.KVInstruction
 */
export interface KVInstruction {
    /**
     * Unique ID for this instruction
     *
     * @generated from protobuf field: string id = 1;
     */
    id: string;
    /**
     * What kind of an action is this?
     *
     * @generated from protobuf field: protos.shared.KVAction action = 2;
     */
    action: KVAction;
    /**
     * KV object
     *
     * @generated from protobuf field: protos.KVObject object = 3;
     */
    object?: KVObject;
    /**
     * When this instruction was requested (usually will be the HTTP API request time)
     *
     * @generated from protobuf field: int64 requested_at_unix_ts_nano_utc = 4;
     */
    requestedAtUnixTsNanoUtc: string;
}
/**
 * Used for broadcasting KV instructions to other server nodes.
 * NOTE: While this data structure is similar to KVCommand it makes sense to
 * keep them separate. It would cause more confusion if we tried to re-use
 * KVCommand for the purpose of broadcasting AND for sending SDK commands. ~DS
 *
 * This request structure is used for including all updates - create/update/delete.
 *
 * @generated from protobuf message protos.KVRequest
 */
export interface KVRequest {
    /**
     * @generated from protobuf field: repeated protos.KVInstruction instructions = 1;
     */
    instructions: KVInstruction[];
    /**
     * @generated from protobuf field: bool overwrite = 2;
     */
    overwrite: boolean;
}
// /////////////////////// Data Types Used in APIs /////////////////////////////

/**
 * "POST /api/v1/kv" accepts JSON of this type for it's request payload. This is
 * converted by BroadcastKV() to a KVCommand
 *
 * @generated from protobuf message protos.KVCreateHTTPRequest
 */
export interface KVCreateHTTPRequest {
    /**
     * @generated from protobuf field: repeated protos.KVObject kvs = 1;
     */
    kvs: KVObject[];
    /**
     * Whether to treat create as upsert -- ie. do not error if key already exists
     *
     * @generated from protobuf field: bool overwrite = 2;
     */
    overwrite: boolean;
}
/**
 * @generated from protobuf message protos.KVUpdateHTTPRequest
 */
export interface KVUpdateHTTPRequest {
    /**
     * @generated from protobuf field: repeated protos.KVObject kvs = 1;
     */
    kvs: KVObject[];
}
// @generated message type with reflection information, may provide speed optimized methods
class KVObject$Type extends MessageType<KVObject> {
    constructor() {
        super("protos.KVObject", [
            { no: 1, name: "key", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "value", kind: "scalar", T: 12 /*ScalarType.BYTES*/ },
            { no: 3, name: "created_at_unix_ts_nano_utc", kind: "scalar", T: 3 /*ScalarType.INT64*/ },
            { no: 4, name: "updated_at_unix_ts_nano_utc", kind: "scalar", T: 3 /*ScalarType.INT64*/ }
        ]);
    }
    create(value?: PartialMessage<KVObject>): KVObject {
        const message = { key: "", value: new Uint8Array(0), createdAtUnixTsNanoUtc: "0", updatedAtUnixTsNanoUtc: "0" };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<KVObject>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: KVObject): KVObject {
        let message = target ?? this.create(), end = reader.pos + length;
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
    internalBinaryWrite(message: KVObject, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
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
class KVInstruction$Type extends MessageType<KVInstruction> {
    constructor() {
        super("protos.KVInstruction", [
            { no: 1, name: "id", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "action", kind: "enum", T: () => ["protos.shared.KVAction", KVAction] },
            { no: 3, name: "object", kind: "message", T: () => KVObject },
            { no: 4, name: "requested_at_unix_ts_nano_utc", kind: "scalar", T: 3 /*ScalarType.INT64*/ }
        ]);
    }
    create(value?: PartialMessage<KVInstruction>): KVInstruction {
        const message = { id: "", action: 0, requestedAtUnixTsNanoUtc: "0" };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<KVInstruction>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: KVInstruction): KVInstruction {
        let message = target ?? this.create(), end = reader.pos + length;
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
    internalBinaryWrite(message: KVInstruction, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
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
class KVRequest$Type extends MessageType<KVRequest> {
    constructor() {
        super("protos.KVRequest", [
            { no: 1, name: "instructions", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => KVInstruction },
            { no: 2, name: "overwrite", kind: "scalar", T: 8 /*ScalarType.BOOL*/ }
        ]);
    }
    create(value?: PartialMessage<KVRequest>): KVRequest {
        const message = { instructions: [], overwrite: false };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<KVRequest>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: KVRequest): KVRequest {
        let message = target ?? this.create(), end = reader.pos + length;
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
    internalBinaryWrite(message: KVRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
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
class KVCreateHTTPRequest$Type extends MessageType<KVCreateHTTPRequest> {
    constructor() {
        super("protos.KVCreateHTTPRequest", [
            { no: 1, name: "kvs", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => KVObject },
            { no: 2, name: "overwrite", kind: "scalar", T: 8 /*ScalarType.BOOL*/ }
        ]);
    }
    create(value?: PartialMessage<KVCreateHTTPRequest>): KVCreateHTTPRequest {
        const message = { kvs: [], overwrite: false };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<KVCreateHTTPRequest>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: KVCreateHTTPRequest): KVCreateHTTPRequest {
        let message = target ?? this.create(), end = reader.pos + length;
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
    internalBinaryWrite(message: KVCreateHTTPRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
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
class KVUpdateHTTPRequest$Type extends MessageType<KVUpdateHTTPRequest> {
    constructor() {
        super("protos.KVUpdateHTTPRequest", [
            { no: 1, name: "kvs", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => KVObject }
        ]);
    }
    create(value?: PartialMessage<KVUpdateHTTPRequest>): KVUpdateHTTPRequest {
        const message = { kvs: [] };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<KVUpdateHTTPRequest>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: KVUpdateHTTPRequest): KVUpdateHTTPRequest {
        let message = target ?? this.create(), end = reader.pos + length;
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
    internalBinaryWrite(message: KVUpdateHTTPRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
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
