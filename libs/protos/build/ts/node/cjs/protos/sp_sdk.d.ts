import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
import { AbortCondition } from "./sp_pipeline";
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
    /**
     * SDKMode is purely an informative field that tells the user the mode that the
     * SDK was running in when the response was generated.
     *
     * @generated from protobuf field: protos.SDKMode sdk_mode = 6;
     */
    sdkMode: SDKMode;
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
    ERROR = 3,
    /**
     * Indicates that the SDK was configured to operate in async mode.
     * Step execution will occur asynchronously in a background worker-group.
     *
     * @generated from protobuf enum value: EXEC_STATUS_ASYNC = 4;
     */
    ASYNC = 4,
    /**
     * Indicates that the SDK was configured to operate in sampling mode.
     * Step execution was skipped for this request due to configured sampling rate.
     *
     * If this status is set, you can safely ignore the rest of the response as
     * the execution for this request was skipped due to being sampled out.
     *
     * Non-sampled messages will have TRUE/FALSE/ERROR status set as any other
     * non-sampled message.
     *
     * @generated from protobuf enum value: EXEC_STATUS_SAMPLING = 5;
     */
    SAMPLING = 5
}
/**
 * @generated from protobuf enum protos.SDKMode
 */
export declare enum SDKMode {
    /**
     * @generated from protobuf enum value: SDK_MODE_UNSET = 0;
     */
    SDK_MODE_UNSET = 0,
    /**
     * Process() will handle the message inline.
     * This method should be used when you need to modify the input data and pass
     * the modified data back to your application
     *
     * @generated from protobuf enum value: SDK_MODE_SYNC = 1;
     */
    SDK_MODE_SYNC = 1,
    /**
     * Process() will handle the message asynchronously in a worker.
     * The SDKResponse will not contain any modified data. This mode should
     * only be used when you don't need to modify and pass it back to your
     * application, such as when discovering/monitoring PII only
     *
     * @generated from protobuf enum value: SDK_MODE_ASYNC = 2;
     */
    SDK_MODE_ASYNC = 2
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
export {};
