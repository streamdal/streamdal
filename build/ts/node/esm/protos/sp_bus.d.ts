import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
import { TailResponse } from "./sp_common.js";
import { TailRequest } from "./sp_common.js";
import { NewAudienceRequest } from "./sp_internal.js";
import { DeleteAudienceRequest } from "./sp_external.js";
import { KVRequest } from "./sp_kv.js";
import { MetricsRequest } from "./sp_internal.js";
import { ResumePipelineRequest } from "./sp_external.js";
import { PausePipelineRequest } from "./sp_external.js";
import { DetachPipelineRequest } from "./sp_external.js";
import { AttachPipelineRequest } from "./sp_external.js";
import { UpdatePipelineRequest } from "./sp_external.js";
import { DeletePipelineRequest } from "./sp_external.js";
import { CreatePipelineRequest } from "./sp_external.js";
import { DeregisterRequest } from "./sp_internal.js";
import { RegisterRequest } from "./sp_internal.js";
/**
 * Type used by `server` for broadcasting events to other nodes
 *
 * @generated from protobuf message protos.BusEvent
 */
export interface BusEvent {
    /**
     * @generated from protobuf field: string source = 1;
     */
    source: string;
    /**
     * @generated from protobuf oneof: event
     */
    event: {
        oneofKind: "registerRequest";
        /**
         * @generated from protobuf field: protos.RegisterRequest register_request = 100;
         */
        registerRequest: RegisterRequest;
    } | {
        oneofKind: "deregisterRequest";
        /**
         * @generated from protobuf field: protos.DeregisterRequest deregister_request = 101;
         */
        deregisterRequest: DeregisterRequest;
    } | {
        oneofKind: "createPipelineRequest";
        /**
         * @generated from protobuf field: protos.CreatePipelineRequest create_pipeline_request = 102;
         */
        createPipelineRequest: CreatePipelineRequest;
    } | {
        oneofKind: "deletePipelineRequest";
        /**
         * @generated from protobuf field: protos.DeletePipelineRequest delete_pipeline_request = 103;
         */
        deletePipelineRequest: DeletePipelineRequest;
    } | {
        oneofKind: "updatePipelineRequest";
        /**
         * @generated from protobuf field: protos.UpdatePipelineRequest update_pipeline_request = 104;
         */
        updatePipelineRequest: UpdatePipelineRequest;
    } | {
        oneofKind: "attachPipelineRequest";
        /**
         * @generated from protobuf field: protos.AttachPipelineRequest attach_pipeline_request = 105;
         */
        attachPipelineRequest: AttachPipelineRequest;
    } | {
        oneofKind: "detachPipelineRequest";
        /**
         * @generated from protobuf field: protos.DetachPipelineRequest detach_pipeline_request = 106;
         */
        detachPipelineRequest: DetachPipelineRequest;
    } | {
        oneofKind: "pausePipelineRequest";
        /**
         * @generated from protobuf field: protos.PausePipelineRequest pause_pipeline_request = 107;
         */
        pausePipelineRequest: PausePipelineRequest;
    } | {
        oneofKind: "resumePipelineRequest";
        /**
         * @generated from protobuf field: protos.ResumePipelineRequest resume_pipeline_request = 108;
         */
        resumePipelineRequest: ResumePipelineRequest;
    } | {
        oneofKind: "metricsRequest";
        /**
         * @generated from protobuf field: protos.MetricsRequest metrics_request = 109;
         */
        metricsRequest: MetricsRequest;
    } | {
        oneofKind: "kvRequest";
        /**
         * @generated from protobuf field: protos.KVRequest kv_request = 110;
         */
        kvRequest: KVRequest;
    } | {
        oneofKind: "deleteAudienceRequest";
        /**
         * @generated from protobuf field: protos.DeleteAudienceRequest delete_audience_request = 111;
         */
        deleteAudienceRequest: DeleteAudienceRequest;
    } | {
        oneofKind: "newAudienceRequest";
        /**
         * @generated from protobuf field: protos.NewAudienceRequest new_audience_request = 112;
         */
        newAudienceRequest: NewAudienceRequest;
    } | {
        oneofKind: "tailRequest";
        /**
         * @generated from protobuf field: protos.TailRequest tail_request = 113;
         */
        tailRequest: TailRequest;
    } | {
        oneofKind: "tailResponse";
        /**
         * @generated from protobuf field: protos.TailResponse tail_response = 114;
         */
        tailResponse: TailResponse;
    } | {
        oneofKind: undefined;
    };
    /**
     * All gRPC metadata is stored in ctx; when request goes outside of gRPC
     * bounds, we will translate ctx metadata into this field.
     *
     * Example:
     * 1. Request comes into server via external gRPC to set new pipeline
     * 2. server has to send SetPipeline cmd to SDK via gRPC - it passes
     *    on original metadata in request.
     * 3. server has to broadcast SetPipeline cmd to other services via bus
     * 4. Since this is not a gRPC call, server translates ctx metadata to
     *    this field and includes it in the bus event.
     *
     * @generated from protobuf field: map<string, string> _metadata = 1000;
     */
    Metadata: {
        [key: string]: string;
    };
}
declare class BusEvent$Type extends MessageType<BusEvent> {
    constructor();
    create(value?: PartialMessage<BusEvent>): BusEvent;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: BusEvent): BusEvent;
    private binaryReadMap1000;
    internalBinaryWrite(message: BusEvent, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.BusEvent
 */
export declare const BusEvent: BusEvent$Type;
export {};
