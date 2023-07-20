import { External } from "./external_api.js";
import { stackIntercept } from "@protobuf-ts/runtime-rpc";
/**
 * @generated from protobuf service protos.External
 */
export class ExternalClient {
    _transport;
    typeName = External.typeName;
    methods = External.methods;
    options = External.options;
    constructor(_transport) {
        this._transport = _transport;
    }
    /**
     * Build a service map
     *
     * @generated from protobuf rpc: GetServices(protos.GetServicesRequest) returns (protos.GetServicesResponse);
     */
    getServices(input, options) {
        const method = this.methods[0], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * Figure out consumers/producers, pipelines and targets for a given service
     *
     * @generated from protobuf rpc: GetService(protos.GetServiceRequest) returns (protos.GetServiceResponse);
     */
    getService(input, options) {
        const method = this.methods[1], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * Get all available pipelines
     *
     * @generated from protobuf rpc: GetPipelines(protos.GetPipelinesRequest) returns (protos.GetPipelinesResponse);
     */
    getPipelines(input, options) {
        const method = this.methods[2], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * Get a pipeline (and its steps)
     *
     * @generated from protobuf rpc: GetPipeline(protos.GetPipelineRequest) returns (protos.GetPipelineResponse);
     */
    getPipeline(input, options) {
        const method = this.methods[3], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * Associate steps with a pipeline // Can also use this to set steps in one big push
     *
     * @generated from protobuf rpc: SetPipeline(protos.SetPipelineRequest) returns (protos.SetPipelineResponse);
     */
    setPipeline(input, options) {
        const method = this.methods[4], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * Delete a pipeline
     *
     * @generated from protobuf rpc: DeletePipeline(protos.DeletePipelineRequest) returns (protos.DeletePipelineResponse);
     */
    deletePipeline(input, options) {
        const method = this.methods[5], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * Get steps associated with a pipeline
     *
     * @generated from protobuf rpc: GetSteps(protos.GetStepsRequest) returns (protos.GetStepsResponse);
     */
    getSteps(input, options) {
        const method = this.methods[6], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * Create a step
     *
     * @generated from protobuf rpc: CreateStep(protos.CreateStepRequest) returns (protos.CreateStepResponse);
     */
    createStep(input, options) {
        const method = this.methods[7], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * Update a step
     *
     * @generated from protobuf rpc: UpdateStep(protos.UpdateStepRequest) returns (protos.UpdateStepResponse);
     */
    updateStep(input, options) {
        const method = this.methods[8], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * Delete a step
     *
     * @generated from protobuf rpc: DeleteStep(protos.DeleteStepRequest) returns (protos.DeleteStepResponse);
     */
    deleteStep(input, options) {
        const method = this.methods[9], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * Test method
     *
     * @generated from protobuf rpc: Test(protos.TestRequest) returns (protos.TestResponse);
     */
    test(input, options) {
        const method = this.methods[10], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
}
//# sourceMappingURL=external_api.client.js.map