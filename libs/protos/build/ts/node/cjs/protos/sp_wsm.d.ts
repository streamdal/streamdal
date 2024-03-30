import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
import { DetectiveStepResult } from "./steps/sp_steps_detective";
import { PipelineStep } from "./sp_pipeline";
/**
 * SDK generates a WASM request and passes this to the WASM func
 *
 * @generated from protobuf message protos.WASMRequest
 */
export interface WASMRequest {
    /**
     * The actual step that the WASM func will operate on. This is the same step
     * that is declared in protos.Pipeline.
     *
     * @generated from protobuf field: protos.PipelineStep step = 1;
     */
    step?: PipelineStep;
    /**
     * Payload data that WASM func will operate on
     *
     * @generated from protobuf field: bytes input_payload = 2;
     */
    inputPayload: Uint8Array;
    /**
     * Potentially filled out result from previous step. If this is first step in
     * the pipeline, it will be empty.
     *
     * @generated from protobuf field: optional bytes input_step = 3;
     */
    inputStep?: Uint8Array;
    /**
     * Potential input from a previous step if `Step.Dynamic == true`
     * This is used for communicating data between steps.
     * For example, when trying to find email addresses in a payload and
     * then passing on the results to a transform step to obfuscate them
     *
     * @generated from protobuf field: optional protos.InterStepResult inter_step_result = 4;
     */
    interStepResult?: InterStepResult;
}
/**
 * Returned by all WASM functions
 *
 * @generated from protobuf message protos.WASMResponse
 */
export interface WASMResponse {
    /**
     * Potentially modified input payload. Concept: All WASM funcs accept an
     * input_payload in WASMRequest, WASM func reads input payload, modifies it
     * and writes the modified output to output_payload.
     *
     * @generated from protobuf field: bytes output_payload = 1;
     */
    outputPayload: Uint8Array;
    /**
     * Exit code that the WASM func exited with; more info in WASMExitCode's comment
     *
     * @generated from protobuf field: protos.WASMExitCode exit_code = 2;
     */
    exitCode: WASMExitCode;
    /**
     * Additional info about the reason a specific exit code was returned
     *
     * @generated from protobuf field: string exit_msg = 3;
     */
    exitMsg: string;
    /**
     * Potential additional step output - ie. if a WASM func is an HTTPGet,
     * output_step would contain the HTTP response body; if the WASM func is a
     * KVGet, the output_step would be the value of the fetched key.
     *
     * @generated from protobuf field: optional bytes output_step = 4;
     */
    outputStep?: Uint8Array;
    /**
     * If `Step.Dynamic == true`, this field should be filled out by the WASM module
     * This is used for communicating data between steps.
     * For example, when trying to find email addresses in a payload and
     * then passing on the results to a transform step to obfuscate them
     *
     * @generated from protobuf field: optional protos.InterStepResult inter_step_result = 5;
     */
    interStepResult?: InterStepResult;
}
/**
 * Intended for communicating wasm results between steps.
 * Currently only used for passing results from a Detective Step to a Transform step
 *
 * @generated from protobuf message protos.InterStepResult
 */
export interface InterStepResult {
    /**
     * @generated from protobuf oneof: input_from
     */
    inputFrom: {
        oneofKind: "detectiveResult";
        /**
         * @generated from protobuf field: protos.steps.DetectiveStepResult detective_result = 1;
         */
        detectiveResult: DetectiveStepResult;
    } | {
        oneofKind: undefined;
    };
}
/**
 * Used for referencing both bundled and custom wasm modules
 *
 * @generated from protobuf message protos.Wasm
 */
export interface Wasm {
    /**
     * ID used for referencing the Wasm module
     *
     * @generated from protobuf field: string id = 1;
     */
    id: string;
    /**
     * Friendly name for the Wasm module
     *
     * @generated from protobuf field: string name = 2;
     */
    name: string;
    /**
     * Contents of the Wasm module
     *
     * @generated from protobuf field: bytes bytes = 3;
     */
    bytes: Uint8Array;
    /**
     * Entry point function name
     *
     * @generated from protobuf field: string function_name = 4;
     */
    functionName: string;
    /**
     * Indicates whether this wasm entry is for bundled wasm or for wasm added via
     * CreateWasm(); ignored in CreateWasm() and UpdateWasm().
     *
     * @generated from protobuf field: bool _bundled = 5;
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
}
/**
 * Included in Wasm response; the SDK should use the WASMExitCode to determine
 * what to do next - should it execute next step, should it notify or should it
 * stop execution/abort the rest of the steps in current or all pipelines.
 *
 * Example:
 *
 * a. Wasm func returns WASM_EXIT_CODE_FALSE - read PipelineStep.on_false
 * conditions to determine what to do next.
 *
 * b. Wasm func returns WASM_EXIT_CODE_TRUE - read PipelineStep.on_true
 * conditions to determine what to do next.
 *
 * .. and so on.
 * TODO: This might be a dupe - should Wasm use ExecStatus instead of this?
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
     * @generated from protobuf enum value: WASM_EXIT_CODE_TRUE = 1;
     */
    WASM_EXIT_CODE_TRUE = 1,
    /**
     * @generated from protobuf enum value: WASM_EXIT_CODE_FALSE = 2;
     */
    WASM_EXIT_CODE_FALSE = 2,
    /**
     * @generated from protobuf enum value: WASM_EXIT_CODE_ERROR = 3;
     */
    WASM_EXIT_CODE_ERROR = 3
}
declare class WASMRequest$Type extends MessageType<WASMRequest> {
    constructor();
    create(value?: PartialMessage<WASMRequest>): WASMRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: WASMRequest): WASMRequest;
    internalBinaryWrite(message: WASMRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.WASMRequest
 */
export declare const WASMRequest: WASMRequest$Type;
declare class WASMResponse$Type extends MessageType<WASMResponse> {
    constructor();
    create(value?: PartialMessage<WASMResponse>): WASMResponse;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: WASMResponse): WASMResponse;
    internalBinaryWrite(message: WASMResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.WASMResponse
 */
export declare const WASMResponse: WASMResponse$Type;
declare class InterStepResult$Type extends MessageType<InterStepResult> {
    constructor();
    create(value?: PartialMessage<InterStepResult>): InterStepResult;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: InterStepResult): InterStepResult;
    internalBinaryWrite(message: InterStepResult, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.InterStepResult
 */
export declare const InterStepResult: InterStepResult$Type;
declare class Wasm$Type extends MessageType<Wasm> {
    constructor();
    create(value?: PartialMessage<Wasm>): Wasm;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: Wasm): Wasm;
    internalBinaryWrite(message: Wasm, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.Wasm
 */
export declare const Wasm: Wasm$Type;
export {};
