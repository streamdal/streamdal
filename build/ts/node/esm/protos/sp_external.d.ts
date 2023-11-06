import { ServiceType } from "@protobuf-ts/runtime-rpc";
import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
import { Schema } from "./sp_common.js";
import { AudienceRate } from "./sp_common.js";
import { Metric } from "./sp_common.js";
import { NotificationConfig } from "./sp_notify.js";
import { Pipeline } from "./sp_pipeline.js";
import { PipelineInfo } from "./sp_info.js";
import { Audience } from "./sp_common.js";
import { LiveInfo } from "./sp_info.js";
/**
 * Don't think there is anything to pass in (yet)?
 *
 * @generated from protobuf message protos.GetAllRequest
 */
export interface GetAllRequest {
}
/**
 * @generated from protobuf message protos.GetAllResponse
 */
export interface GetAllResponse {
    /**
     * Clients currently connected to the server
     *
     * @generated from protobuf field: repeated protos.LiveInfo live = 1;
     */
    live: LiveInfo[];
    /**
     * All of the audiences that are known to the server
     *
     * @generated from protobuf field: repeated protos.Audience audiences = 2;
     */
    audiences: Audience[];
    /**
     * All of the pipelines known to the server + pipeline <-> audience mappings
     * key == pipeline_id; if "Audience" is not filled out - pipeline is not attached
     * to any audience.
     *
     * @generated from protobuf field: map<string, protos.PipelineInfo> pipelines = 3;
     */
    pipelines: {
        [key: string]: PipelineInfo;
    };
    /**
     * Audience to pipeline ID config/mapping.
     * key == $audience_as_string, value = $pipeline_id
     *
     * @generated from protobuf field: map<string, protos.GetAllResponsePipelines> config = 4;
     */
    config: {
        [key: string]: GetAllResponsePipelines;
    };
    /**
     * When was this response generated. This is useful for determining what is
     * the latest update when using GetAllStream().
     *
     * @generated from protobuf field: int64 generated_at_unix_ts_ns_utc = 100;
     */
    generatedAtUnixTsNsUtc: string;
    /**
     * Set by server to indicate that the response is a keepalive message
     *
     * @generated from protobuf field: optional bool _keepalive = 1000;
     */
    Keepalive?: boolean;
}
/**
 * @generated from protobuf message protos.GetAllResponsePipelines
 */
export interface GetAllResponsePipelines {
    /**
     * List of pipeline IDs that are attached to this audience
     *
     * @generated from protobuf field: repeated string pipeline_ids = 1;
     */
    pipelineIds: string[];
}
/**
 * Don't think we need anything here
 *
 * @generated from protobuf message protos.GetPipelinesRequest
 */
export interface GetPipelinesRequest {
}
/**
 * @generated from protobuf message protos.GetPipelinesResponse
 */
export interface GetPipelinesResponse {
    /**
     * @generated from protobuf field: repeated protos.Pipeline pipelines = 1;
     */
    pipelines: Pipeline[];
}
/**
 * @generated from protobuf message protos.GetPipelineRequest
 */
export interface GetPipelineRequest {
    /**
     * @generated from protobuf field: string pipeline_id = 1;
     */
    pipelineId: string;
}
/**
 * @generated from protobuf message protos.GetPipelineResponse
 */
export interface GetPipelineResponse {
    /**
     * @generated from protobuf field: protos.Pipeline pipeline = 1;
     */
    pipeline?: Pipeline;
}
/**
 * @generated from protobuf message protos.CreatePipelineRequest
 */
export interface CreatePipelineRequest {
    /**
     * @generated from protobuf field: protos.Pipeline pipeline = 1;
     */
    pipeline?: Pipeline;
}
/**
 * @generated from protobuf message protos.CreatePipelineResponse
 */
export interface CreatePipelineResponse {
    /**
     * @generated from protobuf field: string message = 1;
     */
    message: string;
    /**
     * @generated from protobuf field: string pipeline_id = 2;
     */
    pipelineId: string;
}
/**
 * @generated from protobuf message protos.UpdatePipelineRequest
 */
export interface UpdatePipelineRequest {
    /**
     * @generated from protobuf field: protos.Pipeline pipeline = 1;
     */
    pipeline?: Pipeline;
}
/**
 * @generated from protobuf message protos.DeletePipelineRequest
 */
