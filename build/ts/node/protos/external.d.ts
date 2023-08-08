import { ServiceType } from "@protobuf-ts/runtime-rpc";
import { MessageType } from "@protobuf-ts/runtime";
import { Audience } from "./common.js";
import { Pipeline } from "./pipeline.js";
import { ServiceInfo } from "./info.js";
import { NotifyConfig } from "./notify.js";
/**
 * Notifications
 *
 * @generated from protobuf message protos.CreateNotificationRequest
 */
export interface CreateNotificationRequest {
    /**
     * @generated from protobuf field: protos.NotifyConfig notification = 1;
     */
    notification?: NotifyConfig;
}
/**
 * @generated from protobuf message protos.UpdateNotificationRequest
 */
export interface UpdateNotificationRequest {
    /**
     * @generated from protobuf field: protos.NotifyConfig notification = 1;
     */
    notification?: NotifyConfig;
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
     * @generated from protobuf field: map<string, protos.NotifyConfig> notifications = 1;
     */
    notifications: {
        [key: string]: NotifyConfig;
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
     * @generated from protobuf field: protos.NotifyConfig notification = 1;
     */
    notification?: NotifyConfig;
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
 * Don't think there is anything to pass in (yet)?
 *
 * @generated from protobuf message protos.GetServiceMapRequest
 */
export interface GetServiceMapRequest {
}
/**
 * @generated from protobuf message protos.GetServiceMapResponse
 */
export interface GetServiceMapResponse {
    /**
     * Key == service name
     *
     * @generated from protobuf field: map<string, protos.ServiceInfo> service_map = 1;
     */
    serviceMap: {
        [key: string]: ServiceInfo;
    };
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
declare class CreateNotificationRequest$Type extends MessageType<CreateNotificationRequest> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.CreateNotificationRequest
 */
export declare const CreateNotificationRequest: CreateNotificationRequest$Type;
declare class UpdateNotificationRequest$Type extends MessageType<UpdateNotificationRequest> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.UpdateNotificationRequest
 */
export declare const UpdateNotificationRequest: UpdateNotificationRequest$Type;
declare class DeleteNotificationRequest$Type extends MessageType<DeleteNotificationRequest> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.DeleteNotificationRequest
 */
export declare const DeleteNotificationRequest: DeleteNotificationRequest$Type;
declare class GetNotificationsRequest$Type extends MessageType<GetNotificationsRequest> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.GetNotificationsRequest
 */
export declare const GetNotificationsRequest: GetNotificationsRequest$Type;
declare class GetNotificationsResponse$Type extends MessageType<GetNotificationsResponse> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.GetNotificationsResponse
 */
export declare const GetNotificationsResponse: GetNotificationsResponse$Type;
declare class GetNotificationRequest$Type extends MessageType<GetNotificationRequest> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.GetNotificationRequest
 */
export declare const GetNotificationRequest: GetNotificationRequest$Type;
declare class GetNotificationResponse$Type extends MessageType<GetNotificationResponse> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.GetNotificationResponse
 */
export declare const GetNotificationResponse: GetNotificationResponse$Type;
declare class AttachNotificationRequest$Type extends MessageType<AttachNotificationRequest> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.AttachNotificationRequest
 */
export declare const AttachNotificationRequest: AttachNotificationRequest$Type;
declare class GetServiceMapRequest$Type extends MessageType<GetServiceMapRequest> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.GetServiceMapRequest
 */
export declare const GetServiceMapRequest: GetServiceMapRequest$Type;
declare class GetServiceMapResponse$Type extends MessageType<GetServiceMapResponse> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.GetServiceMapResponse
 */
export declare const GetServiceMapResponse: GetServiceMapResponse$Type;
declare class GetPipelinesRequest$Type extends MessageType<GetPipelinesRequest> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.GetPipelinesRequest
 */
export declare const GetPipelinesRequest: GetPipelinesRequest$Type;
declare class GetPipelinesResponse$Type extends MessageType<GetPipelinesResponse> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.GetPipelinesResponse
 */
export declare const GetPipelinesResponse: GetPipelinesResponse$Type;
declare class GetPipelineRequest$Type extends MessageType<GetPipelineRequest> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.GetPipelineRequest
 */
export declare const GetPipelineRequest: GetPipelineRequest$Type;
declare class GetPipelineResponse$Type extends MessageType<GetPipelineResponse> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.GetPipelineResponse
 */
export declare const GetPipelineResponse: GetPipelineResponse$Type;
declare class CreatePipelineRequest$Type extends MessageType<CreatePipelineRequest> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.CreatePipelineRequest
 */
export declare const CreatePipelineRequest: CreatePipelineRequest$Type;
declare class UpdatePipelineRequest$Type extends MessageType<UpdatePipelineRequest> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.UpdatePipelineRequest
 */
export declare const UpdatePipelineRequest: UpdatePipelineRequest$Type;
declare class DeletePipelineRequest$Type extends MessageType<DeletePipelineRequest> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.DeletePipelineRequest
 */
export declare const DeletePipelineRequest: DeletePipelineRequest$Type;
declare class AttachPipelineRequest$Type extends MessageType<AttachPipelineRequest> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.AttachPipelineRequest
 */
export declare const AttachPipelineRequest: AttachPipelineRequest$Type;
declare class DetachPipelineRequest$Type extends MessageType<DetachPipelineRequest> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.DetachPipelineRequest
 */
export declare const DetachPipelineRequest: DetachPipelineRequest$Type;
declare class PausePipelineRequest$Type extends MessageType<PausePipelineRequest> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.PausePipelineRequest
 */
export declare const PausePipelineRequest: PausePipelineRequest$Type;
declare class ResumePipelineRequest$Type extends MessageType<ResumePipelineRequest> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.ResumePipelineRequest
 */
export declare const ResumePipelineRequest: ResumePipelineRequest$Type;
declare class TestRequest$Type extends MessageType<TestRequest> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.TestRequest
 */
export declare const TestRequest: TestRequest$Type;
declare class TestResponse$Type extends MessageType<TestResponse> {
    constructor();
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
