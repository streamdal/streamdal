import { MessageType } from "@protobuf-ts/runtime";
import { CustomStep } from "./steps/custom.js";
import { DecodeStep } from "./steps/decode.js";
import { EncodeStep } from "./steps/encode.js";
import { TransformStep } from "./steps/transform.js";
import { DetectiveStep } from "./steps/detective.js";
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
 * A PipelineCommand consists of one or more pipeline steps. A pipeline step
 * is an immutable set of instructions on how to execute a step.
 * The SDK will use the pipeline step to generate a WASM request.
 *
 * @generated from protobuf message protos.PipelineStep
 */
export interface PipelineStep {
    /**
     * Unique ID for the step
     *
     * @generated from protobuf field: string id = 1;
     */
    id: string;
    /**
     * Friendly name for the step
     *
     * @generated from protobuf field: string name = 2;
     */
    name: string;
    /**
     * Conditions that SDK should check before executing next step
     *
     * @generated from protobuf field: repeated protos.PipelineStepCondition conditions = 3;
     */
    conditions: PipelineStepCondition[];
    /**
     * @generated from protobuf oneof: step
     */
    step: {
        oneofKind: "detective";
        /**
         * @generated from protobuf field: protos.steps.DetectiveStep detective = 1000;
         */
        detective: DetectiveStep;
    } | {
        oneofKind: "transform";
        /**
         * @generated from protobuf field: protos.steps.TransformStep transform = 1001;
         */
        transform: TransformStep;
    } | {
        oneofKind: "encode";
        /**
         * @generated from protobuf field: protos.steps.EncodeStep encode = 1002;
         */
        encode: EncodeStep;
    } | {
        oneofKind: "decode";
        /**
         * @generated from protobuf field: protos.steps.DecodeStep decode = 1003;
         */
        decode: DecodeStep;
    } | {
        oneofKind: "custom";
        /**
         * @generated from protobuf field: protos.steps.CustomStep custom = 1004;
         */
        custom: CustomStep;
    } | {
        oneofKind: undefined;
    };
    /**
     * WASM module ID (set by backend)
     *
     * @generated from protobuf field: string _wasm_id = 10000;
     */
    WasmId: string;
    /**
     * WASM module bytes (set by backend)
     *
     * @generated from protobuf field: bytes _wasm_bytes = 10001;
     */
    WasmBytes: Uint8Array;
    /**
     * WASM function name to execute (set by backend)
     *
     * @generated from protobuf field: string _wasm_function = 10002;
     */
    WasmFunction: string;
}
/**
 * Used for both Add and Update
 *
 * @generated from protobuf message protos.SetPipelineCommand
 */
export interface SetPipelineCommand {
    /**
     * Unique ID for the pipeline
     *
     * @generated from protobuf field: string id = 1;
     */
    id: string;
    /**
     * Friendly name for the pipeline
     *
     * @generated from protobuf field: string name = 2;
     */
    name: string;
    /**
     * One or more steps to execute
     *
     * @generated from protobuf field: repeated protos.PipelineStep steps = 3;
     */
    steps: PipelineStep[];
}
/**
 * @generated from protobuf message protos.DeletePipelineCommand
 */
export interface DeletePipelineCommand {
    /**
     * Unique ID for the pipeline
     *
     * @generated from protobuf field: string id = 1;
     */
    id: string;
}
/**
 * @generated from protobuf message protos.PausePipelineCommand
 */
export interface PausePipelineCommand {
    /**
     * Unique ID for the pipeline
     *
     * @generated from protobuf field: string id = 1;
     */
    id: string;
}
/**
 * @generated from protobuf message protos.UnpausePipelineCommand
 */
export interface UnpausePipelineCommand {
    /**
     * Unique ID for the pipeline
     *
     * @generated from protobuf field: string id = 1;
     */
    id: string;
}
/**
 * Included in WASM response; SDK is responsible for interpreting the response
 * status and how it relates to the step condition.
 * ie. WASM func returns WASM_EXIT_CODE_INTERNAL_ERROR lookup ON_ERROR
 * conditions to determine what to do next.
 * ie. WASM func returns WASM_EXIT_CODE_SUCCESS lookup ON_MATCH conditions
 * to determine what to do next;
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
/**
 * A condition defines how the SDK should handle a step response -- should it
 * continue executing the pipeline, should it abort, should it notify the server?
 * Each step can have multiple conditions.
 *
 * @generated from protobuf enum protos.PipelineStepCondition
 */
export declare enum PipelineStepCondition {
    /**
     * @generated from protobuf enum value: CONDITION_UNSET = 0;
     */
    CONDITION_UNSET = 0,
    /**
     * @generated from protobuf enum value: CONDITION_CONTINUE = 1;
     */
    CONDITION_CONTINUE = 1,
    /**
     * @generated from protobuf enum value: CONDITION_ABORT = 2;
     */
    CONDITION_ABORT = 2,
    /**
     * @generated from protobuf enum value: CONDITION_NOTIFY = 3;
     */
    CONDITION_NOTIFY = 3
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
declare class PipelineStep$Type extends MessageType<PipelineStep> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.PipelineStep
 */
export declare const PipelineStep: PipelineStep$Type;
declare class SetPipelineCommand$Type extends MessageType<SetPipelineCommand> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.SetPipelineCommand
 */
export declare const SetPipelineCommand: SetPipelineCommand$Type;
declare class DeletePipelineCommand$Type extends MessageType<DeletePipelineCommand> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.DeletePipelineCommand
 */
export declare const DeletePipelineCommand: DeletePipelineCommand$Type;
declare class PausePipelineCommand$Type extends MessageType<PausePipelineCommand> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.PausePipelineCommand
 */
export declare const PausePipelineCommand: PausePipelineCommand$Type;
declare class UnpausePipelineCommand$Type extends MessageType<UnpausePipelineCommand> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.UnpausePipelineCommand
 */
export declare const UnpausePipelineCommand: UnpausePipelineCommand$Type;
export {};
