// Original file: ../../protos/grpc_public.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { CreateStepRequest as _protos_CreateStepRequest, CreateStepRequest__Output as _protos_CreateStepRequest__Output } from '../protos/CreateStepRequest';
import type { CreateStepResponse as _protos_CreateStepResponse, CreateStepResponse__Output as _protos_CreateStepResponse__Output } from '../protos/CreateStepResponse';
import type { DeletePipelineRequest as _protos_DeletePipelineRequest, DeletePipelineRequest__Output as _protos_DeletePipelineRequest__Output } from '../protos/DeletePipelineRequest';
import type { DeletePipelineResponse as _protos_DeletePipelineResponse, DeletePipelineResponse__Output as _protos_DeletePipelineResponse__Output } from '../protos/DeletePipelineResponse';
import type { DeleteStepRequest as _protos_DeleteStepRequest, DeleteStepRequest__Output as _protos_DeleteStepRequest__Output } from '../protos/DeleteStepRequest';
import type { DeleteStepResponse as _protos_DeleteStepResponse, DeleteStepResponse__Output as _protos_DeleteStepResponse__Output } from '../protos/DeleteStepResponse';
import type { GetPipelineRequest as _protos_GetPipelineRequest, GetPipelineRequest__Output as _protos_GetPipelineRequest__Output } from '../protos/GetPipelineRequest';
import type { GetPipelineResponse as _protos_GetPipelineResponse, GetPipelineResponse__Output as _protos_GetPipelineResponse__Output } from '../protos/GetPipelineResponse';
import type { GetPipelinesRequest as _protos_GetPipelinesRequest, GetPipelinesRequest__Output as _protos_GetPipelinesRequest__Output } from '../protos/GetPipelinesRequest';
import type { GetPipelinesResponse as _protos_GetPipelinesResponse, GetPipelinesResponse__Output as _protos_GetPipelinesResponse__Output } from '../protos/GetPipelinesResponse';
import type { GetServiceRequest as _protos_GetServiceRequest, GetServiceRequest__Output as _protos_GetServiceRequest__Output } from '../protos/GetServiceRequest';
import type { GetServiceResponse as _protos_GetServiceResponse, GetServiceResponse__Output as _protos_GetServiceResponse__Output } from '../protos/GetServiceResponse';
import type { GetServicesRequest as _protos_GetServicesRequest, GetServicesRequest__Output as _protos_GetServicesRequest__Output } from '../protos/GetServicesRequest';
import type { GetServicesResponse as _protos_GetServicesResponse, GetServicesResponse__Output as _protos_GetServicesResponse__Output } from '../protos/GetServicesResponse';
import type { GetStepsRequest as _protos_GetStepsRequest, GetStepsRequest__Output as _protos_GetStepsRequest__Output } from '../protos/GetStepsRequest';
import type { GetStepsResponse as _protos_GetStepsResponse, GetStepsResponse__Output as _protos_GetStepsResponse__Output } from '../protos/GetStepsResponse';
import type { SetPipelineRequest as _protos_SetPipelineRequest, SetPipelineRequest__Output as _protos_SetPipelineRequest__Output } from '../protos/SetPipelineRequest';
import type { SetPipelineResponse as _protos_SetPipelineResponse, SetPipelineResponse__Output as _protos_SetPipelineResponse__Output } from '../protos/SetPipelineResponse';
import type { UpdateStepRequest as _protos_UpdateStepRequest, UpdateStepRequest__Output as _protos_UpdateStepRequest__Output } from '../protos/UpdateStepRequest';
import type { UpdateStepResponse as _protos_UpdateStepResponse, UpdateStepResponse__Output as _protos_UpdateStepResponse__Output } from '../protos/UpdateStepResponse';

export interface PublicClient extends grpc.Client {
  CreateStep(argument: _protos_CreateStepRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_protos_CreateStepResponse__Output>): grpc.ClientUnaryCall;
  CreateStep(argument: _protos_CreateStepRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_protos_CreateStepResponse__Output>): grpc.ClientUnaryCall;
  CreateStep(argument: _protos_CreateStepRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_protos_CreateStepResponse__Output>): grpc.ClientUnaryCall;
  CreateStep(argument: _protos_CreateStepRequest, callback: grpc.requestCallback<_protos_CreateStepResponse__Output>): grpc.ClientUnaryCall;
  createStep(argument: _protos_CreateStepRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_protos_CreateStepResponse__Output>): grpc.ClientUnaryCall;
  createStep(argument: _protos_CreateStepRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_protos_CreateStepResponse__Output>): grpc.ClientUnaryCall;
  createStep(argument: _protos_CreateStepRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_protos_CreateStepResponse__Output>): grpc.ClientUnaryCall;
  createStep(argument: _protos_CreateStepRequest, callback: grpc.requestCallback<_protos_CreateStepResponse__Output>): grpc.ClientUnaryCall;
  
