import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { TestResponse } from "./external_api";
import type { TestRequest } from "./external_api";
import type { DeleteStepResponse } from "./external_api";
import type { DeleteStepRequest } from "./external_api";
import type { UpdateStepResponse } from "./external_api";
import type { UpdateStepRequest } from "./external_api";
import type { CreateStepResponse } from "./external_api";
import type { CreateStepRequest } from "./external_api";
import type { GetStepsResponse } from "./external_api";
import type { GetStepsRequest } from "./external_api";
import type { DeletePipelineResponse } from "./external_api";
import type { DeletePipelineRequest } from "./external_api";
import type { SetPipelineResponse } from "./external_api";
import type { SetPipelineRequest } from "./external_api";
import type { GetPipelineResponse } from "./external_api";
import type { GetPipelineRequest } from "./external_api";
import type { GetPipelinesResponse } from "./external_api";
import type { GetPipelinesRequest } from "./external_api";
import type { GetServiceResponse } from "./external_api";
import type { GetServiceRequest } from "./external_api";
import type { GetServicesResponse } from "./external_api";
import type { GetServicesRequest } from "./external_api";
import * as grpc from "@grpc/grpc-js";
/**
 * @generated from protobuf service protos.External
 */
export interface IExternalClient {
    /**
     * Build a service map
     *
     * @generated from protobuf rpc: GetServices(protos.GetServicesRequest) returns (protos.GetServicesResponse);
     */
    getServices(input: GetServicesRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: (err: grpc.ServiceError | null, value?: GetServicesResponse) => void): grpc.ClientUnaryCall;
    getServices(input: GetServicesRequest, metadata: grpc.Metadata, callback: (err: grpc.ServiceError | null, value?: GetServicesResponse) => void): grpc.ClientUnaryCall;
    getServices(input: GetServicesRequest, options: grpc.CallOptions, callback: (err: grpc.ServiceError | null, value?: GetServicesResponse) => void): grpc.ClientUnaryCall;
    getServices(input: GetServicesRequest, callback: (err: grpc.ServiceError | null, value?: GetServicesResponse) => void): grpc.ClientUnaryCall;
    /**
     * Figure out consumers/producers, pipelines and targets for a given service
     *
     * @generated from protobuf rpc: GetService(protos.GetServiceRequest) returns (protos.GetServiceResponse);
     */
    getService(input: GetServiceRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: (err: grpc.ServiceError | null, value?: GetServiceResponse) => void): grpc.ClientUnaryCall;
    getService(input: GetServiceRequest, metadata: grpc.Metadata, callback: (err: grpc.ServiceError | null, value?: GetServiceResponse) => void): grpc.ClientUnaryCall;
    getService(input: GetServiceRequest, options: grpc.CallOptions, callback: (err: grpc.ServiceError | null, value?: GetServiceResponse) => void): grpc.ClientUnaryCall;
    getService(input: GetServiceRequest, callback: (err: grpc.ServiceError | null, value?: GetServiceResponse) => void): grpc.ClientUnaryCall;
    /**
     * Get all available pipelines
     *
     * @generated from protobuf rpc: GetPipelines(protos.GetPipelinesRequest) returns (protos.GetPipelinesResponse);
     */
    getPipelines(input: GetPipelinesRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: (err: grpc.ServiceError | null, value?: GetPipelinesResponse) => void): grpc.ClientUnaryCall;
    getPipelines(input: GetPipelinesRequest, metadata: grpc.Metadata, callback: (err: grpc.ServiceError | null, value?: GetPipelinesResponse) => void): grpc.ClientUnaryCall;
    getPipelines(input: GetPipelinesRequest, options: grpc.CallOptions, callback: (err: grpc.ServiceError | null, value?: GetPipelinesResponse) => void): grpc.ClientUnaryCall;
    getPipelines(input: GetPipelinesRequest, callback: (err: grpc.ServiceError | null, value?: GetPipelinesResponse) => void): grpc.ClientUnaryCall;
    /**
     * Get a pipeline (and its steps)
     *
     * @generated from protobuf rpc: GetPipeline(protos.GetPipelineRequest) returns (protos.GetPipelineResponse);
     */
    getPipeline(input: GetPipelineRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: (err: grpc.ServiceError | null, value?: GetPipelineResponse) => void): grpc.ClientUnaryCall;
    getPipeline(input: GetPipelineRequest, metadata: grpc.Metadata, callback: (err: grpc.ServiceError | null, value?: GetPipelineResponse) => void): grpc.ClientUnaryCall;
    getPipeline(input: GetPipelineRequest, options: grpc.CallOptions, callback: (err: grpc.ServiceError | null, value?: GetPipelineResponse) => void): grpc.ClientUnaryCall;
    getPipeline(input: GetPipelineRequest, callback: (err: grpc.ServiceError | null, value?: GetPipelineResponse) => void): grpc.ClientUnaryCall;
    /**
     * Associate steps with a pipeline // Can also use this to set steps in one big push
     *
     * @generated from protobuf rpc: SetPipeline(protos.SetPipelineRequest) returns (protos.SetPipelineResponse);
     */
    setPipeline(input: SetPipelineRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: (err: grpc.ServiceError | null, value?: SetPipelineResponse) => void): grpc.ClientUnaryCall;
    setPipeline(input: SetPipelineRequest, metadata: grpc.Metadata, callback: (err: grpc.ServiceError | null, value?: SetPipelineResponse) => void): grpc.ClientUnaryCall;
    setPipeline(input: SetPipelineRequest, options: grpc.CallOptions, callback: (err: grpc.ServiceError | null, value?: SetPipelineResponse) => void): grpc.ClientUnaryCall;
    setPipeline(input: SetPipelineRequest, callback: (err: grpc.ServiceError | null, value?: SetPipelineResponse) => void): grpc.ClientUnaryCall;
    /**
     * Delete a pipeline
     *
     * @generated from protobuf rpc: DeletePipeline(protos.DeletePipelineRequest) returns (protos.DeletePipelineResponse);
     */
    deletePipeline(input: DeletePipelineRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: (err: grpc.ServiceError | null, value?: DeletePipelineResponse) => void): grpc.ClientUnaryCall;
    deletePipeline(input: DeletePipelineRequest, metadata: grpc.Metadata, callback: (err: grpc.ServiceError | null, value?: DeletePipelineResponse) => void): grpc.ClientUnaryCall;
    deletePipeline(input: DeletePipelineRequest, options: grpc.CallOptions, callback: (err: grpc.ServiceError | null, value?: DeletePipelineResponse) => void): grpc.ClientUnaryCall;
    deletePipeline(input: DeletePipelineRequest, callback: (err: grpc.ServiceError | null, value?: DeletePipelineResponse) => void): grpc.ClientUnaryCall;
    /**
     * Get steps associated with a pipeline
     *
     * @generated from protobuf rpc: GetSteps(protos.GetStepsRequest) returns (protos.GetStepsResponse);
     */
    getSteps(input: GetStepsRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: (err: grpc.ServiceError | null, value?: GetStepsResponse) => void): grpc.ClientUnaryCall;
    getSteps(input: GetStepsRequest, metadata: grpc.Metadata, callback: (err: grpc.ServiceError | null, value?: GetStepsResponse) => void): grpc.ClientUnaryCall;
    getSteps(input: GetStepsRequest, options: grpc.CallOptions, callback: (err: grpc.ServiceError | null, value?: GetStepsResponse) => void): grpc.ClientUnaryCall;
    getSteps(input: GetStepsRequest, callback: (err: grpc.ServiceError | null, value?: GetStepsResponse) => void): grpc.ClientUnaryCall;
    /**
     * Create a step
     *
     * @generated from protobuf rpc: CreateStep(protos.CreateStepRequest) returns (protos.CreateStepResponse);
     */
    createStep(input: CreateStepRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: (err: grpc.ServiceError | null, value?: CreateStepResponse) => void): grpc.ClientUnaryCall;
    createStep(input: CreateStepRequest, metadata: grpc.Metadata, callback: (err: grpc.ServiceError | null, value?: CreateStepResponse) => void): grpc.ClientUnaryCall;
    createStep(input: CreateStepRequest, options: grpc.CallOptions, callback: (err: grpc.ServiceError | null, value?: CreateStepResponse) => void): grpc.ClientUnaryCall;
    createStep(input: CreateStepRequest, callback: (err: grpc.ServiceError | null, value?: CreateStepResponse) => void): grpc.ClientUnaryCall;
    /**
     * Update a step
     *
     * @generated from protobuf rpc: UpdateStep(protos.UpdateStepRequest) returns (protos.UpdateStepResponse);
     */
    updateStep(input: UpdateStepRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: (err: grpc.ServiceError | null, value?: UpdateStepResponse) => void): grpc.ClientUnaryCall;
    updateStep(input: UpdateStepRequest, metadata: grpc.Metadata, callback: (err: grpc.ServiceError | null, value?: UpdateStepResponse) => void): grpc.ClientUnaryCall;
    updateStep(input: UpdateStepRequest, options: grpc.CallOptions, callback: (err: grpc.ServiceError | null, value?: UpdateStepResponse) => void): grpc.ClientUnaryCall;
    updateStep(input: UpdateStepRequest, callback: (err: grpc.ServiceError | null, value?: UpdateStepResponse) => void): grpc.ClientUnaryCall;
    /**
     * Delete a step
     *
     * @generated from protobuf rpc: DeleteStep(protos.DeleteStepRequest) returns (protos.DeleteStepResponse);
     */
    deleteStep(input: DeleteStepRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: (err: grpc.ServiceError | null, value?: DeleteStepResponse) => void): grpc.ClientUnaryCall;
    deleteStep(input: DeleteStepRequest, metadata: grpc.Metadata, callback: (err: grpc.ServiceError | null, value?: DeleteStepResponse) => void): grpc.ClientUnaryCall;
    deleteStep(input: DeleteStepRequest, options: grpc.CallOptions, callback: (err: grpc.ServiceError | null, value?: DeleteStepResponse) => void): grpc.ClientUnaryCall;
    deleteStep(input: DeleteStepRequest, callback: (err: grpc.ServiceError | null, value?: DeleteStepResponse) => void): grpc.ClientUnaryCall;
    /**
     * Test method
     *
     * @generated from protobuf rpc: Test(protos.TestRequest) returns (protos.TestResponse);
     */
    test(input: TestRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: (err: grpc.ServiceError | null, value?: TestResponse) => void): grpc.ClientUnaryCall;
    test(input: TestRequest, metadata: grpc.Metadata, callback: (err: grpc.ServiceError | null, value?: TestResponse) => void): grpc.ClientUnaryCall;
    test(input: TestRequest, options: grpc.CallOptions, callback: (err: grpc.ServiceError | null, value?: TestResponse) => void): grpc.ClientUnaryCall;
    test(input: TestRequest, callback: (err: grpc.ServiceError | null, value?: TestResponse) => void): grpc.ClientUnaryCall;
}
/**
 * @generated from protobuf service protos.External
 */
