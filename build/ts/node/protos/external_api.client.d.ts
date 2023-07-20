import type { RpcTransport } from "@protobuf-ts/runtime-rpc";
import type { ServiceInfo } from "@protobuf-ts/runtime-rpc";
import type { TestResponse } from "./external_api.js";
import type { TestRequest } from "./external_api.js";
import type { DeleteStepResponse } from "./external_api.js";
import type { DeleteStepRequest } from "./external_api.js";
import type { UpdateStepResponse } from "./external_api.js";
import type { UpdateStepRequest } from "./external_api.js";
import type { CreateStepResponse } from "./external_api.js";
import type { CreateStepRequest } from "./external_api.js";
import type { GetStepsResponse } from "./external_api.js";
import type { GetStepsRequest } from "./external_api.js";
import type { DeletePipelineResponse } from "./external_api.js";
import type { DeletePipelineRequest } from "./external_api.js";
import type { SetPipelineResponse } from "./external_api.js";
import type { SetPipelineRequest } from "./external_api.js";
import type { GetPipelineResponse } from "./external_api.js";
import type { GetPipelineRequest } from "./external_api.js";
import type { GetPipelinesResponse } from "./external_api.js";
import type { GetPipelinesRequest } from "./external_api.js";
import type { GetServiceResponse } from "./external_api.js";
import type { GetServiceRequest } from "./external_api.js";
import type { GetServicesResponse } from "./external_api.js";
import type { GetServicesRequest } from "./external_api.js";
import type { UnaryCall } from "@protobuf-ts/runtime-rpc";
import type { RpcOptions } from "@protobuf-ts/runtime-rpc";
/**
 * @generated from protobuf service protos.External
 */
export interface IExternalClient {
    /**
     * Build a service map
     *
     * @generated from protobuf rpc: GetServices(protos.GetServicesRequest) returns (protos.GetServicesResponse);
     */
    getServices(input: GetServicesRequest, options?: RpcOptions): UnaryCall<GetServicesRequest, GetServicesResponse>;
    /**
     * Figure out consumers/producers, pipelines and targets for a given service
     *
     * @generated from protobuf rpc: GetService(protos.GetServiceRequest) returns (protos.GetServiceResponse);
     */
    getService(input: GetServiceRequest, options?: RpcOptions): UnaryCall<GetServiceRequest, GetServiceResponse>;
    /**
     * Get all available pipelines
     *
     * @generated from protobuf rpc: GetPipelines(protos.GetPipelinesRequest) returns (protos.GetPipelinesResponse);
     */
    getPipelines(input: GetPipelinesRequest, options?: RpcOptions): UnaryCall<GetPipelinesRequest, GetPipelinesResponse>;
    /**
     * Get a pipeline (and its steps)
     *
     * @generated from protobuf rpc: GetPipeline(protos.GetPipelineRequest) returns (protos.GetPipelineResponse);
     */
    getPipeline(input: GetPipelineRequest, options?: RpcOptions): UnaryCall<GetPipelineRequest, GetPipelineResponse>;
    /**
     * Associate steps with a pipeline // Can also use this to set steps in one big push
     *
     * @generated from protobuf rpc: SetPipeline(protos.SetPipelineRequest) returns (protos.SetPipelineResponse);
     */
    setPipeline(input: SetPipelineRequest, options?: RpcOptions): UnaryCall<SetPipelineRequest, SetPipelineResponse>;
    /**
     * Delete a pipeline
     *
     * @generated from protobuf rpc: DeletePipeline(protos.DeletePipelineRequest) returns (protos.DeletePipelineResponse);
     */
    deletePipeline(input: DeletePipelineRequest, options?: RpcOptions): UnaryCall<DeletePipelineRequest, DeletePipelineResponse>;
    /**
     * Get steps associated with a pipeline
     *
     * @generated from protobuf rpc: GetSteps(protos.GetStepsRequest) returns (protos.GetStepsResponse);
     */
    getSteps(input: GetStepsRequest, options?: RpcOptions): UnaryCall<GetStepsRequest, GetStepsResponse>;
    /**
     * Create a step
     *
     * @generated from protobuf rpc: CreateStep(protos.CreateStepRequest) returns (protos.CreateStepResponse);
     */
    createStep(input: CreateStepRequest, options?: RpcOptions): UnaryCall<CreateStepRequest, CreateStepResponse>;
    /**
     * Update a step
     *
     * @generated from protobuf rpc: UpdateStep(protos.UpdateStepRequest) returns (protos.UpdateStepResponse);
     */
    updateStep(input: UpdateStepRequest, options?: RpcOptions): UnaryCall<UpdateStepRequest, UpdateStepResponse>;
    /**
     * Delete a step
     *
     * @generated from protobuf rpc: DeleteStep(protos.DeleteStepRequest) returns (protos.DeleteStepResponse);
     */
    deleteStep(input: DeleteStepRequest, options?: RpcOptions): UnaryCall<DeleteStepRequest, DeleteStepResponse>;
    /**
     * Test method
     *
     * @generated from protobuf rpc: Test(protos.TestRequest) returns (protos.TestResponse);
     */
    test(input: TestRequest, options?: RpcOptions): UnaryCall<TestRequest, TestResponse>;
}
/**
 * @generated from protobuf service protos.External
 */
