import type { RpcTransport } from "@protobuf-ts/runtime-rpc";
import type { ServiceInfo } from "@protobuf-ts/runtime-rpc";
import type { TestResponse } from "./sp_external";
import type { TestRequest } from "./sp_external";
import type { AppRegisterRejectRequest } from "./sp_external";
import type { AppVerifyRegistrationRequest } from "./sp_external";
import type { AppRegistrationRequest } from "./sp_external";
import type { AppRegistrationStatusResponse } from "./sp_external";
import type { AppRegistrationStatusRequest } from "./sp_external";
import type { GetSchemaResponse } from "./sp_external";
import type { GetSchemaRequest } from "./sp_external";
import type { GetAudienceRatesResponse } from "./sp_external";
import type { GetAudienceRatesRequest } from "./sp_external";
import type { ResumeTailRequest } from "./sp_external";
import type { PauseTailRequest } from "./sp_external";
import type { TailResponse } from "./sp_common";
import type { TailRequest } from "./sp_common";
import type { GetMetricsResponse } from "./sp_external";
import type { GetMetricsRequest } from "./sp_external";
import type { DeleteServiceRequest } from "./sp_external";
import type { DeleteAudienceRequest } from "./sp_external";
import type { DetachNotificationRequest } from "./sp_external";
import type { AttachNotificationRequest } from "./sp_external";
import type { GetNotificationResponse } from "./sp_external";
import type { GetNotificationRequest } from "./sp_external";
import type { GetNotificationsResponse } from "./sp_external";
import type { GetNotificationsRequest } from "./sp_external";
import type { DeleteNotificationRequest } from "./sp_external";
import type { UpdateNotificationRequest } from "./sp_external";
import type { CreateNotificationRequest } from "./sp_external";
import type { ResumePipelineRequest } from "./sp_external";
import type { PausePipelineRequest } from "./sp_external";
import type { SetPipelinesRequest } from "./sp_external";
import type { DeletePipelineRequest } from "./sp_external";
import type { StandardResponse } from "./sp_common";
import type { UpdatePipelineRequest } from "./sp_external";
import type { CreatePipelineResponse } from "./sp_external";
import type { CreatePipelineRequest } from "./sp_external";
import type { GetPipelineResponse } from "./sp_external";
import type { GetPipelineRequest } from "./sp_external";
import type { GetPipelinesResponse } from "./sp_external";
import type { GetPipelinesRequest } from "./sp_external";
import type { ServerStreamingCall } from "@protobuf-ts/runtime-rpc";
import type { GetAllResponse } from "./sp_external";
import type { GetAllRequest } from "./sp_external";
import type { UnaryCall } from "@protobuf-ts/runtime-rpc";
import type { RpcOptions } from "@protobuf-ts/runtime-rpc";
/**
 * @generated from protobuf service protos.External
 */
