import { MessageType } from "@protobuf-ts/runtime";
import { PipelineStep } from "./sp_pipeline.js";
/**
 * SDK generates a WASM request and passes this to the WASM func
 *
 * @generated from protobuf message protos.WASMRequest
 */
export interface WASMRequest {
    /**
     * @generated from protobuf field: protos.PipelineStep step = 1;
     */
    step?: PipelineStep;
    /**
     * @generated from protobuf field: bytes input = 2;
     */
    input: Uint8Array;
}
/**
 * Returned by all WASM functions
 *
 * @generated from protobuf message protos.WASMResponse
 */
export interface WASMResponse {
    /**
     * @generated from protobuf field: bytes output = 1;
     */
    output: Uint8Array;
    /**
     * @generated from protobuf field: protos.WASMExitCode exit_code = 2;
     */
    exitCode: WASMExitCode;
    /**
     * @generated from protobuf field: string exit_msg = 3;
     */
    exitMsg: string;
}
/**
 * Included in WASM response; the SDK should use the WASMExitCode to determine
 * what to do next - should it execute next step, should it notify or should it
 * stop executing/abort the rest of the steps in the pipeline.
 *
 * Example:
 *
 * a. WASM func returns WASM_EXIT_CODE_FAILURE - read PipelineStep.on_failure
 * conditions to determine what to do next.
 *
 * b. WASM func returns WASM_EXIT_CODE_SUCCESS - read PipelineStep.on_success
 * conditions to determine what to do next.
 *
 * .. and so on.
 * protolint:disable:next ENUM_FIELD_NAMES_PREFIX
 *
 * @generated from protobuf enum protos.WASMExitCode
 */
export declare enum WASMExitCode {
    /**
     * @generated from protobuf enum value: WASM_EXIT_CODE_UNSET = 0;
     */
    WASM_EXIT_CODE_UNSET = 0,
    /**
     * @generated from protobuf enum value: WASM_EXIT_CODE_SUCCESS = 1;
     */
    WASM_EXIT_CODE_SUCCESS = 1,
    /**
     * Probably need better names for these as FAILURE is too harsh
     *
     * @generated from protobuf enum value: WASM_EXIT_CODE_FAILURE = 2;
     */
    WASM_EXIT_CODE_FAILURE = 2,
    /**
     * @generated from protobuf enum value: WASM_EXIT_CODE_INTERNAL_ERROR = 3;
     */
    WASM_EXIT_CODE_INTERNAL_ERROR = 3
}
declare class WASMRequest$Type extends MessageType<WASMRequest> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.WASMRequest
 */
export declare const WASMRequest: WASMRequest$Type;
declare class WASMResponse$Type extends MessageType<WASMResponse> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.WASMResponse
 */
export declare const WASMResponse: WASMResponse$Type;
export {};