export interface DeletePipelineRequest {
    /**
     * @generated from protobuf field: string pipeline_id = 1;
     */
    pipelineId: string;
}
/**
 * @generated from protobuf message protos.AttachPipelineRequest
 */
export interface AttachPipelineRequest {
    /**
     * @generated from protobuf field: string pipeline_id = 1;
     */
    pipelineId: string;
    /**
     * @generated from protobuf field: protos.Audience audience = 2;
     */
    audience?: Audience;
}
/**
 * @generated from protobuf message protos.DetachPipelineRequest
 */
export interface DetachPipelineRequest {
    /**
     * @generated from protobuf field: string pipeline_id = 1;
     */
    pipelineId: string;
    /**
     * @generated from protobuf field: protos.Audience audience = 2;
     */
    audience?: Audience;
    /**
     * Filled out by detach gRPC handler so that broadcast handlers can avoid
     * performing a lookup in NATS.
     *
     * @generated from protobuf field: repeated string _session_ids = 3;
     */
    SessionIds: string[];
}
/**
 * @generated from protobuf message protos.PausePipelineRequest
 */
export interface PausePipelineRequest {
    /**
     * @generated from protobuf field: string pipeline_id = 1;
     */
    pipelineId: string;
    /**
     * @generated from protobuf field: protos.Audience audience = 2;
     */
    audience?: Audience;
}
/**
 * @generated from protobuf message protos.ResumePipelineRequest
 */
export interface ResumePipelineRequest {
    /**
     * @generated from protobuf field: string pipeline_id = 1;
     */
    pipelineId: string;
    /**
     * @generated from protobuf field: protos.Audience audience = 2;
     */
    audience?: Audience;
}
/**
 * Notifications
 *
 * @generated from protobuf message protos.CreateNotificationRequest
 */
export interface CreateNotificationRequest {
    /**
     * @generated from protobuf field: protos.NotificationConfig notification = 1;
     */
    notification?: NotificationConfig;
}
/**
 * @generated from protobuf message protos.UpdateNotificationRequest
 */
export interface UpdateNotificationRequest {
    /**
     * @generated from protobuf field: protos.NotificationConfig notification = 1;
     */
    notification?: NotificationConfig;
}
/**
 * @generated from protobuf message protos.DeleteNotificationRequest
 */
export interface DeleteNotificationRequest {
    /**
     * @generated from protobuf field: string notification_id = 1;
     */
    notificationId: string;
}
/**
 * Don't think we need anything here
 *
 * @generated from protobuf message protos.GetNotificationsRequest
 */
export interface GetNotificationsRequest {
}
/**
 * @generated from protobuf message protos.GetNotificationsResponse
 */
export interface GetNotificationsResponse {
    /**
     * Key == id of the notification config
     *
     * @generated from protobuf field: map<string, protos.NotificationConfig> notifications = 1;
     */
    notifications: {
        [key: string]: NotificationConfig;
    };
}
/**
 * @generated from protobuf message protos.GetNotificationRequest
 */
export interface GetNotificationRequest {
    /**
     * @generated from protobuf field: string notification_id = 1;
     */
    notificationId: string;
}
/**
 * @generated from protobuf message protos.GetNotificationResponse
 */
export interface GetNotificationResponse {
    /**
     * @generated from protobuf field: protos.NotificationConfig notification = 1;
     */
    notification?: NotificationConfig;
}
/**
 * @generated from protobuf message protos.AttachNotificationRequest
 */
export interface AttachNotificationRequest {
    /**
     * @generated from protobuf field: string notification_id = 1;
     */
    notificationId: string;
    /**
     * @generated from protobuf field: string pipeline_id = 2;
     */
    pipelineId: string;
}
/**
 * @generated from protobuf message protos.DetachNotificationRequest
 */
export interface DetachNotificationRequest {
    /**
     * @generated from protobuf field: string notification_id = 1;
     */
    notificationId: string;
    /**
     * @generated from protobuf field: string pipeline_id = 2;
     */
    pipelineId: string;
}
/**
 * @generated from protobuf message protos.DeleteAudienceRequest
 */
