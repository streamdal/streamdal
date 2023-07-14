import type * as grpc from '@grpc/grpc-js';
import type { EnumTypeDefinition, MessageTypeDefinition } from '@grpc/proto-loader';

import type { InternalClient as _protos_InternalClient, InternalDefinition as _protos_InternalDefinition } from './protos/Internal';

type SubtypeConstructor<Constructor extends new (...args: any) => any, Subtype> = {
  new(...args: ConstructorParameters<Constructor>): Subtype;
};

export interface ProtoGrpcType {
  protos: {
    Audience: MessageTypeDefinition
    Auth: MessageTypeDefinition
    CommandType: EnumTypeDefinition
    DeletePipelineCommand: MessageTypeDefinition
    HeartbeatRequest: MessageTypeDefinition
    Internal: SubtypeConstructor<typeof grpc.Client, _protos_InternalClient> & { service: _protos_InternalDefinition }
    MetricsRequest: MessageTypeDefinition
    NotifyRequest: MessageTypeDefinition
    OperationType: EnumTypeDefinition
    PausePipelineCommand: MessageTypeDefinition
    PipelineStep: MessageTypeDefinition
    PipelineStepCondition: EnumTypeDefinition
    RegisterRequest: MessageTypeDefinition
    RegisterResponse: MessageTypeDefinition
    ResponseCode: EnumTypeDefinition
    SetPipelineCommand: MessageTypeDefinition
    StandardResponse: MessageTypeDefinition
    UnpausePipelineCommand: MessageTypeDefinition
    WASMExitCode: EnumTypeDefinition
    WasmRequest: MessageTypeDefinition
    WasmResponse: MessageTypeDefinition
    steps: {
      CustomStep: MessageTypeDefinition
      DecodeStep: MessageTypeDefinition
      DetectiveStep: MessageTypeDefinition
      DetectiveType: EnumTypeDefinition
      EncodeStep: MessageTypeDefinition
      TransformStep: MessageTypeDefinition
      TransformType: EnumTypeDefinition
    }
  }
}

