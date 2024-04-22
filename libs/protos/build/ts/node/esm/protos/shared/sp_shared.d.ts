import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
/**
 * Main type representing a wasm module entry. Used by server for external.*Wasm()
 * methods; also used to ensure we only send the wasm module once per request
 * instead of duplicated in every pipeline where it is used. This prevents
 * over-sized payloads on SDK startup.
 *
 * @generated from protobuf message protos.shared.WasmModule
 */
export interface WasmModule {
    /**
     * ID is uuid(sha256(_wasm_bytes)) and is used for referencing the Wasm module
     *
     * @generated from protobuf field: string id = 1;
     */
    id: string;
    /**
     * Contents of the Wasm module
     *
     * @generated from protobuf field: bytes bytes = 2;
     */
    bytes: Uint8Array;
    /**
     * Entry point function name
     *
     * @generated from protobuf field: string function = 3;
     */
    function: string;
    /**
     * Friendly name for the Wasm module
     *
     * @generated from protobuf field: string name = 4;
     */
    name: string;
    /**
     * Filename of the Wasm module (used only for bundled wasm)
     *
     * @generated from protobuf field: string _filename = 5;
     */
    Filename: string;
    /**
     * Indicates whether this wasm entry is for bundled wasm or for wasm added via
     * CreateWasm(); ignored in CreateWasm() and UpdateWasm().
     *
     * @generated from protobuf field: bool _bundled = 6;
     */
    Bundled: boolean;
    /**
     * Informative, debug fields
     *
     * @generated from protobuf field: optional string description = 101;
     */
    description?: string;
    /**
     * @generated from protobuf field: optional string version = 102;
     */
    version?: string;
    /**
     * @generated from protobuf field: optional string url = 103;
     */
    url?: string;
    /**
     * Set by server
     *
     * @generated from protobuf field: optional int64 _created_at_unix_ts_ns_utc = 1000;
     */
    CreatedAtUnixTsNsUtc?: string;
    /**
     * Set by server
     *
     * @generated from protobuf field: optional int64 _updated_at_unix_ts_ns_utc = 1001;
     */
    UpdatedAtUnixTsNsUtc?: string;
    /**
     * Used internally by server and k8s operator to determine who manages this resource
     *
     * @generated from protobuf field: optional string _created_by = 1002;
     */
    CreatedBy?: string;
}
/**
 * KVAction is a shared type that is used for protos.KVCommand and protos.KVStep.
 * Note that only a subset of actions are used for protos.KVCommand (CREATE,
 * UPDATE, DELETE, DELETE_ALL) while protos.KVStep uses most of them.
 *
 * protolint:disable:next ENUM_FIELD_NAMES_PREFIX
 *
 * @generated from protobuf enum protos.shared.KVAction
 */
export declare enum KVAction {
    /**
     * @generated from protobuf enum value: KV_ACTION_UNSET = 0;
     */
    KV_ACTION_UNSET = 0,
    /**
     * @generated from protobuf enum value: KV_ACTION_GET = 1;
     */
    KV_ACTION_GET = 1,
    /**
     * @generated from protobuf enum value: KV_ACTION_CREATE = 2;
     */
    KV_ACTION_CREATE = 2,
    /**
     * @generated from protobuf enum value: KV_ACTION_UPDATE = 3;
     */
    KV_ACTION_UPDATE = 3,
    /**
     * @generated from protobuf enum value: KV_ACTION_EXISTS = 4;
     */
    KV_ACTION_EXISTS = 4,
    /**
     * @generated from protobuf enum value: KV_ACTION_DELETE = 5;
     */
    KV_ACTION_DELETE = 5,
    /**
     * @generated from protobuf enum value: KV_ACTION_DELETE_ALL = 6;
     */
    KV_ACTION_DELETE_ALL = 6
}
declare class WasmModule$Type extends MessageType<WasmModule> {
    constructor();
    create(value?: PartialMessage<WasmModule>): WasmModule;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: WasmModule): WasmModule;
    internalBinaryWrite(message: WasmModule, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.shared.WasmModule
 */
export declare const WasmModule: WasmModule$Type;
export {};
