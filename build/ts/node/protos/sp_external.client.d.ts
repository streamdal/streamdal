import type { RpcTransport } from "@protobuf-ts/runtime-rpc";
import type { ServiceInfo } from "@protobuf-ts/runtime-rpc";
import type { TestResponse } from "./sp_external.js";
import type { TestRequest } from "./sp_external.js";
import type { GetMetricsResponse } from "./sp_external.js";
import type { GetMetricsRequest } from "./sp_external.js";
import type { DeleteAudienceRequest } from "./sp_external.js";
import type { DetachNotificationRequest } from "./sp_external.js";
import type { AttachNotificationRequest } from "./sp_external.js";
import type { GetNotificationResponse } from "./sp_external.js";
import type { GetNotificationRequest } from "./sp_external.js";
import type { GetNotificationsResponse } from "./sp_external.js";
import type { GetNotificationsRequest } from "./sp_external.js";
import type { DeleteNotificationRequest } from "./sp_external.js";
import type { UpdateNotificationRequest } from "./sp_external.js";
import type { CreateNotificationRequest } from "./sp_external.js";
import type { ResumePipelineRequest } from "./sp_external.js";
import type { PausePipelineRequest } from "./sp_external.js";
import type { DetachPipelineRequest } from "./sp_external.js";
import type { AttachPipelineRequest } from "./sp_external.js";
import type { DeletePipelineRequest } from "./sp_external.js";
import type { StandardResponse } from "./sp_common.js";
import type { UpdatePipelineRequest } from "./sp_external.js";
import type { CreatePipelineResponse } from "./sp_external.js";
import type { CreatePipelineRequest } from "./sp_external.js";
import type { GetPipelineResponse } from "./sp_external.js";
import type { GetPipelineRequest } from "./sp_external.js";
import type { GetPipelinesResponse } from "./sp_external.js";
import type { GetPipelinesRequest } from "./sp_external.js";
import type { ServerStreamingCall } from "@protobuf-ts/runtime-rpc";
import type { GetAllResponse } from "./sp_external.js";
import type { GetAllRequest } from "./sp_external.js";
import type { UnaryCall } from "@protobuf-ts/runtime-rpc";
import type { RpcOptions } from "@protobuf-ts/runtime-rpc";
/**
 * @generated from protobuf service protos.External
 */