  DeletePipeline(argument: _protos_DeletePipelineRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_protos_DeletePipelineResponse__Output>): grpc.ClientUnaryCall;
  DeletePipeline(argument: _protos_DeletePipelineRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_protos_DeletePipelineResponse__Output>): grpc.ClientUnaryCall;
  DeletePipeline(argument: _protos_DeletePipelineRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_protos_DeletePipelineResponse__Output>): grpc.ClientUnaryCall;
  DeletePipeline(argument: _protos_DeletePipelineRequest, callback: grpc.requestCallback<_protos_DeletePipelineResponse__Output>): grpc.ClientUnaryCall;
  deletePipeline(argument: _protos_DeletePipelineRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_protos_DeletePipelineResponse__Output>): grpc.ClientUnaryCall;
  deletePipeline(argument: _protos_DeletePipelineRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_protos_DeletePipelineResponse__Output>): grpc.ClientUnaryCall;
  deletePipeline(argument: _protos_DeletePipelineRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_protos_DeletePipelineResponse__Output>): grpc.ClientUnaryCall;
  deletePipeline(argument: _protos_DeletePipelineRequest, callback: grpc.requestCallback<_protos_DeletePipelineResponse__Output>): grpc.ClientUnaryCall;
  
  DeleteStep(argument: _protos_DeleteStepRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_protos_DeleteStepResponse__Output>): grpc.ClientUnaryCall;
  DeleteStep(argument: _protos_DeleteStepRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_protos_DeleteStepResponse__Output>): grpc.ClientUnaryCall;
  DeleteStep(argument: _protos_DeleteStepRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_protos_DeleteStepResponse__Output>): grpc.ClientUnaryCall;
  DeleteStep(argument: _protos_DeleteStepRequest, callback: grpc.requestCallback<_protos_DeleteStepResponse__Output>): grpc.ClientUnaryCall;
  deleteStep(argument: _protos_DeleteStepRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_protos_DeleteStepResponse__Output>): grpc.ClientUnaryCall;
  deleteStep(argument: _protos_DeleteStepRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_protos_DeleteStepResponse__Output>): grpc.ClientUnaryCall;
  deleteStep(argument: _protos_DeleteStepRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_protos_DeleteStepResponse__Output>): grpc.ClientUnaryCall;
  deleteStep(argument: _protos_DeleteStepRequest, callback: grpc.requestCallback<_protos_DeleteStepResponse__Output>): grpc.ClientUnaryCall;
  
  GetPipeline(argument: _protos_GetPipelineRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_protos_GetPipelineResponse__Output>): grpc.ClientUnaryCall;
  GetPipeline(argument: _protos_GetPipelineRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_protos_GetPipelineResponse__Output>): grpc.ClientUnaryCall;
  GetPipeline(argument: _protos_GetPipelineRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_protos_GetPipelineResponse__Output>): grpc.ClientUnaryCall;
  GetPipeline(argument: _protos_GetPipelineRequest, callback: grpc.requestCallback<_protos_GetPipelineResponse__Output>): grpc.ClientUnaryCall;
  getPipeline(argument: _protos_GetPipelineRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_protos_GetPipelineResponse__Output>): grpc.ClientUnaryCall;
  getPipeline(argument: _protos_GetPipelineRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_protos_GetPipelineResponse__Output>): grpc.ClientUnaryCall;
  getPipeline(argument: _protos_GetPipelineRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_protos_GetPipelineResponse__Output>): grpc.ClientUnaryCall;
  getPipeline(argument: _protos_GetPipelineRequest, callback: grpc.requestCallback<_protos_GetPipelineResponse__Output>): grpc.ClientUnaryCall;
  
  GetPipelines(argument: _protos_GetPipelinesRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_protos_GetPipelinesResponse__Output>): grpc.ClientUnaryCall;
  GetPipelines(argument: _protos_GetPipelinesRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_protos_GetPipelinesResponse__Output>): grpc.ClientUnaryCall;
  GetPipelines(argument: _protos_GetPipelinesRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_protos_GetPipelinesResponse__Output>): grpc.ClientUnaryCall;
  GetPipelines(argument: _protos_GetPipelinesRequest, callback: grpc.requestCallback<_protos_GetPipelinesResponse__Output>): grpc.ClientUnaryCall;
  getPipelines(argument: _protos_GetPipelinesRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_protos_GetPipelinesResponse__Output>): grpc.ClientUnaryCall;
  getPipelines(argument: _protos_GetPipelinesRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_protos_GetPipelinesResponse__Output>): grpc.ClientUnaryCall;
  getPipelines(argument: _protos_GetPipelinesRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_protos_GetPipelinesResponse__Output>): grpc.ClientUnaryCall;
  getPipelines(argument: _protos_GetPipelinesRequest, callback: grpc.requestCallback<_protos_GetPipelinesResponse__Output>): grpc.ClientUnaryCall;
  