export declare class ExternalClient extends grpc.Client implements IExternalClient {
    private readonly _binaryOptions;
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: grpc.ClientOptions, binaryOptions?: Partial<BinaryReadOptions & BinaryWriteOptions>);
    /**
     * Build a service map
     *
     * @generated from protobuf rpc: GetServices(protos.GetServicesRequest) returns (protos.GetServicesResponse);
     */
    getServices(input: GetServicesRequest, metadata: grpc.Metadata | grpc.CallOptions | ((err: grpc.ServiceError | null, value?: GetServicesResponse) => void), options?: grpc.CallOptions | ((err: grpc.ServiceError | null, value?: GetServicesResponse) => void), callback?: ((err: grpc.ServiceError | null, value?: GetServicesResponse) => void)): grpc.ClientUnaryCall;
    /**
     * Figure out consumers/producers, pipelines and targets for a given service
     *
     * @generated from protobuf rpc: GetService(protos.GetServiceRequest) returns (protos.GetServiceResponse);
     */
    getService(input: GetServiceRequest, metadata: grpc.Metadata | grpc.CallOptions | ((err: grpc.ServiceError | null, value?: GetServiceResponse) => void), options?: grpc.CallOptions | ((err: grpc.ServiceError | null, value?: GetServiceResponse) => void), callback?: ((err: grpc.ServiceError | null, value?: GetServiceResponse) => void)): grpc.ClientUnaryCall;
    /**
     * Get all available pipelines
     *
     * @generated from protobuf rpc: GetPipelines(protos.GetPipelinesRequest) returns (protos.GetPipelinesResponse);
     */
    getPipelines(input: GetPipelinesRequest, metadata: grpc.Metadata | grpc.CallOptions | ((err: grpc.ServiceError | null, value?: GetPipelinesResponse) => void), options?: grpc.CallOptions | ((err: grpc.ServiceError | null, value?: GetPipelinesResponse) => void), callback?: ((err: grpc.ServiceError | null, value?: GetPipelinesResponse) => void)): grpc.ClientUnaryCall;
    /**
     * Get a pipeline (and its steps)
     *
     * @generated from protobuf rpc: GetPipeline(protos.GetPipelineRequest) returns (protos.GetPipelineResponse);
     */
    getPipeline(input: GetPipelineRequest, metadata: grpc.Metadata | grpc.CallOptions | ((err: grpc.ServiceError | null, value?: GetPipelineResponse) => void), options?: grpc.CallOptions | ((err: grpc.ServiceError | null, value?: GetPipelineResponse) => void), callback?: ((err: grpc.ServiceError | null, value?: GetPipelineResponse) => void)): grpc.ClientUnaryCall;
    /**
     * Associate steps with a pipeline // Can also use this to set steps in one big push
     *
     * @generated from protobuf rpc: SetPipeline(protos.SetPipelineRequest) returns (protos.SetPipelineResponse);
     */
    setPipeline(input: SetPipelineRequest, metadata: grpc.Metadata | grpc.CallOptions | ((err: grpc.ServiceError | null, value?: SetPipelineResponse) => void), options?: grpc.CallOptions | ((err: grpc.ServiceError | null, value?: SetPipelineResponse) => void), callback?: ((err: grpc.ServiceError | null, value?: SetPipelineResponse) => void)): grpc.ClientUnaryCall;
    /**
     * Delete a pipeline
     *
     * @generated from protobuf rpc: DeletePipeline(protos.DeletePipelineRequest) returns (protos.DeletePipelineResponse);
     */
    deletePipeline(input: DeletePipelineRequest, metadata: grpc.Metadata | grpc.CallOptions | ((err: grpc.ServiceError | null, value?: DeletePipelineResponse) => void), options?: grpc.CallOptions | ((err: grpc.ServiceError | null, value?: DeletePipelineResponse) => void), callback?: ((err: grpc.ServiceError | null, value?: DeletePipelineResponse) => void)): grpc.ClientUnaryCall;
    /**
     * Get steps associated with a pipeline
     *
     * @generated from protobuf rpc: GetSteps(protos.GetStepsRequest) returns (protos.GetStepsResponse);
     */
    getSteps(input: GetStepsRequest, metadata: grpc.Metadata | grpc.CallOptions | ((err: grpc.ServiceError | null, value?: GetStepsResponse) => void), options?: grpc.CallOptions | ((err: grpc.ServiceError | null, value?: GetStepsResponse) => void), callback?: ((err: grpc.ServiceError | null, value?: GetStepsResponse) => void)): grpc.ClientUnaryCall;
    /**
     * Create a step
     *
     * @generated from protobuf rpc: CreateStep(protos.CreateStepRequest) returns (protos.CreateStepResponse);
     */
    createStep(input: CreateStepRequest, metadata: grpc.Metadata | grpc.CallOptions | ((err: grpc.ServiceError | null, value?: CreateStepResponse) => void), options?: grpc.CallOptions | ((err: grpc.ServiceError | null, value?: CreateStepResponse) => void), callback?: ((err: grpc.ServiceError | null, value?: CreateStepResponse) => void)): grpc.ClientUnaryCall;
    /**
     * Update a step
     *
     * @generated from protobuf rpc: UpdateStep(protos.UpdateStepRequest) returns (protos.UpdateStepResponse);
     */
    updateStep(input: UpdateStepRequest, metadata: grpc.Metadata | grpc.CallOptions | ((err: grpc.ServiceError | null, value?: UpdateStepResponse) => void), options?: grpc.CallOptions | ((err: grpc.ServiceError | null, value?: UpdateStepResponse) => void), callback?: ((err: grpc.ServiceError | null, value?: UpdateStepResponse) => void)): grpc.ClientUnaryCall;
    /**
     * Delete a step
     *
     * @generated from protobuf rpc: DeleteStep(protos.DeleteStepRequest) returns (protos.DeleteStepResponse);
     */
    deleteStep(input: DeleteStepRequest, metadata: grpc.Metadata | grpc.CallOptions | ((err: grpc.ServiceError | null, value?: DeleteStepResponse) => void), options?: grpc.CallOptions | ((err: grpc.ServiceError | null, value?: DeleteStepResponse) => void), callback?: ((err: grpc.ServiceError | null, value?: DeleteStepResponse) => void)): grpc.ClientUnaryCall;
    /**
     * Test method
     *
     * @generated from protobuf rpc: Test(protos.TestRequest) returns (protos.TestResponse);
     */
    test(input: TestRequest, metadata: grpc.Metadata | grpc.CallOptions | ((err: grpc.ServiceError | null, value?: TestResponse) => void), options?: grpc.CallOptions | ((err: grpc.ServiceError | null, value?: TestResponse) => void), callback?: ((err: grpc.ServiceError | null, value?: TestResponse) => void)): grpc.ClientUnaryCall;
}