export interface IExternalClient {
    /**
     * Should return everything that is needed to build the initial view in the console
     *
     * @generated from protobuf rpc: GetAll(protos.GetAllRequest) returns (protos.GetAllResponse);
     */
    getAll(input: GetAllRequest, options?: RpcOptions): UnaryCall<GetAllRequest, GetAllResponse>;
    /**
     * Temporary method to test gRPC-Web streaming
     *
     * @generated from protobuf rpc: GetAllStream(protos.GetAllRequest) returns (stream protos.GetAllResponse);
     */
    getAllStream(input: GetAllRequest, options?: RpcOptions): ServerStreamingCall<GetAllRequest, GetAllResponse>;
    /**
     * Returns pipelines (_wasm_bytes field is stripped)
     *
     * @generated from protobuf rpc: GetPipelines(protos.GetPipelinesRequest) returns (protos.GetPipelinesResponse);
     */
    getPipelines(input: GetPipelinesRequest, options?: RpcOptions): UnaryCall<GetPipelinesRequest, GetPipelinesResponse>;
    /**
     * Returns a single pipeline (_wasm_bytes field is stripped)
     *
     * @generated from protobuf rpc: GetPipeline(protos.GetPipelineRequest) returns (protos.GetPipelineResponse);
     */
    getPipeline(input: GetPipelineRequest, options?: RpcOptions): UnaryCall<GetPipelineRequest, GetPipelineResponse>;
    /**
     * Create a new pipeline; id must be left empty on create
     *
     * @generated from protobuf rpc: CreatePipeline(protos.CreatePipelineRequest) returns (protos.CreatePipelineResponse);
     */
    createPipeline(input: CreatePipelineRequest, options?: RpcOptions): UnaryCall<CreatePipelineRequest, CreatePipelineResponse>;
    /**
     * Update an existing pipeline; id must be set
     *
     * @generated from protobuf rpc: UpdatePipeline(protos.UpdatePipelineRequest) returns (protos.StandardResponse);
     */
    updatePipeline(input: UpdatePipelineRequest, options?: RpcOptions): UnaryCall<UpdatePipelineRequest, StandardResponse>;
    /**
     * Delete a pipeline
     *
     * @generated from protobuf rpc: DeletePipeline(protos.DeletePipelineRequest) returns (protos.StandardResponse);
     */
    deletePipeline(input: DeletePipelineRequest, options?: RpcOptions): UnaryCall<DeletePipelineRequest, StandardResponse>;
    /**
     * Attach a pipeline to an audience
     *
     * @generated from protobuf rpc: AttachPipeline(protos.AttachPipelineRequest) returns (protos.StandardResponse);
     */
    attachPipeline(input: AttachPipelineRequest, options?: RpcOptions): UnaryCall<AttachPipelineRequest, StandardResponse>;
    /**
     * Detach a pipeline from an audience
     *
     * @generated from protobuf rpc: DetachPipeline(protos.DetachPipelineRequest) returns (protos.StandardResponse);
     */
    detachPipeline(input: DetachPipelineRequest, options?: RpcOptions): UnaryCall<DetachPipelineRequest, StandardResponse>;
    /**
     * Pause a pipeline; noop if pipeline is already paused
     *
     * @generated from protobuf rpc: PausePipeline(protos.PausePipelineRequest) returns (protos.StandardResponse);
     */
    pausePipeline(input: PausePipelineRequest, options?: RpcOptions): UnaryCall<PausePipelineRequest, StandardResponse>;
    /**
     * Resume a pipeline; noop if pipeline is not paused
     *
     * @generated from protobuf rpc: ResumePipeline(protos.ResumePipelineRequest) returns (protos.StandardResponse);
     */
    resumePipeline(input: ResumePipelineRequest, options?: RpcOptions): UnaryCall<ResumePipelineRequest, StandardResponse>;
    /**
     * Create a new notification config
     *
     * @generated from protobuf rpc: CreateNotification(protos.CreateNotificationRequest) returns (protos.StandardResponse);
     */
    createNotification(input: CreateNotificationRequest, options?: RpcOptions): UnaryCall<CreateNotificationRequest, StandardResponse>;
    /**
     * Update an existing notification config
     *
     * @generated from protobuf rpc: UpdateNotification(protos.UpdateNotificationRequest) returns (protos.StandardResponse);
     */
    updateNotification(input: UpdateNotificationRequest, options?: RpcOptions): UnaryCall<UpdateNotificationRequest, StandardResponse>;
    /**
     * Delete a notification config
     *
     * @generated from protobuf rpc: DeleteNotification(protos.DeleteNotificationRequest) returns (protos.StandardResponse);
     */
    deleteNotification(input: DeleteNotificationRequest, options?: RpcOptions): UnaryCall<DeleteNotificationRequest, StandardResponse>;
    /**
     * Returns all notification configs
     *
     * @generated from protobuf rpc: GetNotifications(protos.GetNotificationsRequest) returns (protos.GetNotificationsResponse);
     */
    getNotifications(input: GetNotificationsRequest, options?: RpcOptions): UnaryCall<GetNotificationsRequest, GetNotificationsResponse>;
    /**
     * Returns a single notification config
     *
     * @generated from protobuf rpc: GetNotification(protos.GetNotificationRequest) returns (protos.GetNotificationResponse);
     */
    getNotification(input: GetNotificationRequest, options?: RpcOptions): UnaryCall<GetNotificationRequest, GetNotificationResponse>;
    /**
     * Attach a notification config to a pipeline
     *
     * @generated from protobuf rpc: AttachNotification(protos.AttachNotificationRequest) returns (protos.StandardResponse);
     */
    attachNotification(input: AttachNotificationRequest, options?: RpcOptions): UnaryCall<AttachNotificationRequest, StandardResponse>;
    /**
     * Detach a notification config from a pipeline
     *
     * @generated from protobuf rpc: DetachNotification(protos.DetachNotificationRequest) returns (protos.StandardResponse);
     */
    detachNotification(input: DetachNotificationRequest, options?: RpcOptions): UnaryCall<DetachNotificationRequest, StandardResponse>;
    /**
     * Delete an un-attached audience
     *
     * @generated from protobuf rpc: DeleteAudience(protos.DeleteAudienceRequest) returns (protos.StandardResponse);
     */
    deleteAudience(input: DeleteAudienceRequest, options?: RpcOptions): UnaryCall<DeleteAudienceRequest, StandardResponse>;
    /**
     * Returns all metric counters
     *
     * @generated from protobuf rpc: GetMetrics(protos.GetMetricsRequest) returns (stream protos.GetMetricsResponse);
     */
    getMetrics(input: GetMetricsRequest, options?: RpcOptions): ServerStreamingCall<GetMetricsRequest, GetMetricsResponse>;
    /**
     * Test method
     *
     * @generated from protobuf rpc: Test(protos.TestRequest) returns (protos.TestResponse);
     */
    test(input: TestRequest, options?: RpcOptions): UnaryCall<TestRequest, TestResponse>;
}
/**
 * @generated from protobuf service protos.External
 */