  GetService(argument: _protos_GetServiceRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_protos_GetServiceResponse__Output>): grpc.ClientUnaryCall;
  GetService(argument: _protos_GetServiceRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_protos_GetServiceResponse__Output>): grpc.ClientUnaryCall;
  GetService(argument: _protos_GetServiceRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_protos_GetServiceResponse__Output>): grpc.ClientUnaryCall;
  GetService(argument: _protos_GetServiceRequest, callback: grpc.requestCallback<_protos_GetServiceResponse__Output>): grpc.ClientUnaryCall;
  getService(argument: _protos_GetServiceRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_protos_GetServiceResponse__Output>): grpc.ClientUnaryCall;
  getService(argument: _protos_GetServiceRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_protos_GetServiceResponse__Output>): grpc.ClientUnaryCall;
  getService(argument: _protos_GetServiceRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_protos_GetServiceResponse__Output>): grpc.ClientUnaryCall;
  getService(argument: _protos_GetServiceRequest, callback: grpc.requestCallback<_protos_GetServiceResponse__Output>): grpc.ClientUnaryCall;
  
  GetServices(argument: _protos_GetServicesRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_protos_GetServicesResponse__Output>): grpc.ClientUnaryCall;
  GetServices(argument: _protos_GetServicesRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_protos_GetServicesResponse__Output>): grpc.ClientUnaryCall;
  GetServices(argument: _protos_GetServicesRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_protos_GetServicesResponse__Output>): grpc.ClientUnaryCall;
  GetServices(argument: _protos_GetServicesRequest, callback: grpc.requestCallback<_protos_GetServicesResponse__Output>): grpc.ClientUnaryCall;
  getServices(argument: _protos_GetServicesRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_protos_GetServicesResponse__Output>): grpc.ClientUnaryCall;
  getServices(argument: _protos_GetServicesRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_protos_GetServicesResponse__Output>): grpc.ClientUnaryCall;
  getServices(argument: _protos_GetServicesRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_protos_GetServicesResponse__Output>): grpc.ClientUnaryCall;
  getServices(argument: _protos_GetServicesRequest, callback: grpc.requestCallback<_protos_GetServicesResponse__Output>): grpc.ClientUnaryCall;
  
  GetSteps(argument: _protos_GetStepsRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_protos_GetStepsResponse__Output>): grpc.ClientUnaryCall;
  GetSteps(argument: _protos_GetStepsRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_protos_GetStepsResponse__Output>): grpc.ClientUnaryCall;
  GetSteps(argument: _protos_GetStepsRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_protos_GetStepsResponse__Output>): grpc.ClientUnaryCall;
  GetSteps(argument: _protos_GetStepsRequest, callback: grpc.requestCallback<_protos_GetStepsResponse__Output>): grpc.ClientUnaryCall;
  getSteps(argument: _protos_GetStepsRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_protos_GetStepsResponse__Output>): grpc.ClientUnaryCall;
  getSteps(argument: _protos_GetStepsRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_protos_GetStepsResponse__Output>): grpc.ClientUnaryCall;
  getSteps(argument: _protos_GetStepsRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_protos_GetStepsResponse__Output>): grpc.ClientUnaryCall;
  getSteps(argument: _protos_GetStepsRequest, callback: grpc.requestCallback<_protos_GetStepsResponse__Output>): grpc.ClientUnaryCall;
  
  SetPipeline(argument: _protos_SetPipelineRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_protos_SetPipelineResponse__Output>): grpc.ClientUnaryCall;
  SetPipeline(argument: _protos_SetPipelineRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_protos_SetPipelineResponse__Output>): grpc.ClientUnaryCall;
  SetPipeline(argument: _protos_SetPipelineRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_protos_SetPipelineResponse__Output>): grpc.ClientUnaryCall;
  SetPipeline(argument: _protos_SetPipelineRequest, callback: grpc.requestCallback<_protos_SetPipelineResponse__Output>): grpc.ClientUnaryCall;
  setPipeline(argument: _protos_SetPipelineRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_protos_SetPipelineResponse__Output>): grpc.ClientUnaryCall;
  setPipeline(argument: _protos_SetPipelineRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_protos_SetPipelineResponse__Output>): grpc.ClientUnaryCall;
  setPipeline(argument: _protos_SetPipelineRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_protos_SetPipelineResponse__Output>): grpc.ClientUnaryCall;
  setPipeline(argument: _protos_SetPipelineRequest, callback: grpc.requestCallback<_protos_SetPipelineResponse__Output>): grpc.ClientUnaryCall;
  
