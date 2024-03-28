import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
/**
 * WasmModule is used to ensure we only send the wasm module once per request
 * instead of duplicated in every pipeline where it is used. This prevents
 * over-sized payloads on SDK startup
 *
 * @generated from protobuf message protos.shared.WasmModule
 */
export interface WasmModule {
    /**
     * ID is a uuid(sha256(_wasm_bytes)) that is set by streamdal server
     *
     * @generated from protobuf field: string id = 1;
     */
    id: string;
    /**
     * WASM module bytes (set by server)
     *
     * @generated from protobuf field: bytes bytes = 2;
     */
    bytes: Uint8Array;
    /**
     * WASM function name to execute (set by server)
     *
     * @generated from protobuf field: string function = 3;
     */
    function: string;
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
