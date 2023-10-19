import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
import { InferSchemaStep } from "./steps/sp_steps_inferschema.js";
import { KVStep } from "./steps/sp_steps_kv.js";
import { HttpRequestStep } from "./steps/sp_steps_httprequest.js";
import { CustomStep } from "./steps/sp_steps_custom.js";
import { DecodeStep } from "./steps/sp_steps_decode.js";
import { EncodeStep } from "./steps/sp_steps_encode.js";
import { TransformStep } from "./steps/sp_steps_transform.js";
import { DetectiveStep } from "./steps/sp_steps_detective.js";
/**
 * Pipeline is a structure that holds one or more pipeline steps. This structure
 * is intended to be immutable; clients are expected to generate WASMRequest's
 * that contain a pipeline step.
 *
 * @generated from protobuf message protos.Pipeline
 */
export interface Pipeline {
    /**
     * ID should NOT be set by external gRPC client on CreatePipelineRequest - it
     * will be ignored; it _does_ need to be set on UpdatePipelineRequest.
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
 * A pipeline step is a single step in a pipeline.
 *
 * @generated from protobuf message protos.PipelineStep
 */
export interface PipelineStep {
    /**
     * Friendly name for the step
     *
     * @generated from protobuf field: string name = 1;
     */
    name: string;
    /**
     * SDKs should read this when WASM returns success to determine what to do next
     *
     * @generated from protobuf field: repeated protos.PipelineStepCondition on_success = 2;
     */
    onSuccess: PipelineStepCondition[];
    /**
     * SDKs should read this when WASM returns failure to determine what to do next
     *
     * @generated from protobuf field: repeated protos.PipelineStepCondition on_failure = 3;
     */
    onFailure: PipelineStepCondition[];
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
        oneofKind: "httpRequest";
        /**
         * @generated from protobuf field: protos.steps.HttpRequestStep http_request = 1005;
         */
        httpRequest: HttpRequestStep;
    } | {
        oneofKind: "kv";
        /**
         * @generated from protobuf field: protos.steps.KVStep kv = 1006;
         */
        kv: KVStep;
    } | {
        oneofKind: "inferSchema";
        /**
         * @generated from protobuf field: protos.steps.InferSchemaStep infer_schema = 1007;
         */
        inferSchema: InferSchemaStep;
    } | {
        oneofKind: undefined;
    };
    /**
     * ID is a uuid(sha256(_wasm_bytes)) that is set by server
     *
     * @generated from protobuf field: optional string _wasm_id = 10000;
     */
    WasmId?: string;
    /**
     * WASM module bytes (set by server)
     *
     * @generated from protobuf field: optional bytes _wasm_bytes = 10001;
     */
    WasmBytes?: Uint8Array;
    /**
     * WASM function name to execute (set by server)
     *
     * @generated from protobuf field: optional string _wasm_function = 10002;
     */
    WasmFunction?: string;
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
     * @generated from protobuf enum value: PIPELINE_STEP_CONDITION_UNSET = 0;
     */
    UNSET = 0,
    /**
     * @generated from protobuf enum value: PIPELINE_STEP_CONDITION_ABORT = 1;
     */
    ABORT = 1,
    /**
     * @generated from protobuf enum value: PIPELINE_STEP_CONDITION_NOTIFY = 2;
     */
    NOTIFY = 2
}
declare class Pipeline$Type extends MessageType<Pipeline> {
    constructor();
    create(value?: PartialMessage<Pipeline>): Pipeline;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: Pipeline): Pipeline;
    internalBinaryWrite(message: Pipeline, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.Pipeline
 */
export declare const Pipeline: Pipeline$Type;
declare class PipelineStep$Type extends MessageType<PipelineStep> {
    constructor();
    create(value?: PartialMessage<PipelineStep>): PipelineStep;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: PipelineStep): PipelineStep;
    internalBinaryWrite(message: PipelineStep, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.PipelineStep
 */
export declare const PipelineStep: PipelineStep$Type;
export {};
