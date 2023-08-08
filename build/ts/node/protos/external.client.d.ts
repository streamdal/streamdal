import type { RpcTransport } from "@protobuf-ts/runtime-rpc";
import type { ServiceInfo } from "@protobuf-ts/runtime-rpc";
import type { TestResponse } from "./external.js";
import type { TestRequest } from "./external.js";
import type { AttachNotificationRequest } from "./external.js";
import type { GetNotificationResponse } from "./external.js";
import type { GetNotificationRequest } from "./external.js";
import type { GetNotificationsResponse } from "./external.js";
import type { GetNotificationsRequest } from "./external.js";
import type { DeleteNotificationRequest } from "./external.js";
import type { UpdateNotificationRequest } from "./external.js";
import type { CreateNotificationRequest } from "./external.js";
import type { ResumePipelineRequest } from "./external.js";
import type { PausePipelineRequest } from "./external.js";
import type { DetachPipelineRequest } from "./external.js";
import type { AttachPipelineRequest } from "./external.js";
import type { DeletePipelineRequest } from "./external.js";
import type { UpdatePipelineRequest } from "./external.js";
import type { StandardResponse } from "./common.js";
import type { CreatePipelineRequest } from "./external.js";
import type { GetPipelineResponse } from "./external.js";
import type { GetPipelineRequest } from "./external.js";
import type { GetPipelinesResponse } from "./external.js";
import type { GetPipelinesRequest } from "./external.js";
import type { GetServiceMapResponse } from "./external.js";
import type { GetServiceMapRequest } from "./external.js";
import type { UnaryCall } from "@protobuf-ts/runtime-rpc";
import type { RpcOptions } from "@protobuf-ts/runtime-rpc";
/**
 * @generated from protobuf service protos.External
 */
