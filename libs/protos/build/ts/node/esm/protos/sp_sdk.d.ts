import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
import { AbortCondition } from "./sp_pipeline.js";
import { Audience } from "./sp_common.js";
/**
 * Common request used by all SDKs in their .Process() method
 *
 * @generated from protobuf message protos.SDKRequest
 */
export interface SDKRequest {
    /**
     * The input payload that the SDK will process
     *
     * @generated from protobuf field: bytes data = 1;
     */
    data: Uint8Array;
    /**
     * Audience that should be announced for this request
     *
     * @generated from protobuf field: protos.Audience audience = 2;
     */
    audience?: Audience;
}
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
 * SDKStartupConfig is a common configuration structure that is used by all
 * Streamdal SDKs to configure the client at startup. NOTE: These are _baseline_
 * options - some SDKs may expose additional options.
 * protolint:disable FIELD_NAMES_LOWER_SNAKE_CASE
 *
 * @generated from protobuf message protos.SDKStartupConfig
 */
export interface SDKStartupConfig {
    /**
     * REQUIRED: URL for the Streamdal server gRPC API. Example: "streamdal-server-address:8082"
     *
     * @generated from protobuf field: string server_url = 1;
     */
    serverUrl: string;
    /**
     * REQUIRED: Auth token used to authenticate with the Streamdal server.
     * NOTE: should be the same as the token used for running the Streamdal server.
     *
     * @generated from protobuf field: string auth_token = 2;
     */
    authToken: string;
    /**
     * REQUIRED: Service name used for identifying the SDK client in the Streamdal
     * server and console.
     *
     * @generated from protobuf field: string service_name = 3;
     */
    serviceName: string;
    /**
     * OPTIONAL: List of audiences you can specify at registration time. This is
     * useful if you know your audiences in advance and want to populate service
     * groups in the Streamdal UI _before_ your code executes any .Process() calls.
     *
     * @generated from protobuf field: repeated protos.Audience audiences = 4;
     */
    audiences: Audience[];
    /**
     * OPTIONAL: How long to wait for a pipeline execution to complete before timing out
     *
     * @generated from protobuf field: int32 pipeline_timeout_seconds = 5;
     */
    pipelineTimeoutSeconds: number;
    /**
     * OPTIONAL: How long to wait for a step execution to complete before timing out
     *
     * @generated from protobuf field: int32 step_timeout_seconds = 6;
     */
    stepTimeoutSeconds: number;
    /**
     * OPTIONAL: Instruct the SDK to execute pipelines but return ORIGINAL input
     * payload instead of (potentially) modified payload.
     *
     * @generated from protobuf field: bool dry_run = 7;
     */
    dryRun: boolean;
    /**
     * ClientType specifies whether this of the SDK is used in a shim library or
     * as a standalone SDK. This information is used for both debug info and to
     * help SDKs determine whether ServerURL and ServerToken should be optional or
     * required. Unless you are developing a shim, you should not have to set this.
     * Default: SDKClientTypeSDK
     *
     * @generated from protobuf field: optional protos.SDKClientType _internal_client_type = 1000;
     */
    InternalClientType?: SDKClientType;
    /**
     * By default, the shim will execute pipelines on every read/write call to the
     * upstream library. If this is set to true, the shim will only execute its
     * workload if the upstream library is called with a protos.SDKRuntimeConfig.
     * Ie. kafkaProducer.Write(data, &streamdal.SDKRuntimeConfig{...}).
     *
     * @generated from protobuf field: bool _internal_shim_require_runtime_config = 2000;
     */
    InternalShimRequireRuntimeConfig: boolean;
    /**
     * When enabled and the shim run into any non-recoverable errors, it will
     * return the error to the upstream library. If left unset, the shim will
     * ignore the error and pass the original data back to the upstream library.
     *
     * @generated from protobuf field: bool _internal_shim_strict_error_handling = 2001;
     */
    InternalShimStrictErrorHandling: boolean;
}
/**
 * SDKRuntimeConfig is the configuration structure that is used primarily by
 * shims to configure SDK behavior at runtime. It is most often exposed as an
 * optional parameter that you can pass to an upstream library's read or write
 * operation. Ie. kafkaProducer.Write(data, &streamdal.SDKRuntimeConfig{...})
 *
 * Read more about shims: https://docs.streamdal.com/en/core-components/libraries-shims/
 *
 * @generated from protobuf message protos.SDKRuntimeConfig
 */
export interface SDKRuntimeConfig {
    /**
     * Audience that will be used by shim when calling SDK.Process().
     * NOTE: If ServiceName is not provided, the shim will use the service name
     * provided in the SDKStartupConfig.
     *
     * @generated from protobuf field: protos.Audience audience = 1;
     */
    audience?: Audience;
    /**
     * Specifies how the shim should behave if it runs into any errors when
     * calling the SDK. If set, this setting will override the behavior set in
     * SDKStartupConfig._internal_shim_strict_error_handling.
     *
     * @generated from protobuf field: optional bool strict_error_handling = 2;
     */
    strictErrorHandling?: boolean;
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
 * Indicates whether the SDK is being used directly or via a shim/wrapper library.
 * This is primarily intended to be used by shims so that the SDK can determine
 * if the ServerURL and ServerToken should be optional or required.
 * protolint:disable ENUM_FIELD_NAMES_PREFIX
 *
 * @generated from protobuf enum protos.SDKClientType
 */
export declare enum SDKClientType {
    /**
     * The SDK is used directly as a standalone library
     *
     * @generated from protobuf enum value: SDK_CLIENT_TYPE_DIRECT = 0;
     */
    SDK_CLIENT_TYPE_DIRECT = 0,
    /**
     * The SDK is used within a shim/wrapper library
     *
     * @generated from protobuf enum value: SDK_CLIENT_TYPE_SHIM = 1;
     */
    SDK_CLIENT_TYPE_SHIM = 1
}
declare class SDKRequest$Type extends MessageType<SDKRequest> {
    constructor();
    create(value?: PartialMessage<SDKRequest>): SDKRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: SDKRequest): SDKRequest;
    internalBinaryWrite(message: SDKRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.SDKRequest
 */
export declare const SDKRequest: SDKRequest$Type;
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
declare class SDKRuntimeConfig$Type extends MessageType<SDKRuntimeConfig> {
    constructor();
    create(value?: PartialMessage<SDKRuntimeConfig>): SDKRuntimeConfig;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: SDKRuntimeConfig): SDKRuntimeConfig;
    internalBinaryWrite(message: SDKRuntimeConfig, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.SDKRuntimeConfig
 */
export declare const SDKRuntimeConfig: SDKRuntimeConfig$Type;
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
export {};