export interface DeleteAudienceRequest {
    /**
     * @generated from protobuf field: protos.Audience audience = 1;
     */
    audience?: Audience;
    /**
     * If true, will also detach all pipelines from the audience (if it has any)
     *
     * @generated from protobuf field: optional bool force = 2;
     */
    force?: boolean;
}
/**
 * @generated from protobuf message protos.DeleteServiceRequest
 */
export interface DeleteServiceRequest {
    /**
     * @generated from protobuf field: string service_name = 1;
     */
    serviceName: string;
    /**
     * @generated from protobuf field: optional bool force = 2;
     */
    force?: boolean;
}
/**
 * Nothing needed here, we return all metrics currently
 *
 * @generated from protobuf message protos.GetMetricsRequest
 */
export interface GetMetricsRequest {
}
/**
 * @generated from protobuf message protos.GetMetricsResponse
 */
export interface GetMetricsResponse {
    /**
     * @generated from protobuf field: map<string, protos.Metric> metrics = 1;
     */
    metrics: {
        [key: string]: Metric;
    };
    /**
     * Set by server to indicate that the response is a keepalive message
     *
     * @generated from protobuf field: optional bool _keepalive = 1000;
     */
    Keepalive?: boolean;
}
/**
 * Nothing needed here, we return all rates
 *
 * @generated from protobuf message protos.GetAudienceRatesRequest
 */
export interface GetAudienceRatesRequest {
}
/**
 * @generated from protobuf message protos.GetAudienceRatesResponse
 */
export interface GetAudienceRatesResponse {
    /**
     * @generated from protobuf field: map<string, protos.AudienceRate> rates = 1;
     */
    rates: {
        [key: string]: AudienceRate;
    };
    /**
     * Set by server to indicate that the response is a keepalive message
     *
     * @generated from protobuf field: optional bool _keepalive = 1000;
     */
    Keepalive?: boolean;
}
/**
 * @generated from protobuf message protos.GetSchemaRequest
 */
export interface GetSchemaRequest {
    /**
     * @generated from protobuf field: protos.Audience audience = 1;
     */
    audience?: Audience;
}
/**
 * @generated from protobuf message protos.GetSchemaResponse
 */
export interface GetSchemaResponse {
    /**
     * @generated from protobuf field: protos.Schema schema = 1;
     */
    schema?: Schema;
}
/**
 * @generated from protobuf message protos.AppRegistrationStatusRequest
 */
export interface AppRegistrationStatusRequest {
    /**
     * @generated from protobuf field: string email = 1;
     */
    email: string;
}
/**
 * @generated from protobuf message protos.AppRegistrationStatusResponse
 */
export interface AppRegistrationStatusResponse {
    /**
     * @generated from protobuf field: protos.AppRegistrationStatusResponse.Status status = 1;
     */
    status: AppRegistrationStatusResponse_Status;
}
/**
 * @generated from protobuf enum protos.AppRegistrationStatusResponse.Status
 */
export declare enum AppRegistrationStatusResponse_Status {
    /**
     * @generated from protobuf enum value: STATUS_UNSET = 0;
     */
    UNSET = 0,
    /**
     * Submit means the user is not registered yet
     *
     * @generated from protobuf enum value: STATUS_SUBMIT = 1;
     */
    SUBMIT = 1,
    /**
     * Verify means the user is registered but not verified yet
     *
     * @generated from protobuf enum value: STATUS_VERIFY = 2;
     */
    VERIFY = 2,
    /**
     * Done means the user is registered and verified
     *
     * @generated from protobuf enum value: STATUS_DONE = 3;
     */
    DONE = 3
}
/**
 * @generated from protobuf message protos.AppRegistrationRequest
 */
export interface AppRegistrationRequest {
    /**
     * @generated from protobuf field: string email = 1;
     */
    email: string;
    /**
     * @generated from protobuf field: string cluster_id = 2;
     */
    clusterId: string;
    /**
     * Used for storage on ui-bff backend
     *
     * @generated from protobuf field: string _code = 100;
     */
    Code: string;
}
/**
 * @generated from protobuf message protos.AppVerifyRegistrationRequest
 */
export interface AppVerifyRegistrationRequest {
    /**
     * @generated from protobuf field: string email = 1;
     */
    email: string;
    /**
     * @generated from protobuf field: string code = 2;
     */
    code: string;
}
/**
 * @generated from protobuf message protos.AppRegisterRejectRequest
 */
