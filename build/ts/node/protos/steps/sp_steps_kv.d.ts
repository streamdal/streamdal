import { MessageType } from "@protobuf-ts/runtime";
/**
 * Used for constructing a pipeline step
 *
 * @generated from protobuf message protos.steps.KVExistsRequest
 */
export interface KVExistsRequest {
    /**
     * @generated from protobuf field: string key = 1;
     */
    key: string;
    /**
     * @generated from protobuf field: protos.steps.KVExistsMode mode = 2;
     */
    mode: KVExistsMode;
}
/**
 * Used as part of KVResponse (ie. the only accessor for this should be KV WASM)
 *
 * @generated from protobuf message protos.steps.KVExistsResponse
 */
export interface KVExistsResponse {
    /**
     * @generated from protobuf field: bool exists = 1;
     */
    exists: boolean;
}
/**
 * Used in PipelineSteps
 *
 * @generated from protobuf message protos.steps.KVStep
 */
export interface KVStep {
    /**
     * @generated from protobuf oneof: request
     */
    request: {
        oneofKind: "kvExistsRequest";
        /**
         * @generated from protobuf field: protos.steps.KVExistsRequest kv_exists_request = 1;
         */
        kvExistsRequest: KVExistsRequest;
    } | {
        oneofKind: undefined;
    };
}
/**
 * Returned by HostFuncKVExists()
 *
 * @generated from protobuf message protos.steps.KVResponse
 */
export interface KVResponse {
    /**
     * @generated from protobuf oneof: response
     */
    response: {
        oneofKind: "kvExistsResponse";
        /**
         * @generated from protobuf field: protos.steps.KVExistsResponse kv_exists_response = 1;
         */
        kvExistsResponse: KVExistsResponse;
    } | {
        oneofKind: undefined;
    };
}
/**
 * Used by frontend when constructing a pipeline that contains a KV step that
 * performs a KVExists request.
 * protolint:disable:next ENUM_FIELD_NAMES_PREFIX
 *
 * @generated from protobuf enum protos.steps.KVExistsMode
 */
export declare enum KVExistsMode {
    /**
     * @generated from protobuf enum value: KV_EXISTS_MODE_UNSET = 0;
     */
    KV_EXISTS_MODE_UNSET = 0,
    /**
     * Will cause the KV lookup to use the key string as-is for the lookup
     *
     * @generated from protobuf enum value: KV_EXISTS_MODE_STATIC = 1;
     */
    KV_EXISTS_MODE_STATIC = 1,
    /**
     * DYNAMIC mode will cause the KV lookup WASM to use the key to lookup the
     * associated value and use the result for the key existence check.
     *
     * For example, if "key" in KVExistsRequest is set to "foo", KV WASM will do
     * the following:
     *
     * 1. Lookup the value of "foo" in the payload (which is "bar")
     * 2. Use "bar" as the "key" for the KV lookup
     *
     * @generated from protobuf enum value: KV_EXISTS_MODE_DYNAMIC = 2;
     */
    KV_EXISTS_MODE_DYNAMIC = 2
}
declare class KVExistsRequest$Type extends MessageType<KVExistsRequest> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.steps.KVExistsRequest
 */
export declare const KVExistsRequest: KVExistsRequest$Type;
declare class KVExistsResponse$Type extends MessageType<KVExistsResponse> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.steps.KVExistsResponse
 */
export declare const KVExistsResponse: KVExistsResponse$Type;
declare class KVStep$Type extends MessageType<KVStep> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.steps.KVStep
 */
export declare const KVStep: KVStep$Type;
declare class KVResponse$Type extends MessageType<KVResponse> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.steps.KVResponse
 */
export declare const KVResponse: KVResponse$Type;
export {};
