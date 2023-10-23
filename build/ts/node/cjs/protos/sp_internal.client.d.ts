import type { RpcTransport } from "@protobuf-ts/runtime-rpc";
import type { ServiceInfo } from "@protobuf-ts/runtime-rpc";
import type { SendSchemaRequest } from "./sp_internal";
import type { TailResponse } from "./sp_common";
import type { ClientStreamingCall } from "@protobuf-ts/runtime-rpc";
import type { GetAttachCommandsByServiceResponse } from "./sp_internal";
import type { GetAttachCommandsByServiceRequest } from "./sp_internal";
import type { GetActiveCommandsResponse } from "./sp_internal";
import type { GetActiveCommandsRequest } from "./sp_internal";
import type { MetricsRequest } from "./sp_internal";
import type { NotifyRequest } from "./sp_internal";
import type { HeartbeatRequest } from "./sp_internal";
import type { StandardResponse } from "./sp_common";
import type { NewAudienceRequest } from "./sp_internal";
import type { UnaryCall } from "@protobuf-ts/runtime-rpc";
import type { Command } from "./sp_command";
import type { RegisterRequest } from "./sp_internal";
import type { ServerStreamingCall } from "@protobuf-ts/runtime-rpc";
import type { RpcOptions } from "@protobuf-ts/runtime-rpc";
/**
 * @generated from protobuf service protos.Internal
 */
export interface IInternalClient {
    /**
     * Initial method that an SDK should call to register itself with the server.
     * The server will use this stream to send commands to the SDK via the
     * `CommandResponse` message. Clients should continuously listen for
     * CommandResponse messages and re-establish registration if the stream gets
     * disconnected.
     *
     * @generated from protobuf rpc: Register(protos.RegisterRequest) returns (stream protos.Command);
     */
    register(input: RegisterRequest, options?: RpcOptions): ServerStreamingCall<RegisterRequest, Command>;
    /**
     * Declare a new audience that the SDK is able to accept commands for.
     * An SDK would use this method when a new audience is declared by the user
     * via `.Process()`.
     *
     * @generated from protobuf rpc: NewAudience(protos.NewAudienceRequest) returns (protos.StandardResponse);
     */
    newAudience(input: NewAudienceRequest, options?: RpcOptions): UnaryCall<NewAudienceRequest, StandardResponse>;
    /**
     * SDK is responsible for sending heartbeats to the server to let the server
     * know about active consumers and producers.
     *
     * @generated from protobuf rpc: Heartbeat(protos.HeartbeatRequest) returns (protos.StandardResponse);
     */
    heartbeat(input: HeartbeatRequest, options?: RpcOptions): UnaryCall<HeartbeatRequest, StandardResponse>;
    /**
     * Use this method when Notify condition has been triggered; the server will
     * decide on what to do about the notification.
     *
     * @generated from protobuf rpc: Notify(protos.NotifyRequest) returns (protos.StandardResponse);
     */
    notify(input: NotifyRequest, options?: RpcOptions): UnaryCall<NotifyRequest, StandardResponse>;
    /**
     * Send periodic metrics to the server
     *
     * @generated from protobuf rpc: Metrics(protos.MetricsRequest) returns (protos.StandardResponse);
     */
    metrics(input: MetricsRequest, options?: RpcOptions): UnaryCall<MetricsRequest, StandardResponse>;
    /**
     * Used by SDKs to fetch all active commands for the service during SDK startup.
     * This is needed in order to be able to "resume" where the SDK was at before
     * shutdown or restart. For example - resuming tail requests or resuming
     * attached pipelines.
     *
     * @generated from protobuf rpc: GetActiveCommands(protos.GetActiveCommandsRequest) returns (protos.GetActiveCommandsResponse);
     */
    getActiveCommands(input: GetActiveCommandsRequest, options?: RpcOptions): UnaryCall<GetActiveCommandsRequest, GetActiveCommandsResponse>;
    /**
     * Used to pull all pipeline configs for the service name in the SDK's constructor
     * This is needed because Register() is async.
     *
     * DEPRECATED as of 10.23.2023 -- use GetActiveCommands() instead
     *
     * @generated from protobuf rpc: GetAttachCommandsByService(protos.GetAttachCommandsByServiceRequest) returns (protos.GetAttachCommandsByServiceResponse);
     */
    getAttachCommandsByService(input: GetAttachCommandsByServiceRequest, options?: RpcOptions): UnaryCall<GetAttachCommandsByServiceRequest, GetAttachCommandsByServiceResponse>;
    /**
     * @generated from protobuf rpc: SendTail(stream protos.TailResponse) returns (protos.StandardResponse);
     */
    sendTail(options?: RpcOptions): ClientStreamingCall<TailResponse, StandardResponse>;
    /**
     * Used by SDK to send a new schema to the server
     *
     * @generated from protobuf rpc: SendSchema(protos.SendSchemaRequest) returns (protos.StandardResponse);
     */
    sendSchema(input: SendSchemaRequest, options?: RpcOptions): UnaryCall<SendSchemaRequest, StandardResponse>;
}
/**
 * @generated from protobuf service protos.Internal
 */
