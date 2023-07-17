// Original file: ../../protos/grpc_internal.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { HeartbeatRequest as _protos_HeartbeatRequest, HeartbeatRequest__Output as _protos_HeartbeatRequest__Output } from '../protos/HeartbeatRequest';
import type { MetricsRequest as _protos_MetricsRequest, MetricsRequest__Output as _protos_MetricsRequest__Output } from '../protos/MetricsRequest';
import type { NotifyRequest as _protos_NotifyRequest, NotifyRequest__Output as _protos_NotifyRequest__Output } from '../protos/NotifyRequest';
import type { RegisterRequest as _protos_RegisterRequest, RegisterRequest__Output as _protos_RegisterRequest__Output } from '../protos/RegisterRequest';
import type { RegisterResponse as _protos_RegisterResponse, RegisterResponse__Output as _protos_RegisterResponse__Output } from '../protos/RegisterResponse';
import type { StandardResponse as _protos_StandardResponse, StandardResponse__Output as _protos_StandardResponse__Output } from '../protos/StandardResponse';

export interface InternalClient extends grpc.Client {
  Heartbeat(argument: _protos_HeartbeatRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_protos_StandardResponse__Output>): grpc.ClientUnaryCall;
  Heartbeat(argument: _protos_HeartbeatRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_protos_StandardResponse__Output>): grpc.ClientUnaryCall;
  Heartbeat(argument: _protos_HeartbeatRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_protos_StandardResponse__Output>): grpc.ClientUnaryCall;
  Heartbeat(argument: _protos_HeartbeatRequest, callback: grpc.requestCallback<_protos_StandardResponse__Output>): grpc.ClientUnaryCall;
  heartbeat(argument: _protos_HeartbeatRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_protos_StandardResponse__Output>): grpc.ClientUnaryCall;
  heartbeat(argument: _protos_HeartbeatRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_protos_StandardResponse__Output>): grpc.ClientUnaryCall;
  heartbeat(argument: _protos_HeartbeatRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_protos_StandardResponse__Output>): grpc.ClientUnaryCall;
  heartbeat(argument: _protos_HeartbeatRequest, callback: grpc.requestCallback<_protos_StandardResponse__Output>): grpc.ClientUnaryCall;
  
  Metrics(argument: _protos_MetricsRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_protos_StandardResponse__Output>): grpc.ClientUnaryCall;
  Metrics(argument: _protos_MetricsRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_protos_StandardResponse__Output>): grpc.ClientUnaryCall;
  Metrics(argument: _protos_MetricsRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_protos_StandardResponse__Output>): grpc.ClientUnaryCall;
  Metrics(argument: _protos_MetricsRequest, callback: grpc.requestCallback<_protos_StandardResponse__Output>): grpc.ClientUnaryCall;
  metrics(argument: _protos_MetricsRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_protos_StandardResponse__Output>): grpc.ClientUnaryCall;
  metrics(argument: _protos_MetricsRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_protos_StandardResponse__Output>): grpc.ClientUnaryCall;
  metrics(argument: _protos_MetricsRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_protos_StandardResponse__Output>): grpc.ClientUnaryCall;
  metrics(argument: _protos_MetricsRequest, callback: grpc.requestCallback<_protos_StandardResponse__Output>): grpc.ClientUnaryCall;
  
  Notify(argument: _protos_NotifyRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_protos_StandardResponse__Output>): grpc.ClientUnaryCall;
  Notify(argument: _protos_NotifyRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_protos_StandardResponse__Output>): grpc.ClientUnaryCall;
  Notify(argument: _protos_NotifyRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_protos_StandardResponse__Output>): grpc.ClientUnaryCall;
  Notify(argument: _protos_NotifyRequest, callback: grpc.requestCallback<_protos_StandardResponse__Output>): grpc.ClientUnaryCall;
  notify(argument: _protos_NotifyRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_protos_StandardResponse__Output>): grpc.ClientUnaryCall;
  notify(argument: _protos_NotifyRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_protos_StandardResponse__Output>): grpc.ClientUnaryCall;
  notify(argument: _protos_NotifyRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_protos_StandardResponse__Output>): grpc.ClientUnaryCall;
  notify(argument: _protos_NotifyRequest, callback: grpc.requestCallback<_protos_StandardResponse__Output>): grpc.ClientUnaryCall;
  
  Register(argument: _protos_RegisterRequest, metadata: grpc.Metadata, options?: grpc.CallOptions): grpc.ClientReadableStream<_protos_RegisterResponse__Output>;
  Register(argument: _protos_RegisterRequest, options?: grpc.CallOptions): grpc.ClientReadableStream<_protos_RegisterResponse__Output>;
  register(argument: _protos_RegisterRequest, metadata: grpc.Metadata, options?: grpc.CallOptions): grpc.ClientReadableStream<_protos_RegisterResponse__Output>;
  register(argument: _protos_RegisterRequest, options?: grpc.CallOptions): grpc.ClientReadableStream<_protos_RegisterResponse__Output>;
  
}

export interface InternalHandlers extends grpc.UntypedServiceImplementation {
  Heartbeat: grpc.handleUnaryCall<_protos_HeartbeatRequest__Output, _protos_StandardResponse>;
  
  Metrics: grpc.handleUnaryCall<_protos_MetricsRequest__Output, _protos_StandardResponse>;
  
  Notify: grpc.handleUnaryCall<_protos_NotifyRequest__Output, _protos_StandardResponse>;
  
  Register: grpc.handleServerStreamingCall<_protos_RegisterRequest__Output, _protos_RegisterResponse>;
  
}

export interface InternalDefinition extends grpc.ServiceDefinition {
  Heartbeat: MethodDefinition<_protos_HeartbeatRequest, _protos_StandardResponse, _protos_HeartbeatRequest__Output, _protos_StandardResponse__Output>
  Metrics: MethodDefinition<_protos_MetricsRequest, _protos_StandardResponse, _protos_MetricsRequest__Output, _protos_StandardResponse__Output>
  Notify: MethodDefinition<_protos_NotifyRequest, _protos_StandardResponse, _protos_NotifyRequest__Output, _protos_StandardResponse__Output>
  Register: MethodDefinition<_protos_RegisterRequest, _protos_RegisterResponse, _protos_RegisterRequest__Output, _protos_RegisterResponse__Output>
}
