import type * as grpc from '@grpc/grpc-js';
import type { EnumTypeDefinition, MessageTypeDefinition } from '@grpc/proto-loader';


type SubtypeConstructor<Constructor extends new (...args: any) => any, Subtype> = {
  new(...args: ConstructorParameters<Constructor>): Subtype;
};

export interface ProtoGrpcType {
  protos: {
    Condition: EnumTypeDefinition
    DeletePipelineRequest: MessageTypeDefinition
    DeletePipelineResponse: MessageTypeDefinition
    GetAllPipelinesRequest: MessageTypeDefinition
    GetAllPipelinesResponse: MessageTypeDefinition
    GetPipelineRequest: MessageTypeDefinition
    GetPipelineResponse: MessageTypeDefinition
    PausePipelineRequest: MessageTypeDefinition
    PausePipelineResponse: MessageTypeDefinition
    PipelineStep: MessageTypeDefinition
    PipelineStepResponse: MessageTypeDefinition
    PipelineStepStatus: EnumTypeDefinition
    ResponseStatus: EnumTypeDefinition
    SetPipelineRequest: MessageTypeDefinition
    SetPipelineResponse: MessageTypeDefinition
    UnpausePipelineRequest: MessageTypeDefinition
    UnpausePipelineResponse: MessageTypeDefinition
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

