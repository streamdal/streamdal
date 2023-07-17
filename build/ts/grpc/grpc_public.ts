import type * as grpc from '@grpc/grpc-js';
import type { MessageTypeDefinition } from '@grpc/proto-loader';

import type { ExternalClient as _protos_ExternalClient, ExternalDefinition as _protos_ExternalDefinition } from './protos/External';

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
    External: SubtypeConstructor<typeof grpc.Client, _protos_ExternalClient> & { service: _protos_ExternalDefinition }
    GetPipelineRequest: MessageTypeDefinition
    GetPipelineResponse: MessageTypeDefinition
    GetPipelinesRequest: MessageTypeDefinition
    GetPipelinesResponse: MessageTypeDefinition
    GetServiceRequest: MessageTypeDefinition
    GetServiceResponse: MessageTypeDefinition
    GetServicesRequest: MessageTypeDefinition
    GetServicesResponse: MessageTypeDefinition
    GetStepsRequest: MessageTypeDefinition
    GetStepsResponse: MessageTypeDefinition
    SetPipelineRequest: MessageTypeDefinition
    SetPipelineResponse: MessageTypeDefinition
    UpdateStepRequest: MessageTypeDefinition
    UpdateStepResponse: MessageTypeDefinition
  }
}