export interface IExternalClient {
    /**
     * Returns all data needed for UI; called on initial console load
     *
     * @generated from protobuf rpc: GetAll(protos.GetAllRequest) returns (protos.GetAllResponse);
     */
    getAll(input: GetAllRequest, options?: RpcOptions): UnaryCall<GetAllRequest, GetAllResponse>;
    /**
     * Used by console to stream updates to UI; called after initial GetAll()
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
     * @generated from protobuf rpc: SetPipelines(protos.SetPipelinesRequest) returns (protos.StandardResponse);
     */
    setPipelines(input: SetPipelinesRequest, options?: RpcOptions): UnaryCall<SetPipelinesRequest, StandardResponse>;
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
     * @deprecated
     * @generated from protobuf rpc: AttachNotification(protos.AttachNotificationRequest) returns (protos.StandardResponse);
     */
    attachNotification(input: AttachNotificationRequest, options?: RpcOptions): UnaryCall<AttachNotificationRequest, StandardResponse>;
    /**
     * Detach a notification config from a pipeline
     *
     * @deprecated
     * @generated from protobuf rpc: DetachNotification(protos.DetachNotificationRequest) returns (protos.StandardResponse);
     */
    detachNotification(input: DetachNotificationRequest, options?: RpcOptions): UnaryCall<DetachNotificationRequest, StandardResponse>;
    /**
     * Delete an audience
     *
     * @generated from protobuf rpc: DeleteAudience(protos.DeleteAudienceRequest) returns (protos.StandardResponse);
     */
    deleteAudience(input: DeleteAudienceRequest, options?: RpcOptions): UnaryCall<DeleteAudienceRequest, StandardResponse>;
    /**
     * Delete a service and all associated audiences
     *
     * @generated from protobuf rpc: DeleteService(protos.DeleteServiceRequest) returns (protos.StandardResponse);
     */
    deleteService(input: DeleteServiceRequest, options?: RpcOptions): UnaryCall<DeleteServiceRequest, StandardResponse>;
    /**
     * Returns all metric counters
     *
     * @generated from protobuf rpc: GetMetrics(protos.GetMetricsRequest) returns (stream protos.GetMetricsResponse);
     */
    getMetrics(input: GetMetricsRequest, options?: RpcOptions): ServerStreamingCall<GetMetricsRequest, GetMetricsResponse>;
    /**
     * @generated from protobuf rpc: Tail(protos.TailRequest) returns (stream protos.TailResponse);
     */
    tail(input: TailRequest, options?: RpcOptions): ServerStreamingCall<TailRequest, TailResponse>;
    /**
     * @generated from protobuf rpc: PauseTail(protos.PauseTailRequest) returns (protos.StandardResponse);
     */
    pauseTail(input: PauseTailRequest, options?: RpcOptions): UnaryCall<PauseTailRequest, StandardResponse>;
    /**
     * @generated from protobuf rpc: ResumeTail(protos.ResumeTailRequest) returns (protos.StandardResponse);
     */
    resumeTail(input: ResumeTailRequest, options?: RpcOptions): UnaryCall<ResumeTailRequest, StandardResponse>;
    /**
     * @generated from protobuf rpc: GetAudienceRates(protos.GetAudienceRatesRequest) returns (stream protos.GetAudienceRatesResponse);
     */
    getAudienceRates(input: GetAudienceRatesRequest, options?: RpcOptions): ServerStreamingCall<GetAudienceRatesRequest, GetAudienceRatesResponse>;
    /**
     * @generated from protobuf rpc: GetSchema(protos.GetSchemaRequest) returns (protos.GetSchemaResponse);
     */
    getSchema(input: GetSchemaRequest, options?: RpcOptions): UnaryCall<GetSchemaRequest, GetSchemaResponse>;
    /**
     * @generated from protobuf rpc: AppRegistrationStatus(protos.AppRegistrationStatusRequest) returns (protos.AppRegistrationStatusResponse);
     */
    appRegistrationStatus(input: AppRegistrationStatusRequest, options?: RpcOptions): UnaryCall<AppRegistrationStatusRequest, AppRegistrationStatusResponse>;
    /**
     * @generated from protobuf rpc: AppRegister(protos.AppRegistrationRequest) returns (protos.StandardResponse);
     */
    appRegister(input: AppRegistrationRequest, options?: RpcOptions): UnaryCall<AppRegistrationRequest, StandardResponse>;
    /**
     * @generated from protobuf rpc: AppVerifyRegistration(protos.AppVerifyRegistrationRequest) returns (protos.StandardResponse);
     */
    appVerifyRegistration(input: AppVerifyRegistrationRequest, options?: RpcOptions): UnaryCall<AppVerifyRegistrationRequest, StandardResponse>;
    /**
     * @generated from protobuf rpc: AppRegisterReject(protos.AppRegisterRejectRequest) returns (protos.StandardResponse);
     */
    appRegisterReject(input: AppRegisterRejectRequest, options?: RpcOptions): UnaryCall<AppRegisterRejectRequest, StandardResponse>;
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
     * Returns all data needed for UI; called on initial console load
     *
     * @generated from protobuf rpc: GetAll(protos.GetAllRequest) returns (protos.GetAllResponse);
     */
    getAll(input: GetAllRequest, options?: RpcOptions): UnaryCall<GetAllRequest, GetAllResponse>;
    /**
     * Used by console to stream updates to UI; called after initial GetAll()
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
     * @generated from protobuf rpc: SetPipelines(protos.SetPipelinesRequest) returns (protos.StandardResponse);
     */
    setPipelines(input: SetPipelinesRequest, options?: RpcOptions): UnaryCall<SetPipelinesRequest, StandardResponse>;
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
     * @deprecated
     * @generated from protobuf rpc: AttachNotification(protos.AttachNotificationRequest) returns (protos.StandardResponse);
     */
    attachNotification(input: AttachNotificationRequest, options?: RpcOptions): UnaryCall<AttachNotificationRequest, StandardResponse>;
    /**
     * Detach a notification config from a pipeline
     *
     * @deprecated
     * @generated from protobuf rpc: DetachNotification(protos.DetachNotificationRequest) returns (protos.StandardResponse);
     */
    detachNotification(input: DetachNotificationRequest, options?: RpcOptions): UnaryCall<DetachNotificationRequest, StandardResponse>;
    /**
     * Delete an audience
     *
     * @generated from protobuf rpc: DeleteAudience(protos.DeleteAudienceRequest) returns (protos.StandardResponse);
     */
    deleteAudience(input: DeleteAudienceRequest, options?: RpcOptions): UnaryCall<DeleteAudienceRequest, StandardResponse>;
    /**
     * Delete a service and all associated audiences
     *
     * @generated from protobuf rpc: DeleteService(protos.DeleteServiceRequest) returns (protos.StandardResponse);
     */
    deleteService(input: DeleteServiceRequest, options?: RpcOptions): UnaryCall<DeleteServiceRequest, StandardResponse>;
    /**
     * Returns all metric counters
     *
     * @generated from protobuf rpc: GetMetrics(protos.GetMetricsRequest) returns (stream protos.GetMetricsResponse);
     */
    getMetrics(input: GetMetricsRequest, options?: RpcOptions): ServerStreamingCall<GetMetricsRequest, GetMetricsResponse>;
    /**
     * @generated from protobuf rpc: Tail(protos.TailRequest) returns (stream protos.TailResponse);
     */
    tail(input: TailRequest, options?: RpcOptions): ServerStreamingCall<TailRequest, TailResponse>;
    /**
     * @generated from protobuf rpc: PauseTail(protos.PauseTailRequest) returns (protos.StandardResponse);
     */
    pauseTail(input: PauseTailRequest, options?: RpcOptions): UnaryCall<PauseTailRequest, StandardResponse>;
    /**
     * @generated from protobuf rpc: ResumeTail(protos.ResumeTailRequest) returns (protos.StandardResponse);
     */
    resumeTail(input: ResumeTailRequest, options?: RpcOptions): UnaryCall<ResumeTailRequest, StandardResponse>;
    /**
     * @generated from protobuf rpc: GetAudienceRates(protos.GetAudienceRatesRequest) returns (stream protos.GetAudienceRatesResponse);
     */
    getAudienceRates(input: GetAudienceRatesRequest, options?: RpcOptions): ServerStreamingCall<GetAudienceRatesRequest, GetAudienceRatesResponse>;
    /**
     * @generated from protobuf rpc: GetSchema(protos.GetSchemaRequest) returns (protos.GetSchemaResponse);
     */
    getSchema(input: GetSchemaRequest, options?: RpcOptions): UnaryCall<GetSchemaRequest, GetSchemaResponse>;
    /**
     * @generated from protobuf rpc: AppRegistrationStatus(protos.AppRegistrationStatusRequest) returns (protos.AppRegistrationStatusResponse);
     */
    appRegistrationStatus(input: AppRegistrationStatusRequest, options?: RpcOptions): UnaryCall<AppRegistrationStatusRequest, AppRegistrationStatusResponse>;
    /**
     * @generated from protobuf rpc: AppRegister(protos.AppRegistrationRequest) returns (protos.StandardResponse);
     */
    appRegister(input: AppRegistrationRequest, options?: RpcOptions): UnaryCall<AppRegistrationRequest, StandardResponse>;
    /**
     * @generated from protobuf rpc: AppVerifyRegistration(protos.AppVerifyRegistrationRequest) returns (protos.StandardResponse);
     */
    appVerifyRegistration(input: AppVerifyRegistrationRequest, options?: RpcOptions): UnaryCall<AppVerifyRegistrationRequest, StandardResponse>;
    /**
     * @generated from protobuf rpc: AppRegisterReject(protos.AppRegisterRejectRequest) returns (protos.StandardResponse);
     */
    appRegisterReject(input: AppRegisterRejectRequest, options?: RpcOptions): UnaryCall<AppRegisterRejectRequest, StandardResponse>;
    /**
     * Test method
     *
     * @generated from protobuf rpc: Test(protos.TestRequest) returns (protos.TestResponse);
     */
    test(input: TestRequest, options?: RpcOptions): UnaryCall<TestRequest, TestResponse>;
}
