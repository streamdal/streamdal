import type { RpcTransport } from "@protobuf-ts/runtime-rpc";
import type { ServiceInfo } from "@protobuf-ts/runtime-rpc";
import type { GetAttachCommandsByServiceResponse } from "./internal.js";
import type { GetAttachCommandsByServiceRequest } from "./internal.js";
import type { MetricsRequest } from "./internal.js";
import type { NotifyRequest } from "./internal.js";
import type { HeartbeatRequest } from "./internal.js";
import type { StandardResponse } from "./common.js";
import type { NewAudienceRequest } from "./internal.js";
import type { UnaryCall } from "@protobuf-ts/runtime-rpc";
import type { Command } from "./command.js";
import type { RegisterRequest } from "./internal.js";
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
     * Used to pull all pipeline configs for the service name in the SDK's constructor
     * This is needed because Register() is async
     *
     * @generated from protobuf rpc: GetAttachCommandsByService(protos.GetAttachCommandsByServiceRequest) returns (protos.GetAttachCommandsByServiceResponse);
     */
    getAttachCommandsByService(input: GetAttachCommandsByServiceRequest, options?: RpcOptions): UnaryCall<GetAttachCommandsByServiceRequest, GetAttachCommandsByServiceResponse>;
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
     * Used to pull all pipeline configs for the service name in the SDK's constructor
     * This is needed because Register() is async
     *
     * @generated from protobuf rpc: GetAttachCommandsByService(protos.GetAttachCommandsByServiceRequest) returns (protos.GetAttachCommandsByServiceResponse);
     */
    getAttachCommandsByService(input: GetAttachCommandsByServiceRequest, options?: RpcOptions): UnaryCall<GetAttachCommandsByServiceRequest, GetAttachCommandsByServiceResponse>;
}
