import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { MetricsRequest } from "./internal_api";
import type { NotifyRequest } from "./internal_api";
import type { StandardResponse } from "./common";
import type { HeartbeatRequest } from "./internal_api";
import type { CommandResponse } from "./internal_api";
import type { RegisterRequest } from "./internal_api";
import * as grpc from "@grpc/grpc-js";
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
     * @generated from protobuf rpc: Register(protos.RegisterRequest) returns (stream protos.CommandResponse);
     */
    register(input: RegisterRequest, metadata?: grpc.Metadata, options?: grpc.CallOptions): grpc.ClientReadableStream<CommandResponse>;
    register(input: RegisterRequest, options?: grpc.CallOptions): grpc.ClientReadableStream<CommandResponse>;
    /**
     * SDK is responsible for sending heartbeats to the server to let the server
     * know about active consumers and producers.
     *
     * @generated from protobuf rpc: Heartbeat(protos.HeartbeatRequest) returns (protos.StandardResponse);
     */
    heartbeat(input: HeartbeatRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: (err: grpc.ServiceError | null, value?: StandardResponse) => void): grpc.ClientUnaryCall;
    heartbeat(input: HeartbeatRequest, metadata: grpc.Metadata, callback: (err: grpc.ServiceError | null, value?: StandardResponse) => void): grpc.ClientUnaryCall;
    heartbeat(input: HeartbeatRequest, options: grpc.CallOptions, callback: (err: grpc.ServiceError | null, value?: StandardResponse) => void): grpc.ClientUnaryCall;
    heartbeat(input: HeartbeatRequest, callback: (err: grpc.ServiceError | null, value?: StandardResponse) => void): grpc.ClientUnaryCall;
    /**
     * Use this method when Notify condition has been triggered; the server will
     * decide on what to do about the notification.
     *
     * @generated from protobuf rpc: Notify(protos.NotifyRequest) returns (protos.StandardResponse);
     */
    notify(input: NotifyRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: (err: grpc.ServiceError | null, value?: StandardResponse) => void): grpc.ClientUnaryCall;
    notify(input: NotifyRequest, metadata: grpc.Metadata, callback: (err: grpc.ServiceError | null, value?: StandardResponse) => void): grpc.ClientUnaryCall;
    notify(input: NotifyRequest, options: grpc.CallOptions, callback: (err: grpc.ServiceError | null, value?: StandardResponse) => void): grpc.ClientUnaryCall;
    notify(input: NotifyRequest, callback: (err: grpc.ServiceError | null, value?: StandardResponse) => void): grpc.ClientUnaryCall;
    /**
     * Send periodic metrics to the server
     *
     * @generated from protobuf rpc: Metrics(protos.MetricsRequest) returns (protos.StandardResponse);
     */
    metrics(input: MetricsRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: (err: grpc.ServiceError | null, value?: StandardResponse) => void): grpc.ClientUnaryCall;
    metrics(input: MetricsRequest, metadata: grpc.Metadata, callback: (err: grpc.ServiceError | null, value?: StandardResponse) => void): grpc.ClientUnaryCall;
    metrics(input: MetricsRequest, options: grpc.CallOptions, callback: (err: grpc.ServiceError | null, value?: StandardResponse) => void): grpc.ClientUnaryCall;
    metrics(input: MetricsRequest, callback: (err: grpc.ServiceError | null, value?: StandardResponse) => void): grpc.ClientUnaryCall;
}
/**
 * @generated from protobuf service protos.Internal
 */
export declare class InternalClient extends grpc.Client implements IInternalClient {
    private readonly _binaryOptions;
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: grpc.ClientOptions, binaryOptions?: Partial<BinaryReadOptions & BinaryWriteOptions>);
    /**
     * Initial method that an SDK should call to register itself with the server.
     * The server will use this stream to send commands to the SDK via the
     * `CommandResponse` message. Clients should continuously listen for
     * CommandResponse messages and re-establish registration if the stream gets
     * disconnected.
     *
     * @generated from protobuf rpc: Register(protos.RegisterRequest) returns (stream protos.CommandResponse);
     */
    register(input: RegisterRequest, metadata?: grpc.Metadata | grpc.CallOptions, options?: grpc.CallOptions): grpc.ClientReadableStream<CommandResponse>;
    /**
     * SDK is responsible for sending heartbeats to the server to let the server
     * know about active consumers and producers.
     *
     * @generated from protobuf rpc: Heartbeat(protos.HeartbeatRequest) returns (protos.StandardResponse);
     */
    heartbeat(input: HeartbeatRequest, metadata: grpc.Metadata | grpc.CallOptions | ((err: grpc.ServiceError | null, value?: StandardResponse) => void), options?: grpc.CallOptions | ((err: grpc.ServiceError | null, value?: StandardResponse) => void), callback?: ((err: grpc.ServiceError | null, value?: StandardResponse) => void)): grpc.ClientUnaryCall;
    /**
     * Use this method when Notify condition has been triggered; the server will
     * decide on what to do about the notification.
     *
     * @generated from protobuf rpc: Notify(protos.NotifyRequest) returns (protos.StandardResponse);
     */
    notify(input: NotifyRequest, metadata: grpc.Metadata | grpc.CallOptions | ((err: grpc.ServiceError | null, value?: StandardResponse) => void), options?: grpc.CallOptions | ((err: grpc.ServiceError | null, value?: StandardResponse) => void), callback?: ((err: grpc.ServiceError | null, value?: StandardResponse) => void)): grpc.ClientUnaryCall;
    /**
     * Send periodic metrics to the server
     *
     * @generated from protobuf rpc: Metrics(protos.MetricsRequest) returns (protos.StandardResponse);
     */
    metrics(input: MetricsRequest, metadata: grpc.Metadata | grpc.CallOptions | ((err: grpc.ServiceError | null, value?: StandardResponse) => void), options?: grpc.CallOptions | ((err: grpc.ServiceError | null, value?: StandardResponse) => void), callback?: ((err: grpc.ServiceError | null, value?: StandardResponse) => void)): grpc.ClientUnaryCall;
}
