import type * as grpc from '@grpc/grpc-js';
import type { EnumTypeDefinition, MessageTypeDefinition } from '@grpc/proto-loader';


type SubtypeConstructor<Constructor extends new (...args: any) => any, Subtype> = {
  new(...args: ConstructorParameters<Constructor>): Subtype;
};

export interface ProtoGrpcType {
  protos: {
    DeletePipelineCommand: MessageTypeDefinition
    PausePipelineCommand: MessageTypeDefinition
    PipelineStep: MessageTypeDefinition
    PipelineStepCondition: EnumTypeDefinition
    SetPipelineCommand: MessageTypeDefinition
    UnpausePipelineCommand: MessageTypeDefinition
    WASMExitCode: EnumTypeDefinition
    WASMRequest: MessageTypeDefinition
    WASMResponse: MessageTypeDefinition
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

