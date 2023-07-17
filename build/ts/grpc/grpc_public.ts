import type * as grpc from '@grpc/grpc-js';
import type { MessageTypeDefinition } from '@grpc/proto-loader';

import type { PublicClient as _protos_PublicClient, PublicDefinition as _protos_PublicDefinition } from './protos/Public';

type SubtypeConstructor<Constructor extends new (...args: any) => any, Subtype> = {
  new(...args: ConstructorParameters<Constructor>): Subtype;
};

export interface ProtoGrpcType {
  protos: {
    CreateStepRequest: MessageTypeDefinition
    CreateStepResponse: MessageTypeDefinition
    DeletePipelineRequest: MessageTypeDefinition
    DeletePipelineResponse: MessageTypeDefinition
    DeleteStepRequest: MessageTypeDefinition
    DeleteStepResponse: MessageTypeDefinition
    GetPipelineRequest: MessageTypeDefinition
    GetPipelineResponse: MessageTypeDefinition
    GetPipelinesRequest: MessageTypeDefinition
    GetPipelinesResponse: MessageTypeDefinition
    GetServicesRequest: MessageTypeDefinition
    GetServicesResponse: MessageTypeDefinition
    GetStepsRequest: MessageTypeDefinition
    GetStepsResponse: MessageTypeDefinition
    Public: SubtypeConstructor<typeof grpc.Client, _protos_PublicClient> & { service: _protos_PublicDefinition }
    UpdatePipelineRequest: MessageTypeDefinition
    UpdatePipelineResponse: MessageTypeDefinition
    UpdateStepRequest: MessageTypeDefinition
    UpdateStepResponse: MessageTypeDefinition
  }
}

