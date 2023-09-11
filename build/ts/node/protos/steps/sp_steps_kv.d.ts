import { MessageType } from "@protobuf-ts/runtime";
import { KVAction } from "../shared/sp_shared.js";
/**
 * Returned by SDK host func and interpreted by KV WASM.
 *
 * @generated from protobuf message protos.steps.KVStepResponse
 */
export interface KVStepResponse {
    /**
     * Status of the action; interpreted by KV WASM to so it can generate a protos.WASMResponse
     *
     * @generated from protobuf field: protos.steps.KVStatus status = 1;
     */
    status: KVStatus;
    /**
     * Message containing info, debug or error details; included in protos.WASMResponse
     *
     * @generated from protobuf field: string message = 2;
     */
    message: string;
    /**
     * Optional because the only action that uses field is KV_ACTION_GET
     *
     * DS: Not sure how we'll use KV_ACTION_GET in steps yet but this is probably
     * a good place to start. 09.06.2023.
     *
     * @generated from protobuf field: optional bytes value = 3;
     */
    value?: Uint8Array;
}
/**
 * Used in PipelineSteps and passed to KV host func; constructed by frontend
 *
 * @generated from protobuf message protos.steps.KVStep
 */
export interface KVStep {
    /**
     * What type of action this step should perform
     *
     * @generated from protobuf field: protos.shared.KVAction action = 1;
     */
    action: KVAction;
    /**
     * How the key field will be used to perform lookup
     *
     * @generated from protobuf field: protos.steps.KVMode mode = 2;
     */
    mode: KVMode;
    /**
     * The key the action is taking place on
     *
     * @generated from protobuf field: string key = 3;
     */
    key: string;
    /**
     * Optional because the only action that needs value is KV_ACTION_CREATE
     *
     * @generated from protobuf field: optional bytes value = 4;
     */
    value?: Uint8Array;
}
/**
 * Used by frontend when constructing a pipeline that contains a KV step that
 * performs any KV request. The mode determines _what_ the contents of the
 * key will be. Read comments about "static" vs "dynamic".
 * protolint:disable:next ENUM_FIELD_NAMES_PREFIX
 *
 * @generated from protobuf enum protos.steps.KVMode
 */
export declare enum KVMode {
    /**
     * @generated from protobuf enum value: KV_MODE_UNSET = 0;
     */
    KV_MODE_UNSET = 0,
    /**
     * Will cause the KV lookup to use the key string as-is for the lookup
     *
     * @generated from protobuf enum value: KV_MODE_STATIC = 1;
     */
    KV_MODE_STATIC = 1,
    /**
     * DYNAMIC mode will cause the KV lookup WASM to use the key to lookup the
     * associated value and use the result for the key existence check.
     *
     * For example, if "key" in KVHostFuncRequest is set to "foo", KV WASM will do
     * the following:
     *
     * 1. Lookup the value of "foo" in the payload (which is "bar")
     * 2. Use "bar" as the "key" for the KV lookup
     *
     * @generated from protobuf enum value: KV_MODE_DYNAMIC = 2;
     */
    KV_MODE_DYNAMIC = 2
}
/**
 * Returned by KV host func and interpreted by KV WASM.
 * protolint:disable:next ENUM_FIELD_NAMES_PREFIX
 *
 * @generated from protobuf enum protos.steps.KVStatus
 */
export declare enum KVStatus {
    /**
     * @generated from protobuf enum value: KV_STATUS_UNSET = 0;
     */
    KV_STATUS_UNSET = 0,
    /**
     * @generated from protobuf enum value: KV_STATUS_SUCCESS = 1;
     */
    KV_STATUS_SUCCESS = 1,
    /**
     * @generated from protobuf enum value: KV_STATUS_FAILURE = 2;
     */
    KV_STATUS_FAILURE = 2,
    /**
     * @generated from protobuf enum value: KV_STATUS_ERROR = 3;
     */
    KV_STATUS_ERROR = 3
}
declare class KVStepResponse$Type extends MessageType<KVStepResponse> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.steps.KVStepResponse
 */
export declare const KVStepResponse: KVStepResponse$Type;
declare class KVStep$Type extends MessageType<KVStep> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.steps.KVStep
 */
export declare const KVStep: KVStep$Type;
export {};
