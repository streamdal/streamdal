import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
import { Audience } from "./sp_common.js";
import { AbortCondition } from "./sp_pipeline.js";
/**
 * Common return response used by all SDKs
 *
 * @generated from protobuf message protos.SDKResponse
 */
export interface SDKResponse {
    /**
     * Contains (potentially) modified input data
     *
     * @generated from protobuf field: bytes data = 1;
     */
    data: Uint8Array;
    /**
     * Execution status of the last step
     *
     * @generated from protobuf field: protos.ExecStatus status = 2;
     */
    status: ExecStatus;
    /**
     * Optional message accompanying the exec status for the last step
     *
     * @generated from protobuf field: optional string status_message = 3;
     */
    statusMessage?: string;
    /**
     * An array of pipelines that the SDK executed and the status of each step
     *
     * @generated from protobuf field: repeated protos.PipelineStatus pipeline_status = 4;
     */
    pipelineStatus: PipelineStatus[];
    /**
     * Includes any metadata that the step(s) may want to pass back to the user.
     *
     * NOTE: Metadata is aggregated across all steps in the pipeline, so if two
     * steps both set a key "foo" to different values, the value of "foo" in the
     * response will be the value set by the last step in the pipeline.
     *
     * To learn more about "metadata", see SDK Spec V2 doc "Pipeline Step & Error
     * Behavior" section.
     *
     * @generated from protobuf field: map<string, string> metadata = 5;
     */
    metadata: {
        [key: string]: string;
    };
}
/**
 * @generated from protobuf message protos.PipelineStatus
 */
export interface PipelineStatus {
    /**
     * ID of the pipeline
     *
     * @generated from protobuf field: string id = 1;
     */
    id: string;
    /**
     * The name of the pipeline
     *
     * @generated from protobuf field: string name = 2;
     */
    name: string;
    /**
     * The status of each step in the pipeline
     *
     * @generated from protobuf field: repeated protos.StepStatus step_status = 3;
     */
    stepStatus: StepStatus[];
}
/**
 * @generated from protobuf message protos.StepStatus
 */
export interface StepStatus {
    /**
     * The name of the step
     *
     * @generated from protobuf field: string name = 1;
     */
    name: string;
    /**
     * Execution outcome status of the step
     *
     * @generated from protobuf field: protos.ExecStatus status = 2;
     */
    status: ExecStatus;
    /**
     * Optional message accompanying the exec status
     *
     * @generated from protobuf field: optional string status_message = 3;
     */
    statusMessage?: string;
    /**
     * Indicates if current or all future pipelines were aborted.
     *
     * IMPORTANT: The SDK running into an error does not automatically abort
     * current or all future pipelines - the user must define the abort conditions
     * for "on_error".
     *
     * @generated from protobuf field: protos.AbortCondition abort_condition = 4;
     */
    abortCondition: AbortCondition;
}
/**
 * SDKStartupConfig is the configuration structure that is used in Streamdal SDKs
 * to configure the client at startup. Some SDKs may expose additional config
 * options aside from these baseline options.
 *
 * @generated from protobuf message protos.SDKStartupConfig
 */
export interface SDKStartupConfig {
    /**
     * URL for the Streamdal server gRPC API. Example: "streamdal-server-address:8082"
     *
     * @generated from protobuf field: string url = 1;
     */
    url: string;
    /**
     * Auth token used to authenticate with the Streamdal server (NOTE: should be
     * the same as the token used for running the Streamdal server).
     *
     * @generated from protobuf field: string token = 2;
     */
    token: string;
    /**
     * Service name used for identifying the SDK client in the Streamdal server and console
     *
     * @generated from protobuf field: string service_name = 3;
     */
    serviceName: string;
    /**
     * How long to wait for a pipeline execution to complete before timing out
     *
     * @generated from protobuf field: optional int32 pipeline_timeout_seconds = 4;
     */
    pipelineTimeoutSeconds?: number;
    /**
     * How long to wait for a step execution to complete before timing out
     *
     * @generated from protobuf field: optional int32 step_timeout_seconds = 5;
     */
    stepTimeoutSeconds?: number;
    /**
     * Instruct the SDK to execute pipelines but return ORIGINAL input payload
     * instead of (potentially) modified payload.
     *
     * @generated from protobuf field: optional bool dry_run = 6;
     */
    dryRun?: boolean;
    /**
     * By default, the shim will execute pipelines on every read/write call to the
     * upstream library. If this is set to true, the shim will only execute its
     * workload if the upstream library is called with a protos.SDKRuntimeConfig.
     * Ie. kafkaProducer.Write(data, &streamdal.SDKRuntimeConfig{...}).
     *
     * @generated from protobuf field: optional bool shim_require_runtime_config = 1000;
     */
    shimRequireRuntimeConfig?: boolean;
    /**
     * Tells the SDK how to behave when it runs into an error
     *
     * @generated from protobuf field: optional protos.ShimErrorMode shim_error_mode = 1001;
     */
    shimErrorMode?: ShimErrorMode;
}
/**
 * SDKRuntimeConfig is the configuration structure that is used in SDKs to
 * configure how the SDK behaves at runtime. It is most often exposed as an
 * optional parameter that you can pass to an upstream library's read or write
 * operation. Ie. kafkaProducer.Write(data, &streamdal.SDKRuntimeConfig{...})
 *
 * NOTE: This structure is usually used when the SDK is used via a shim/wrapper
 * library where you have less control over SDK behavior. Read more about shims
 * here: https://docs.streamdal.com/en/core-components/libraries-shims/
 *
 * @generated from protobuf message protos.ShimRuntimeConfig
 */