export declare class ExternalClient implements IExternalClient, ServiceInfo {
    private readonly _transport;
    typeName: string;
    methods: import("@protobuf-ts/runtime-rpc").MethodInfo<any, any>[];
    options: {
        [extensionName: string]: import("@protobuf-ts/runtime").JsonValue;
    };
    constructor(_transport: RpcTransport);
    /**
     * Build a service map
     *
     * @generated from protobuf rpc: GetServices(protos.GetServicesRequest) returns (protos.GetServicesResponse);
     */
    getServices(input: GetServicesRequest, options?: RpcOptions): UnaryCall<GetServicesRequest, GetServicesResponse>;
    /**
     * Figure out consumers/producers, pipelines and targets for a given service
     *
     * @generated from protobuf rpc: GetService(protos.GetServiceRequest) returns (protos.GetServiceResponse);
     */
    getService(input: GetServiceRequest, options?: RpcOptions): UnaryCall<GetServiceRequest, GetServiceResponse>;
    /**
     * Get all available pipelines
     *
     * @generated from protobuf rpc: GetPipelines(protos.GetPipelinesRequest) returns (protos.GetPipelinesResponse);
     */
    getPipelines(input: GetPipelinesRequest, options?: RpcOptions): UnaryCall<GetPipelinesRequest, GetPipelinesResponse>;
    /**
     * Get a pipeline (and its steps)
     *
     * @generated from protobuf rpc: GetPipeline(protos.GetPipelineRequest) returns (protos.GetPipelineResponse);
     */
    getPipeline(input: GetPipelineRequest, options?: RpcOptions): UnaryCall<GetPipelineRequest, GetPipelineResponse>;
    /**
     * Associate steps with a pipeline // Can also use this to set steps in one big push
     *
     * @generated from protobuf rpc: SetPipeline(protos.SetPipelineRequest) returns (protos.SetPipelineResponse);
     */
    setPipeline(input: SetPipelineRequest, options?: RpcOptions): UnaryCall<SetPipelineRequest, SetPipelineResponse>;
    /**
     * Delete a pipeline
     *
     * @generated from protobuf rpc: DeletePipeline(protos.DeletePipelineRequest) returns (protos.DeletePipelineResponse);
     */
    deletePipeline(input: DeletePipelineRequest, options?: RpcOptions): UnaryCall<DeletePipelineRequest, DeletePipelineResponse>;
    /**
     * Get steps associated with a pipeline
     *
     * @generated from protobuf rpc: GetSteps(protos.GetStepsRequest) returns (protos.GetStepsResponse);
     */
    getSteps(input: GetStepsRequest, options?: RpcOptions): UnaryCall<GetStepsRequest, GetStepsResponse>;
    /**
     * Create a step
     *
     * @generated from protobuf rpc: CreateStep(protos.CreateStepRequest) returns (protos.CreateStepResponse);
     */
    createStep(input: CreateStepRequest, options?: RpcOptions): UnaryCall<CreateStepRequest, CreateStepResponse>;
    /**
     * Update a step
     *
     * @generated from protobuf rpc: UpdateStep(protos.UpdateStepRequest) returns (protos.UpdateStepResponse);
     */
    updateStep(input: UpdateStepRequest, options?: RpcOptions): UnaryCall<UpdateStepRequest, UpdateStepResponse>;
    /**
     * Delete a step
     *
     * @generated from protobuf rpc: DeleteStep(protos.DeleteStepRequest) returns (protos.DeleteStepResponse);
     */
    deleteStep(input: DeleteStepRequest, options?: RpcOptions): UnaryCall<DeleteStepRequest, DeleteStepResponse>;
    /**
     * Test method
     *
     * @generated from protobuf rpc: Test(protos.TestRequest) returns (protos.TestResponse);
     */
    test(input: TestRequest, options?: RpcOptions): UnaryCall<TestRequest, TestResponse>;
}