export interface AppRegisterRejectRequest {
    /**
     * @generated from protobuf field: string cluster_id = 1;
     */
    clusterId: string;
}
/**
 * @generated from protobuf message protos.TestRequest
 */
export interface TestRequest {
    /**
     * @generated from protobuf field: string input = 1;
     */
    input: string;
}
/**
 * @generated from protobuf message protos.TestResponse
 */
export interface TestResponse {
    /**
     * @generated from protobuf field: string output = 2;
     */
    output: string;
}
declare class GetAllRequest$Type extends MessageType<GetAllRequest> {
    constructor();
    create(value?: PartialMessage<GetAllRequest>): GetAllRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: GetAllRequest): GetAllRequest;
    internalBinaryWrite(message: GetAllRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.GetAllRequest
 */
export declare const GetAllRequest: GetAllRequest$Type;
declare class GetAllResponse$Type extends MessageType<GetAllResponse> {
    constructor();
    create(value?: PartialMessage<GetAllResponse>): GetAllResponse;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: GetAllResponse): GetAllResponse;
    private binaryReadMap3;
    private binaryReadMap4;
    internalBinaryWrite(message: GetAllResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.GetAllResponse
 */
export declare const GetAllResponse: GetAllResponse$Type;
declare class GetAllResponsePipelines$Type extends MessageType<GetAllResponsePipelines> {
    constructor();
    create(value?: PartialMessage<GetAllResponsePipelines>): GetAllResponsePipelines;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: GetAllResponsePipelines): GetAllResponsePipelines;
    internalBinaryWrite(message: GetAllResponsePipelines, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.GetAllResponsePipelines
 */
export declare const GetAllResponsePipelines: GetAllResponsePipelines$Type;
declare class GetPipelinesRequest$Type extends MessageType<GetPipelinesRequest> {
    constructor();
    create(value?: PartialMessage<GetPipelinesRequest>): GetPipelinesRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: GetPipelinesRequest): GetPipelinesRequest;
    internalBinaryWrite(message: GetPipelinesRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.GetPipelinesRequest
 */
export declare const GetPipelinesRequest: GetPipelinesRequest$Type;
declare class GetPipelinesResponse$Type extends MessageType<GetPipelinesResponse> {
    constructor();
    create(value?: PartialMessage<GetPipelinesResponse>): GetPipelinesResponse;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: GetPipelinesResponse): GetPipelinesResponse;
    internalBinaryWrite(message: GetPipelinesResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.GetPipelinesResponse
 */
export declare const GetPipelinesResponse: GetPipelinesResponse$Type;
declare class GetPipelineRequest$Type extends MessageType<GetPipelineRequest> {
    constructor();
    create(value?: PartialMessage<GetPipelineRequest>): GetPipelineRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: GetPipelineRequest): GetPipelineRequest;
    internalBinaryWrite(message: GetPipelineRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.GetPipelineRequest
 */
export declare const GetPipelineRequest: GetPipelineRequest$Type;
declare class GetPipelineResponse$Type extends MessageType<GetPipelineResponse> {
    constructor();
    create(value?: PartialMessage<GetPipelineResponse>): GetPipelineResponse;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: GetPipelineResponse): GetPipelineResponse;
    internalBinaryWrite(message: GetPipelineResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.GetPipelineResponse
 */
export declare const GetPipelineResponse: GetPipelineResponse$Type;
declare class CreatePipelineRequest$Type extends MessageType<CreatePipelineRequest> {
    constructor();
    create(value?: PartialMessage<CreatePipelineRequest>): CreatePipelineRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: CreatePipelineRequest): CreatePipelineRequest;
    internalBinaryWrite(message: CreatePipelineRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.CreatePipelineRequest
 */
export declare const CreatePipelineRequest: CreatePipelineRequest$Type;
declare class CreatePipelineResponse$Type extends MessageType<CreatePipelineResponse> {
    constructor();
    create(value?: PartialMessage<CreatePipelineResponse>): CreatePipelineResponse;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: CreatePipelineResponse): CreatePipelineResponse;
    internalBinaryWrite(message: CreatePipelineResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.CreatePipelineResponse
 */
export declare const CreatePipelineResponse: CreatePipelineResponse$Type;
declare class UpdatePipelineRequest$Type extends MessageType<UpdatePipelineRequest> {
    constructor();
    create(value?: PartialMessage<UpdatePipelineRequest>): UpdatePipelineRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: UpdatePipelineRequest): UpdatePipelineRequest;
    internalBinaryWrite(message: UpdatePipelineRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.UpdatePipelineRequest
 */
export declare const UpdatePipelineRequest: UpdatePipelineRequest$Type;
declare class DeletePipelineRequest$Type extends MessageType<DeletePipelineRequest> {
    constructor();
    create(value?: PartialMessage<DeletePipelineRequest>): DeletePipelineRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: DeletePipelineRequest): DeletePipelineRequest;
    internalBinaryWrite(message: DeletePipelineRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.DeletePipelineRequest
 */
export declare const DeletePipelineRequest: DeletePipelineRequest$Type;
declare class AttachPipelineRequest$Type extends MessageType<AttachPipelineRequest> {
    constructor();
    create(value?: PartialMessage<AttachPipelineRequest>): AttachPipelineRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: AttachPipelineRequest): AttachPipelineRequest;
    internalBinaryWrite(message: AttachPipelineRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.AttachPipelineRequest
 */
export declare const AttachPipelineRequest: AttachPipelineRequest$Type;
declare class DetachPipelineRequest$Type extends MessageType<DetachPipelineRequest> {
    constructor();
    create(value?: PartialMessage<DetachPipelineRequest>): DetachPipelineRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: DetachPipelineRequest): DetachPipelineRequest;
    internalBinaryWrite(message: DetachPipelineRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.DetachPipelineRequest
 */
export declare const DetachPipelineRequest: DetachPipelineRequest$Type;
declare class PausePipelineRequest$Type extends MessageType<PausePipelineRequest> {
    constructor();
    create(value?: PartialMessage<PausePipelineRequest>): PausePipelineRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: PausePipelineRequest): PausePipelineRequest;
    internalBinaryWrite(message: PausePipelineRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.PausePipelineRequest
 */
export declare const PausePipelineRequest: PausePipelineRequest$Type;
declare class ResumePipelineRequest$Type extends MessageType<ResumePipelineRequest> {
    constructor();
    create(value?: PartialMessage<ResumePipelineRequest>): ResumePipelineRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: ResumePipelineRequest): ResumePipelineRequest;
    internalBinaryWrite(message: ResumePipelineRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.ResumePipelineRequest
 */
export declare const ResumePipelineRequest: ResumePipelineRequest$Type;
declare class CreateNotificationRequest$Type extends MessageType<CreateNotificationRequest> {
    constructor();
    create(value?: PartialMessage<CreateNotificationRequest>): CreateNotificationRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: CreateNotificationRequest): CreateNotificationRequest;
    internalBinaryWrite(message: CreateNotificationRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.CreateNotificationRequest
 */
export declare const CreateNotificationRequest: CreateNotificationRequest$Type;
declare class UpdateNotificationRequest$Type extends MessageType<UpdateNotificationRequest> {
    constructor();
    create(value?: PartialMessage<UpdateNotificationRequest>): UpdateNotificationRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: UpdateNotificationRequest): UpdateNotificationRequest;
    internalBinaryWrite(message: UpdateNotificationRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.UpdateNotificationRequest
 */
export declare const UpdateNotificationRequest: UpdateNotificationRequest$Type;
declare class DeleteNotificationRequest$Type extends MessageType<DeleteNotificationRequest> {
    constructor();
    create(value?: PartialMessage<DeleteNotificationRequest>): DeleteNotificationRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: DeleteNotificationRequest): DeleteNotificationRequest;
    internalBinaryWrite(message: DeleteNotificationRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.DeleteNotificationRequest
 */
export declare const DeleteNotificationRequest: DeleteNotificationRequest$Type;
declare class GetNotificationsRequest$Type extends MessageType<GetNotificationsRequest> {
    constructor();
    create(value?: PartialMessage<GetNotificationsRequest>): GetNotificationsRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: GetNotificationsRequest): GetNotificationsRequest;
    internalBinaryWrite(message: GetNotificationsRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.GetNotificationsRequest
 */
export declare const GetNotificationsRequest: GetNotificationsRequest$Type;
declare class GetNotificationsResponse$Type extends MessageType<GetNotificationsResponse> {
    constructor();
    create(value?: PartialMessage<GetNotificationsResponse>): GetNotificationsResponse;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: GetNotificationsResponse): GetNotificationsResponse;
    private binaryReadMap1;
    internalBinaryWrite(message: GetNotificationsResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.GetNotificationsResponse
 */
export declare const GetNotificationsResponse: GetNotificationsResponse$Type;
declare class GetNotificationRequest$Type extends MessageType<GetNotificationRequest> {
    constructor();
    create(value?: PartialMessage<GetNotificationRequest>): GetNotificationRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: GetNotificationRequest): GetNotificationRequest;
    internalBinaryWrite(message: GetNotificationRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.GetNotificationRequest
 */
export declare const GetNotificationRequest: GetNotificationRequest$Type;
declare class GetNotificationResponse$Type extends MessageType<GetNotificationResponse> {
    constructor();
    create(value?: PartialMessage<GetNotificationResponse>): GetNotificationResponse;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: GetNotificationResponse): GetNotificationResponse;
    internalBinaryWrite(message: GetNotificationResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.GetNotificationResponse
 */
export declare const GetNotificationResponse: GetNotificationResponse$Type;
declare class AttachNotificationRequest$Type extends MessageType<AttachNotificationRequest> {
    constructor();
    create(value?: PartialMessage<AttachNotificationRequest>): AttachNotificationRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: AttachNotificationRequest): AttachNotificationRequest;
    internalBinaryWrite(message: AttachNotificationRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.AttachNotificationRequest
 */
export declare const AttachNotificationRequest: AttachNotificationRequest$Type;
declare class DetachNotificationRequest$Type extends MessageType<DetachNotificationRequest> {
    constructor();
    create(value?: PartialMessage<DetachNotificationRequest>): DetachNotificationRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: DetachNotificationRequest): DetachNotificationRequest;
    internalBinaryWrite(message: DetachNotificationRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.DetachNotificationRequest
 */
export declare const DetachNotificationRequest: DetachNotificationRequest$Type;
declare class DeleteAudienceRequest$Type extends MessageType<DeleteAudienceRequest> {
    constructor();
    create(value?: PartialMessage<DeleteAudienceRequest>): DeleteAudienceRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: DeleteAudienceRequest): DeleteAudienceRequest;
    internalBinaryWrite(message: DeleteAudienceRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.DeleteAudienceRequest
 */
export declare const DeleteAudienceRequest: DeleteAudienceRequest$Type;
declare class DeleteServiceRequest$Type extends MessageType<DeleteServiceRequest> {
    constructor();
    create(value?: PartialMessage<DeleteServiceRequest>): DeleteServiceRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: DeleteServiceRequest): DeleteServiceRequest;
    internalBinaryWrite(message: DeleteServiceRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.DeleteServiceRequest
 */
export declare const DeleteServiceRequest: DeleteServiceRequest$Type;
declare class GetMetricsRequest$Type extends MessageType<GetMetricsRequest> {
    constructor();
    create(value?: PartialMessage<GetMetricsRequest>): GetMetricsRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: GetMetricsRequest): GetMetricsRequest;
    internalBinaryWrite(message: GetMetricsRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.GetMetricsRequest
 */
export declare const GetMetricsRequest: GetMetricsRequest$Type;
declare class GetMetricsResponse$Type extends MessageType<GetMetricsResponse> {
    constructor();
    create(value?: PartialMessage<GetMetricsResponse>): GetMetricsResponse;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: GetMetricsResponse): GetMetricsResponse;
    private binaryReadMap1;
    internalBinaryWrite(message: GetMetricsResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.GetMetricsResponse
 */
export declare const GetMetricsResponse: GetMetricsResponse$Type;
declare class GetAudienceRatesRequest$Type extends MessageType<GetAudienceRatesRequest> {
    constructor();
    create(value?: PartialMessage<GetAudienceRatesRequest>): GetAudienceRatesRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: GetAudienceRatesRequest): GetAudienceRatesRequest;
    internalBinaryWrite(message: GetAudienceRatesRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.GetAudienceRatesRequest
 */
export declare const GetAudienceRatesRequest: GetAudienceRatesRequest$Type;
declare class GetAudienceRatesResponse$Type extends MessageType<GetAudienceRatesResponse> {
    constructor();
    create(value?: PartialMessage<GetAudienceRatesResponse>): GetAudienceRatesResponse;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: GetAudienceRatesResponse): GetAudienceRatesResponse;
    private binaryReadMap1;
    internalBinaryWrite(message: GetAudienceRatesResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.GetAudienceRatesResponse
 */
export declare const GetAudienceRatesResponse: GetAudienceRatesResponse$Type;
declare class GetSchemaRequest$Type extends MessageType<GetSchemaRequest> {
    constructor();
    create(value?: PartialMessage<GetSchemaRequest>): GetSchemaRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: GetSchemaRequest): GetSchemaRequest;
    internalBinaryWrite(message: GetSchemaRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.GetSchemaRequest
 */
export declare const GetSchemaRequest: GetSchemaRequest$Type;
declare class GetSchemaResponse$Type extends MessageType<GetSchemaResponse> {
    constructor();
    create(value?: PartialMessage<GetSchemaResponse>): GetSchemaResponse;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: GetSchemaResponse): GetSchemaResponse;
    internalBinaryWrite(message: GetSchemaResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.GetSchemaResponse
 */
export declare const GetSchemaResponse: GetSchemaResponse$Type;
declare class AppRegistrationStatusRequest$Type extends MessageType<AppRegistrationStatusRequest> {
    constructor();
    create(value?: PartialMessage<AppRegistrationStatusRequest>): AppRegistrationStatusRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: AppRegistrationStatusRequest): AppRegistrationStatusRequest;
    internalBinaryWrite(message: AppRegistrationStatusRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.AppRegistrationStatusRequest
 */
export declare const AppRegistrationStatusRequest: AppRegistrationStatusRequest$Type;
declare class AppRegistrationStatusResponse$Type extends MessageType<AppRegistrationStatusResponse> {
    constructor();
    create(value?: PartialMessage<AppRegistrationStatusResponse>): AppRegistrationStatusResponse;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: AppRegistrationStatusResponse): AppRegistrationStatusResponse;
    internalBinaryWrite(message: AppRegistrationStatusResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.AppRegistrationStatusResponse
 */
export declare const AppRegistrationStatusResponse: AppRegistrationStatusResponse$Type;
declare class AppRegistrationRequest$Type extends MessageType<AppRegistrationRequest> {
    constructor();
    create(value?: PartialMessage<AppRegistrationRequest>): AppRegistrationRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: AppRegistrationRequest): AppRegistrationRequest;
    internalBinaryWrite(message: AppRegistrationRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.AppRegistrationRequest
 */
export declare const AppRegistrationRequest: AppRegistrationRequest$Type;
declare class AppVerifyRegistrationRequest$Type extends MessageType<AppVerifyRegistrationRequest> {
    constructor();
    create(value?: PartialMessage<AppVerifyRegistrationRequest>): AppVerifyRegistrationRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: AppVerifyRegistrationRequest): AppVerifyRegistrationRequest;
    internalBinaryWrite(message: AppVerifyRegistrationRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.AppVerifyRegistrationRequest
 */
export declare const AppVerifyRegistrationRequest: AppVerifyRegistrationRequest$Type;
declare class AppRegisterRejectRequest$Type extends MessageType<AppRegisterRejectRequest> {
    constructor();
    create(value?: PartialMessage<AppRegisterRejectRequest>): AppRegisterRejectRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: AppRegisterRejectRequest): AppRegisterRejectRequest;
    internalBinaryWrite(message: AppRegisterRejectRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.AppRegisterRejectRequest
 */
export declare const AppRegisterRejectRequest: AppRegisterRejectRequest$Type;
declare class TestRequest$Type extends MessageType<TestRequest> {
    constructor();
    create(value?: PartialMessage<TestRequest>): TestRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: TestRequest): TestRequest;
    internalBinaryWrite(message: TestRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.TestRequest
 */
export declare const TestRequest: TestRequest$Type;
declare class TestResponse$Type extends MessageType<TestResponse> {
    constructor();
    create(value?: PartialMessage<TestResponse>): TestResponse;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: TestResponse): TestResponse;
    internalBinaryWrite(message: TestResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.TestResponse
 */
export declare const TestResponse: TestResponse$Type;
/**
 * @generated ServiceType for protobuf service protos.External
 */
export declare const External: ServiceType;
export {};