export interface ShimRuntimeConfig {
    /**
     * Specifies how the shim should behave if it runs into any errors when calling the SDK
     *
     * @generated from protobuf field: optional protos.ShimErrorMode error_mode = 1;
     */
    errorMode?: ShimErrorMode;
    /**
     * Audience that will be used by shim when calling SDK.Process()
     *
     * @generated from protobuf field: optional protos.Audience audience = 2;
     */
    audience?: Audience;
}
/**
 * @generated from protobuf enum protos.ExecStatus
 */
export declare enum ExecStatus {
    /**
     * Unset status. This should never be returned by the SDK. If it does, it is
     * probably a bug (and you should file an issue)
     *
     * @generated from protobuf enum value: EXEC_STATUS_UNSET = 0;
     */
    UNSET = 0,
    /**
     * Indicates that the step execution evaluated to "true"
     *
     * @generated from protobuf enum value: EXEC_STATUS_TRUE = 1;
     */
    TRUE = 1,
    /**
     * Indicates that the step execution evaluated to "false"
     *
     * @generated from protobuf enum value: EXEC_STATUS_FALSE = 2;
     */
    FALSE = 2,
    /**
     * Indicates that the SDK encountered an error while trying to process the
     * request. Example error cases: SDK can't find the appropriate Wasm module,
     * Wasm function cannot alloc or dealloc memory, etc.
     *
     * @generated from protobuf enum value: EXEC_STATUS_ERROR = 3;
     */
    ERROR = 3
}
/**
 * ShimErrorMode is used to alter the error behavior of a shim library
 * instrumented with the Streamdal SDK at runtime.
 *
 * NOTE: This structure is usually used when the SDK is used via a shim/wrapper
 * library where you have less control over SDK behavior. Read more about shims
 * here: https://docs.streamdal.com/en/core-components/libraries-shims/
 *
 * @generated from protobuf enum protos.ShimErrorMode
 */
export declare enum ShimErrorMode {
    /**
     * This instructs the shim to IGNORE any non-recoverable errors that the SDK
     * might run into. If the SDK runs into an error, the shim will NOT pass the
     * error back to the user - it will instead return the whatever the upstream
     * library would normally return to the user.
     *
     * *** This is the default behavior ***
     *
     * Example with Redis Shim
     * ------------------------
     * Under normal conditions, a Redis shim would work in the following way when
     * user is performing a read operation:
     *
     * 1. The shim would call the upstream Redis library to perform the read operation
     * 2. Upstream library returns results to the shim
     * 3. Shim passes the result to the integrated Streamdal SDK for processing
     * 4. SDK returns (potentially) modified data to the shim
     * 5. Shim returns the modified data to the user
     *
     * This setting tells the shim that IF it runs into a non-recoverable error
     * while calling the SDK (step 3), it will side-step steps 4 and 5 and instead
     * return the _original_ payload (read during step 1) to the user.
     *
     * @generated from protobuf enum value: SHIM_ERROR_MODE_UNSET = 0;
     */
    UNSET = 0,
    /**
     * This instructs the shim to ABORT execution if the SDK runs into any
     * non-recoverable errors. Upon aborting, the shim will return the error that
     * the SDK ran into and the error will be passed all the way back to the user.
     *
     * @generated from protobuf enum value: SHIM_ERROR_MODE_STRICT = 1;
     */
    STRICT = 1
}
declare class SDKResponse$Type extends MessageType<SDKResponse> {
    constructor();
    create(value?: PartialMessage<SDKResponse>): SDKResponse;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: SDKResponse): SDKResponse;
    private binaryReadMap5;
    internalBinaryWrite(message: SDKResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.SDKResponse
 */
export declare const SDKResponse: SDKResponse$Type;
declare class PipelineStatus$Type extends MessageType<PipelineStatus> {
    constructor();
    create(value?: PartialMessage<PipelineStatus>): PipelineStatus;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: PipelineStatus): PipelineStatus;
    internalBinaryWrite(message: PipelineStatus, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.PipelineStatus
 */
export declare const PipelineStatus: PipelineStatus$Type;
declare class StepStatus$Type extends MessageType<StepStatus> {
    constructor();
    create(value?: PartialMessage<StepStatus>): StepStatus;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: StepStatus): StepStatus;
    internalBinaryWrite(message: StepStatus, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.StepStatus
 */
export declare const StepStatus: StepStatus$Type;
declare class SDKStartupConfig$Type extends MessageType<SDKStartupConfig> {
    constructor();
    create(value?: PartialMessage<SDKStartupConfig>): SDKStartupConfig;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: SDKStartupConfig): SDKStartupConfig;
    internalBinaryWrite(message: SDKStartupConfig, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.SDKStartupConfig
 */
export declare const SDKStartupConfig: SDKStartupConfig$Type;
declare class ShimRuntimeConfig$Type extends MessageType<ShimRuntimeConfig> {
    constructor();
    create(value?: PartialMessage<ShimRuntimeConfig>): ShimRuntimeConfig;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: ShimRuntimeConfig): ShimRuntimeConfig;
    internalBinaryWrite(message: ShimRuntimeConfig, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.ShimRuntimeConfig
 */
export declare const ShimRuntimeConfig: ShimRuntimeConfig$Type;
export {};