export interface IExternalClient {
    /**
     * Build a service map
     *
     * @generated from protobuf rpc: GetServiceMap(protos.GetServiceMapRequest) returns (protos.GetServiceMapResponse);
     */
    getServiceMap(input: GetServiceMapRequest, options?: RpcOptions): UnaryCall<GetServiceMapRequest, GetServiceMapResponse>;
    /**
     * @generated from protobuf rpc: GetPipelines(protos.GetPipelinesRequest) returns (protos.GetPipelinesResponse);
     */
    getPipelines(input: GetPipelinesRequest, options?: RpcOptions): UnaryCall<GetPipelinesRequest, GetPipelinesResponse>;
    /**
     * @generated from protobuf rpc: GetPipeline(protos.GetPipelineRequest) returns (protos.GetPipelineResponse);
     */
    getPipeline(input: GetPipelineRequest, options?: RpcOptions): UnaryCall<GetPipelineRequest, GetPipelineResponse>;
    /**
     * @generated from protobuf rpc: CreatePipeline(protos.CreatePipelineRequest) returns (protos.StandardResponse);
     */
    createPipeline(input: CreatePipelineRequest, options?: RpcOptions): UnaryCall<CreatePipelineRequest, StandardResponse>;
    /**
     * @generated from protobuf rpc: UpdatePipeline(protos.UpdatePipelineRequest) returns (protos.StandardResponse);
     */
    updatePipeline(input: UpdatePipelineRequest, options?: RpcOptions): UnaryCall<UpdatePipelineRequest, StandardResponse>;
    /**
     * @generated from protobuf rpc: DeletePipeline(protos.DeletePipelineRequest) returns (protos.StandardResponse);
     */
    deletePipeline(input: DeletePipelineRequest, options?: RpcOptions): UnaryCall<DeletePipelineRequest, StandardResponse>;
    /**
     * @generated from protobuf rpc: AttachPipeline(protos.AttachPipelineRequest) returns (protos.StandardResponse);
     */
    attachPipeline(input: AttachPipelineRequest, options?: RpcOptions): UnaryCall<AttachPipelineRequest, StandardResponse>;
    /**
     * @generated from protobuf rpc: DetachPipeline(protos.DetachPipelineRequest) returns (protos.StandardResponse);
     */
    detachPipeline(input: DetachPipelineRequest, options?: RpcOptions): UnaryCall<DetachPipelineRequest, StandardResponse>;
    /**
     * @generated from protobuf rpc: PausePipeline(protos.PausePipelineRequest) returns (protos.StandardResponse);
     */
    pausePipeline(input: PausePipelineRequest, options?: RpcOptions): UnaryCall<PausePipelineRequest, StandardResponse>;
    /**
     * @generated from protobuf rpc: ResumePipeline(protos.ResumePipelineRequest) returns (protos.StandardResponse);
     */
    resumePipeline(input: ResumePipelineRequest, options?: RpcOptions): UnaryCall<ResumePipelineRequest, StandardResponse>;
    /**
     * @generated from protobuf rpc: CreateNotification(protos.CreateNotificationRequest) returns (protos.StandardResponse);
     */
    createNotification(input: CreateNotificationRequest, options?: RpcOptions): UnaryCall<CreateNotificationRequest, StandardResponse>;
    /**
     * @generated from protobuf rpc: UpdateNotification(protos.UpdateNotificationRequest) returns (protos.StandardResponse);
     */
    updateNotification(input: UpdateNotificationRequest, options?: RpcOptions): UnaryCall<UpdateNotificationRequest, StandardResponse>;
    /**
     * @generated from protobuf rpc: DeleteNotification(protos.DeleteNotificationRequest) returns (protos.StandardResponse);
     */
    deleteNotification(input: DeleteNotificationRequest, options?: RpcOptions): UnaryCall<DeleteNotificationRequest, StandardResponse>;
    /**
     * @generated from protobuf rpc: GetNotifications(protos.GetNotificationsRequest) returns (protos.GetNotificationsResponse);
     */
    getNotifications(input: GetNotificationsRequest, options?: RpcOptions): UnaryCall<GetNotificationsRequest, GetNotificationsResponse>;
    /**
     * @generated from protobuf rpc: GetNotification(protos.GetNotificationRequest) returns (protos.GetNotificationResponse);
     */
    getNotification(input: GetNotificationRequest, options?: RpcOptions): UnaryCall<GetNotificationRequest, GetNotificationResponse>;
    /**
     * @generated from protobuf rpc: AttachNotification(protos.AttachNotificationRequest) returns (protos.StandardResponse);
     */
    attachNotification(input: AttachNotificationRequest, options?: RpcOptions): UnaryCall<AttachNotificationRequest, StandardResponse>;
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
     * Build a service map
     *
     * @generated from protobuf rpc: GetServiceMap(protos.GetServiceMapRequest) returns (protos.GetServiceMapResponse);
     */
    getServiceMap(input: GetServiceMapRequest, options?: RpcOptions): UnaryCall<GetServiceMapRequest, GetServiceMapResponse>;
    /**
     * @generated from protobuf rpc: GetPipelines(protos.GetPipelinesRequest) returns (protos.GetPipelinesResponse);
     */
    getPipelines(input: GetPipelinesRequest, options?: RpcOptions): UnaryCall<GetPipelinesRequest, GetPipelinesResponse>;
    /**
     * @generated from protobuf rpc: GetPipeline(protos.GetPipelineRequest) returns (protos.GetPipelineResponse);
     */
    getPipeline(input: GetPipelineRequest, options?: RpcOptions): UnaryCall<GetPipelineRequest, GetPipelineResponse>;
    /**
     * @generated from protobuf rpc: CreatePipeline(protos.CreatePipelineRequest) returns (protos.StandardResponse);
     */
    createPipeline(input: CreatePipelineRequest, options?: RpcOptions): UnaryCall<CreatePipelineRequest, StandardResponse>;
    /**
     * @generated from protobuf rpc: UpdatePipeline(protos.UpdatePipelineRequest) returns (protos.StandardResponse);
     */
    updatePipeline(input: UpdatePipelineRequest, options?: RpcOptions): UnaryCall<UpdatePipelineRequest, StandardResponse>;
    /**
     * @generated from protobuf rpc: DeletePipeline(protos.DeletePipelineRequest) returns (protos.StandardResponse);
     */
    deletePipeline(input: DeletePipelineRequest, options?: RpcOptions): UnaryCall<DeletePipelineRequest, StandardResponse>;
    /**
     * @generated from protobuf rpc: AttachPipeline(protos.AttachPipelineRequest) returns (protos.StandardResponse);
     */
    attachPipeline(input: AttachPipelineRequest, options?: RpcOptions): UnaryCall<AttachPipelineRequest, StandardResponse>;
    /**
     * @generated from protobuf rpc: DetachPipeline(protos.DetachPipelineRequest) returns (protos.StandardResponse);
     */
    detachPipeline(input: DetachPipelineRequest, options?: RpcOptions): UnaryCall<DetachPipelineRequest, StandardResponse>;
    /**
     * @generated from protobuf rpc: PausePipeline(protos.PausePipelineRequest) returns (protos.StandardResponse);
     */
    pausePipeline(input: PausePipelineRequest, options?: RpcOptions): UnaryCall<PausePipelineRequest, StandardResponse>;
    /**
     * @generated from protobuf rpc: ResumePipeline(protos.ResumePipelineRequest) returns (protos.StandardResponse);
     */
    resumePipeline(input: ResumePipelineRequest, options?: RpcOptions): UnaryCall<ResumePipelineRequest, StandardResponse>;
    /**
     * @generated from protobuf rpc: CreateNotification(protos.CreateNotificationRequest) returns (protos.StandardResponse);
     */
    createNotification(input: CreateNotificationRequest, options?: RpcOptions): UnaryCall<CreateNotificationRequest, StandardResponse>;
    /**
     * @generated from protobuf rpc: UpdateNotification(protos.UpdateNotificationRequest) returns (protos.StandardResponse);
     */
    updateNotification(input: UpdateNotificationRequest, options?: RpcOptions): UnaryCall<UpdateNotificationRequest, StandardResponse>;
    /**
     * @generated from protobuf rpc: DeleteNotification(protos.DeleteNotificationRequest) returns (protos.StandardResponse);
     */
    deleteNotification(input: DeleteNotificationRequest, options?: RpcOptions): UnaryCall<DeleteNotificationRequest, StandardResponse>;
    /**
     * @generated from protobuf rpc: GetNotifications(protos.GetNotificationsRequest) returns (protos.GetNotificationsResponse);
     */
    getNotifications(input: GetNotificationsRequest, options?: RpcOptions): UnaryCall<GetNotificationsRequest, GetNotificationsResponse>;
    /**
     * @generated from protobuf rpc: GetNotification(protos.GetNotificationRequest) returns (protos.GetNotificationResponse);
     */
    getNotification(input: GetNotificationRequest, options?: RpcOptions): UnaryCall<GetNotificationRequest, GetNotificationResponse>;
    /**
     * @generated from protobuf rpc: AttachNotification(protos.AttachNotificationRequest) returns (protos.StandardResponse);
     */
    attachNotification(input: AttachNotificationRequest, options?: RpcOptions): UnaryCall<AttachNotificationRequest, StandardResponse>;
    /**
     * Test method
     *
     * @generated from protobuf rpc: Test(protos.TestRequest) returns (protos.TestResponse);
     */
    test(input: TestRequest, options?: RpcOptions): UnaryCall<TestRequest, TestResponse>;
}