export declare class ExternalClient implements IExternalClient, ServiceInfo {
    private readonly _transport;
    typeName: string;
    methods: import("@protobuf-ts/runtime-rpc").MethodInfo<any, any>[];
    options: {
        [extensionName: string]: import("@protobuf-ts/runtime").JsonValue;
    };
    constructor(_transport: RpcTransport);
    /**
     * Should return everything that is needed to build the initial view in the console
     *
     * @generated from protobuf rpc: GetAll(protos.GetAllRequest) returns (protos.GetAllResponse);
     */
    getAll(input: GetAllRequest, options?: RpcOptions): UnaryCall<GetAllRequest, GetAllResponse>;
    /**
     * Temporary method to test gRPC-Web streaming
     *
     * @generated from protobuf rpc: GetAllStream(protos.GetAllRequest) returns (stream protos.GetAllResponse);
     */
    getAllStream(input: GetAllRequest, options?: RpcOptions): ServerStreamingCall<GetAllRequest, GetAllResponse>;
    /**
     * Returns pipelines (_wasm_bytes field is stripped)
     *
     * @generated from protobuf rpc: GetPipelines(protos.GetPipelinesRequest) returns (protos.GetPipelinesResponse);
     */
    getPipelines(input: GetPipelinesRequest, options?: RpcOptions): UnaryCall<GetPipelinesRequest, GetPipelinesResponse>;
    /**
     * Returns a single pipeline (_wasm_bytes field is stripped)
     *
     * @generated from protobuf rpc: GetPipeline(protos.GetPipelineRequest) returns (protos.GetPipelineResponse);
     */
    getPipeline(input: GetPipelineRequest, options?: RpcOptions): UnaryCall<GetPipelineRequest, GetPipelineResponse>;
    /**
     * Create a new pipeline; id must be left empty on create
     *
     * @generated from protobuf rpc: CreatePipeline(protos.CreatePipelineRequest) returns (protos.CreatePipelineResponse);
     */
    createPipeline(input: CreatePipelineRequest, options?: RpcOptions): UnaryCall<CreatePipelineRequest, CreatePipelineResponse>;
    /**
     * Update an existing pipeline; id must be set
     *
     * @generated from protobuf rpc: UpdatePipeline(protos.UpdatePipelineRequest) returns (protos.StandardResponse);
     */
    updatePipeline(input: UpdatePipelineRequest, options?: RpcOptions): UnaryCall<UpdatePipelineRequest, StandardResponse>;
    /**
     * Delete a pipeline
     *
     * @generated from protobuf rpc: DeletePipeline(protos.DeletePipelineRequest) returns (protos.StandardResponse);
     */
    deletePipeline(input: DeletePipelineRequest, options?: RpcOptions): UnaryCall<DeletePipelineRequest, StandardResponse>;
    /**
     * Attach a pipeline to an audience
     *
     * @generated from protobuf rpc: AttachPipeline(protos.AttachPipelineRequest) returns (protos.StandardResponse);
     */
    attachPipeline(input: AttachPipelineRequest, options?: RpcOptions): UnaryCall<AttachPipelineRequest, StandardResponse>;
    /**
     * Detach a pipeline from an audience
     *
     * @generated from protobuf rpc: DetachPipeline(protos.DetachPipelineRequest) returns (protos.StandardResponse);
     */
    detachPipeline(input: DetachPipelineRequest, options?: RpcOptions): UnaryCall<DetachPipelineRequest, StandardResponse>;
    /**
     * Pause a pipeline; noop if pipeline is already paused
     *
     * @generated from protobuf rpc: PausePipeline(protos.PausePipelineRequest) returns (protos.StandardResponse);
     */
    pausePipeline(input: PausePipelineRequest, options?: RpcOptions): UnaryCall<PausePipelineRequest, StandardResponse>;
    /**
     * Resume a pipeline; noop if pipeline is not paused
     *
     * @generated from protobuf rpc: ResumePipeline(protos.ResumePipelineRequest) returns (protos.StandardResponse);
     */
    resumePipeline(input: ResumePipelineRequest, options?: RpcOptions): UnaryCall<ResumePipelineRequest, StandardResponse>;
    /**
     * Create a new notification config
     *
     * @generated from protobuf rpc: CreateNotification(protos.CreateNotificationRequest) returns (protos.StandardResponse);
     */
    createNotification(input: CreateNotificationRequest, options?: RpcOptions): UnaryCall<CreateNotificationRequest, StandardResponse>;
    /**
     * Update an existing notification config
     *
     * @generated from protobuf rpc: UpdateNotification(protos.UpdateNotificationRequest) returns (protos.StandardResponse);
     */
    updateNotification(input: UpdateNotificationRequest, options?: RpcOptions): UnaryCall<UpdateNotificationRequest, StandardResponse>;
    /**
     * Delete a notification config
     *
     * @generated from protobuf rpc: DeleteNotification(protos.DeleteNotificationRequest) returns (protos.StandardResponse);
     */
    deleteNotification(input: DeleteNotificationRequest, options?: RpcOptions): UnaryCall<DeleteNotificationRequest, StandardResponse>;
    /**
     * Returns all notification configs
     *
     * @generated from protobuf rpc: GetNotifications(protos.GetNotificationsRequest) returns (protos.GetNotificationsResponse);
     */
    getNotifications(input: GetNotificationsRequest, options?: RpcOptions): UnaryCall<GetNotificationsRequest, GetNotificationsResponse>;
    /**
     * Returns a single notification config
     *
     * @generated from protobuf rpc: GetNotification(protos.GetNotificationRequest) returns (protos.GetNotificationResponse);
     */
    getNotification(input: GetNotificationRequest, options?: RpcOptions): UnaryCall<GetNotificationRequest, GetNotificationResponse>;
    /**
     * Attach a notification config to a pipeline
     *
     * @generated from protobuf rpc: AttachNotification(protos.AttachNotificationRequest) returns (protos.StandardResponse);
     */
    attachNotification(input: AttachNotificationRequest, options?: RpcOptions): UnaryCall<AttachNotificationRequest, StandardResponse>;
    /**
     * Detach a notification config from a pipeline
     *
     * @generated from protobuf rpc: DetachNotification(protos.DetachNotificationRequest) returns (protos.StandardResponse);
     */
    detachNotification(input: DetachNotificationRequest, options?: RpcOptions): UnaryCall<DetachNotificationRequest, StandardResponse>;
    /**
     * Delete an un-attached audience
     *
     * @generated from protobuf rpc: DeleteAudience(protos.DeleteAudienceRequest) returns (protos.StandardResponse);
     */
    deleteAudience(input: DeleteAudienceRequest, options?: RpcOptions): UnaryCall<DeleteAudienceRequest, StandardResponse>;
    /**
     * Returns all metric counters
     *
     * @generated from protobuf rpc: GetMetrics(protos.GetMetricsRequest) returns (stream protos.GetMetricsResponse);
     */
    getMetrics(input: GetMetricsRequest, options?: RpcOptions): ServerStreamingCall<GetMetricsRequest, GetMetricsResponse>;
    /**
     * Test method
     *
     * @generated from protobuf rpc: Test(protos.TestRequest) returns (protos.TestResponse);
     */
    test(input: TestRequest, options?: RpcOptions): UnaryCall<TestRequest, TestResponse>;
}
