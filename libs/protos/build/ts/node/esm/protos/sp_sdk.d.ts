import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
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
     * Indicates if .Process() was successful; check error_message for more details
     *
     * @generated from protobuf field: bool error = 2;
     */
    error: boolean;
    /**
     * If an error == true, this will contain a human-readable error message
     *
     * @generated from protobuf field: string error_message = 3;
     */
    errorMessage: string;
    /**
     * An array of pipelines that the SDK executed and the status of each step
     *
     * @generated from protobuf field: repeated protos.PipelineStatus pipeline_status = 4;
     */
    pipelineStatus: PipelineStatus[];
    /**
     * Indicates that the message should be dropped by the service using the SDK
     * This should only be set as the result of a success/failure condition. Errors
     * should not set this, so we can let the end user decide how to handle errors.
     *
     * @generated from protobuf field: bool drop_message = 5;
     */
    dropMessage: boolean;
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
     * Did an error occur during the step?
     *
     * @generated from protobuf field: bool error = 2;
     */
    error: boolean;
    /**
     * If error == true, this will contain a human-readable error message
     *
     * @generated from protobuf field: string error_message = 3;
     */
    errorMessage: string;
    /**
     * If error == true, this will indicate whether current or upcoming pipeline
     * execution was aborted.
     *
     * @generated from protobuf field: protos.AbortStatus abort_status = 4;
     */
    abortStatus: AbortStatus;
}
/**
 * @generated from protobuf enum protos.AbortStatus
 */
export declare enum AbortStatus {
    /**
     * @generated from protobuf enum value: ABORT_STATUS_UNSET = 0;
     */
    UNSET = 0,
    /**
     * @generated from protobuf enum value: ABORT_STATUS_CURRENT = 1;
     */
    CURRENT = 1,
    /**
     * @generated from protobuf enum value: ABORT_STATUS_ALL = 2;
     */
    ALL = 2,
    /**
     * @generated from protobuf enum value: ABORT_STATUS_DROP_MESSAGE = 3;
     */
    DROP_MESSAGE = 3
}
declare class SDKResponse$Type extends MessageType<SDKResponse> {
    constructor();
    create(value?: PartialMessage<SDKResponse>): SDKResponse;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: SDKResponse): SDKResponse;
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
