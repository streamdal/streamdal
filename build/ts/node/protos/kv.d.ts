import { MessageType } from "@protobuf-ts/runtime";
/**
 * Represents a single KV object
 *
 * @generated from protobuf message protos.KVObject
 */
export interface KVObject {
    /**
     * Key regex: /^[a-zA-Z0-9_-:]+$/)
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
    createdAtUnixTsNanoUtc: bigint;
    /**
     * Last time the object was updated
     *
     * @generated from protobuf field: int64 updated_at_unix_ts_nano_utc = 4;
     */
    updatedAtUnixTsNanoUtc: bigint;
}
/**
 * Container for one or more KVObject's; snitch-server broadcasts KVCommand that
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
     * @generated from protobuf field: protos.KVAction action = 2;
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
    requestedAtUnixTsNanoUtc: bigint;
}
/**
 * "POST /api/v1/kv" accepts JSON of this type for it's request payload. This is
 * converted by BroadcastKV() to a KVCommand
 *
 * @generated from protobuf message protos.KVCreateRequest
 */
export interface KVCreateRequest {
    /**
     * @generated from protobuf field: bool overwrite = 1;
     */
    overwrite: boolean;
    /**
     * @generated from protobuf field: repeated protos.KVObject kvs = 2;
     */
    kvs: KVObject[];
}
/**
 * @generated from protobuf enum protos.KVAction
 */
export declare enum KVAction {
    /**
     * protolint:disable:this ENUM_FIELD_NAMES_PREFIX
     *
     * @generated from protobuf enum value: KV_ACTION_UNSET = 0;
     */
    KV_ACTION_UNSET = 0,
    /**
     * protolint:disable:this ENUM_FIELD_NAMES_PREFIX
     *
     * @generated from protobuf enum value: KV_ACTION_CREATE = 1;
     */
    KV_ACTION_CREATE = 1,
    /**
     * protolint:disable:this ENUM_FIELD_NAMES_PREFIX
     *
     * @generated from protobuf enum value: KV_ACTION_UPDATE = 2;
     */
    KV_ACTION_UPDATE = 2,
    /**
     * protolint:disable:this ENUM_FIELD_NAMES_PREFIX
     *
     * @generated from protobuf enum value: KV_ACTION_DELETE = 3;
     */
    KV_ACTION_DELETE = 3
}
declare class KVObject$Type extends MessageType<KVObject> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.KVObject
 */
export declare const KVObject: KVObject$Type;
declare class KVInstruction$Type extends MessageType<KVInstruction> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.KVInstruction
 */
export declare const KVInstruction: KVInstruction$Type;
declare class KVCreateRequest$Type extends MessageType<KVCreateRequest> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.KVCreateRequest
 */
export declare const KVCreateRequest: KVCreateRequest$Type;
export {};