  UpdateStep(argument: _protos_UpdateStepRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_protos_UpdateStepResponse__Output>): grpc.ClientUnaryCall;
  UpdateStep(argument: _protos_UpdateStepRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_protos_UpdateStepResponse__Output>): grpc.ClientUnaryCall;
  UpdateStep(argument: _protos_UpdateStepRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_protos_UpdateStepResponse__Output>): grpc.ClientUnaryCall;
  UpdateStep(argument: _protos_UpdateStepRequest, callback: grpc.requestCallback<_protos_UpdateStepResponse__Output>): grpc.ClientUnaryCall;
  updateStep(argument: _protos_UpdateStepRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_protos_UpdateStepResponse__Output>): grpc.ClientUnaryCall;
  updateStep(argument: _protos_UpdateStepRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_protos_UpdateStepResponse__Output>): grpc.ClientUnaryCall;
  updateStep(argument: _protos_UpdateStepRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_protos_UpdateStepResponse__Output>): grpc.ClientUnaryCall;
  updateStep(argument: _protos_UpdateStepRequest, callback: grpc.requestCallback<_protos_UpdateStepResponse__Output>): grpc.ClientUnaryCall;
  
}

export interface PublicHandlers extends grpc.UntypedServiceImplementation {
  CreateStep: grpc.handleUnaryCall<_protos_CreateStepRequest__Output, _protos_CreateStepResponse>;
  
  DeletePipeline: grpc.handleUnaryCall<_protos_DeletePipelineRequest__Output, _protos_DeletePipelineResponse>;
  
  DeleteStep: grpc.handleUnaryCall<_protos_DeleteStepRequest__Output, _protos_DeleteStepResponse>;
  
  GetPipeline: grpc.handleUnaryCall<_protos_GetPipelineRequest__Output, _protos_GetPipelineResponse>;
  
  GetPipelines: grpc.handleUnaryCall<_protos_GetPipelinesRequest__Output, _protos_GetPipelinesResponse>;
  
  GetService: grpc.handleUnaryCall<_protos_GetServiceRequest__Output, _protos_GetServiceResponse>;
  
  GetServices: grpc.handleUnaryCall<_protos_GetServicesRequest__Output, _protos_GetServicesResponse>;
  
  GetSteps: grpc.handleUnaryCall<_protos_GetStepsRequest__Output, _protos_GetStepsResponse>;
  
  SetPipeline: grpc.handleUnaryCall<_protos_SetPipelineRequest__Output, _protos_SetPipelineResponse>;
  
  UpdateStep: grpc.handleUnaryCall<_protos_UpdateStepRequest__Output, _protos_UpdateStepResponse>;
  
}

export interface PublicDefinition extends grpc.ServiceDefinition {
  CreateStep: MethodDefinition<_protos_CreateStepRequest, _protos_CreateStepResponse, _protos_CreateStepRequest__Output, _protos_CreateStepResponse__Output>
  DeletePipeline: MethodDefinition<_protos_DeletePipelineRequest, _protos_DeletePipelineResponse, _protos_DeletePipelineRequest__Output, _protos_DeletePipelineResponse__Output>
  DeleteStep: MethodDefinition<_protos_DeleteStepRequest, _protos_DeleteStepResponse, _protos_DeleteStepRequest__Output, _protos_DeleteStepResponse__Output>
  GetPipeline: MethodDefinition<_protos_GetPipelineRequest, _protos_GetPipelineResponse, _protos_GetPipelineRequest__Output, _protos_GetPipelineResponse__Output>
  GetPipelines: MethodDefinition<_protos_GetPipelinesRequest, _protos_GetPipelinesResponse, _protos_GetPipelinesRequest__Output, _protos_GetPipelinesResponse__Output>
  GetService: MethodDefinition<_protos_GetServiceRequest, _protos_GetServiceResponse, _protos_GetServiceRequest__Output, _protos_GetServiceResponse__Output>
  GetServices: MethodDefinition<_protos_GetServicesRequest, _protos_GetServicesResponse, _protos_GetServicesRequest__Output, _protos_GetServicesResponse__Output>
  GetSteps: MethodDefinition<_protos_GetStepsRequest, _protos_GetStepsResponse, _protos_GetStepsRequest__Output, _protos_GetStepsResponse__Output>
  SetPipeline: MethodDefinition<_protos_SetPipelineRequest, _protos_SetPipelineResponse, _protos_SetPipelineRequest__Output, _protos_SetPipelineResponse__Output>
  UpdateStep: MethodDefinition<_protos_UpdateStepRequest, _protos_UpdateStepResponse, _protos_UpdateStepRequest__Output, _protos_UpdateStepResponse__Output>
}
