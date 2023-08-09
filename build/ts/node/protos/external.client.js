import { External } from "./external.js";
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
     * Should return everything that is needed to build the initial view in the console
     *
     * @generated from protobuf rpc: GetAll(protos.GetAllRequest) returns (protos.GetAllResponse);
     */
    getAll(input, options) {
        const method = this.methods[0], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * Returns pipelines (_wasm_bytes field is stripped)
     *
     * @generated from protobuf rpc: GetPipelines(protos.GetPipelinesRequest) returns (protos.GetPipelinesResponse);
     */
    getPipelines(input, options) {
        const method = this.methods[1], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * Returns a single pipeline (_wasm_bytes field is stripped)
     *
     * @generated from protobuf rpc: GetPipeline(protos.GetPipelineRequest) returns (protos.GetPipelineResponse);
     */
    getPipeline(input, options) {
        const method = this.methods[2], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * Create a new pipeline; id must be left empty on create
     *
     * @generated from protobuf rpc: CreatePipeline(protos.CreatePipelineRequest) returns (protos.CreatePipelineResponse);
     */
    createPipeline(input, options) {
        const method = this.methods[3], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * Update an existing pipeline; id must be set
     *
     * @generated from protobuf rpc: UpdatePipeline(protos.UpdatePipelineRequest) returns (protos.StandardResponse);
     */
    updatePipeline(input, options) {
        const method = this.methods[4], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * Delete a pipeline
     *
     * @generated from protobuf rpc: DeletePipeline(protos.DeletePipelineRequest) returns (protos.StandardResponse);
     */
    deletePipeline(input, options) {
        const method = this.methods[5], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * Attach a pipeline to an audience
     *
     * @generated from protobuf rpc: AttachPipeline(protos.AttachPipelineRequest) returns (protos.StandardResponse);
     */
    attachPipeline(input, options) {
        const method = this.methods[6], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * Detach a pipeline from an audience
     *
     * @generated from protobuf rpc: DetachPipeline(protos.DetachPipelineRequest) returns (protos.StandardResponse);
     */
    detachPipeline(input, options) {
        const method = this.methods[7], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * Pause a pipeline; noop if pipeline is already paused
     *
     * @generated from protobuf rpc: PausePipeline(protos.PausePipelineRequest) returns (protos.StandardResponse);
     */
    pausePipeline(input, options) {
        const method = this.methods[8], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * Resume a pipeline; noop if pipeline is not paused
     *
     * @generated from protobuf rpc: ResumePipeline(protos.ResumePipelineRequest) returns (protos.StandardResponse);
     */
    resumePipeline(input, options) {
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
//# sourceMappingURL=external.client.js.map