export declare class InternalClient implements IInternalClient, ServiceInfo {
    private readonly _transport;
    typeName: string;
    methods: import("@protobuf-ts/runtime-rpc").MethodInfo<any, any>[];
    options: {
        [extensionName: string]: import("@protobuf-ts/runtime").JsonValue;
    };
    constructor(_transport: RpcTransport);
    /**
     * Initial method that an SDK should call to register itself with the server.
     * The server will use this stream to send commands to the SDK via the
     * `CommandResponse` message. Clients should continuously listen for
     * CommandResponse messages and re-establish registration if the stream gets
     * disconnected.
     *
     * @generated from protobuf rpc: Register(protos.RegisterRequest) returns (stream protos.Command);
     */
    register(input: RegisterRequest, options?: RpcOptions): ServerStreamingCall<RegisterRequest, Command>;
    /**
     * Declare a new audience that the SDK is able to accept commands for.
     * An SDK would use this method when a new audience is declared by the user
     * via `.Process()`.
     *
     * @generated from protobuf rpc: NewAudience(protos.NewAudienceRequest) returns (protos.StandardResponse);
     */
    newAudience(input: NewAudienceRequest, options?: RpcOptions): UnaryCall<NewAudienceRequest, StandardResponse>;
    /**
     * SDK is responsible for sending heartbeats to the server to let the server
     * know about active consumers and producers.
     *
     * @generated from protobuf rpc: Heartbeat(protos.HeartbeatRequest) returns (protos.StandardResponse);
     */
    heartbeat(input: HeartbeatRequest, options?: RpcOptions): UnaryCall<HeartbeatRequest, StandardResponse>;
    /**
     * Use this method when Notify condition has been triggered; the server will
     * decide on what to do about the notification.
     *
     * @generated from protobuf rpc: Notify(protos.NotifyRequest) returns (protos.StandardResponse);
     */
    notify(input: NotifyRequest, options?: RpcOptions): UnaryCall<NotifyRequest, StandardResponse>;
    /**
     * Send periodic metrics to the server
     *
     * @generated from protobuf rpc: Metrics(protos.MetricsRequest) returns (protos.StandardResponse);
     */
    metrics(input: MetricsRequest, options?: RpcOptions): UnaryCall<MetricsRequest, StandardResponse>;
    /**
     * Used by SDKs to fetch all active commands for the service during SDK startup.
     * This is needed in order to be able to "resume" where the SDK was at before
     * shutdown or restart. For example - resuming tail requests or resuming
     * attached pipelines.
     *
     * @generated from protobuf rpc: GetActiveCommands(protos.GetActiveCommandsRequest) returns (protos.GetActiveCommandsResponse);
     */
    getActiveCommands(input: GetActiveCommandsRequest, options?: RpcOptions): UnaryCall<GetActiveCommandsRequest, GetActiveCommandsResponse>;
    /**
     * Used to pull all pipeline configs for the service name in the SDK's constructor
     * This is needed because Register() is async.
     *
     * DEPRECATED as of 10.23.2023 -- use GetActiveCommands() instead
     *
     * @generated from protobuf rpc: GetAttachCommandsByService(protos.GetAttachCommandsByServiceRequest) returns (protos.GetAttachCommandsByServiceResponse);
     */
    getAttachCommandsByService(input: GetAttachCommandsByServiceRequest, options?: RpcOptions): UnaryCall<GetAttachCommandsByServiceRequest, GetAttachCommandsByServiceResponse>;
    /**
     * @generated from protobuf rpc: SendTail(stream protos.TailResponse) returns (protos.StandardResponse);
     */
    sendTail(options?: RpcOptions): ClientStreamingCall<TailResponse, StandardResponse>;
    /**
     * Used by SDK to send a new schema to the server
     *
     * @generated from protobuf rpc: SendSchema(protos.SendSchemaRequest) returns (protos.StandardResponse);
     */
    sendSchema(input: SendSchemaRequest, options?: RpcOptions): UnaryCall<SendSchemaRequest, StandardResponse>;
}
