import { External } from "./sp_external.js";
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
     * Temporary method to test gRPC-Web streaming
     *
     * @generated from protobuf rpc: GetAllStream(protos.GetAllRequest) returns (stream protos.GetAllResponse);
     */
    getAllStream(input, options) {
        const method = this.methods[1], opt = this._transport.mergeOptions(options);
        return stackIntercept("serverStreaming", this._transport, method, opt, input);
    }
    /**
     * Returns pipelines (_wasm_bytes field is stripped)
     *
     * @generated from protobuf rpc: GetPipelines(protos.GetPipelinesRequest) returns (protos.GetPipelinesResponse);
     */
    getPipelines(input, options) {
        const method = this.methods[2], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * Returns a single pipeline (_wasm_bytes field is stripped)
     *
     * @generated from protobuf rpc: GetPipeline(protos.GetPipelineRequest) returns (protos.GetPipelineResponse);
     */
    getPipeline(input, options) {
        const method = this.methods[3], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * Create a new pipeline; id must be left empty on create
     *
     * @generated from protobuf rpc: CreatePipeline(protos.CreatePipelineRequest) returns (protos.CreatePipelineResponse);
     */
    createPipeline(input, options) {
        const method = this.methods[4], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * Update an existing pipeline; id must be set
     *
     * @generated from protobuf rpc: UpdatePipeline(protos.UpdatePipelineRequest) returns (protos.StandardResponse);
     */
    updatePipeline(input, options) {
        const method = this.methods[5], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * Delete a pipeline
     *
     * @generated from protobuf rpc: DeletePipeline(protos.DeletePipelineRequest) returns (protos.StandardResponse);
     */
    deletePipeline(input, options) {
        const method = this.methods[6], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * Attach a pipeline to an audience
     *
     * @generated from protobuf rpc: AttachPipeline(protos.AttachPipelineRequest) returns (protos.StandardResponse);
     */
    attachPipeline(input, options) {
        const method = this.methods[7], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * Detach a pipeline from an audience
     *
     * @generated from protobuf rpc: DetachPipeline(protos.DetachPipelineRequest) returns (protos.StandardResponse);
     */
    detachPipeline(input, options) {
        const method = this.methods[8], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * Pause a pipeline; noop if pipeline is already paused
     *
     * @generated from protobuf rpc: PausePipeline(protos.PausePipelineRequest) returns (protos.StandardResponse);
     */
    pausePipeline(input, options) {
        const method = this.methods[9], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * Resume a pipeline; noop if pipeline is not paused
     *
     * @generated from protobuf rpc: ResumePipeline(protos.ResumePipelineRequest) returns (protos.StandardResponse);
     */
    resumePipeline(input, options) {
        const method = this.methods[10], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * Create a new notification config
     *
     * @generated from protobuf rpc: CreateNotification(protos.CreateNotificationRequest) returns (protos.StandardResponse);
     */
    createNotification(input, options) {
        const method = this.methods[11], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * Update an existing notification config
     *
     * @generated from protobuf rpc: UpdateNotification(protos.UpdateNotificationRequest) returns (protos.StandardResponse);
     */
    updateNotification(input, options) {
        const method = this.methods[12], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * Delete a notification config
     *
     * @generated from protobuf rpc: DeleteNotification(protos.DeleteNotificationRequest) returns (protos.StandardResponse);
     */
    deleteNotification(input, options) {
        const method = this.methods[13], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * Returns all notification configs
     *
     * @generated from protobuf rpc: GetNotifications(protos.GetNotificationsRequest) returns (protos.GetNotificationsResponse);
     */
    getNotifications(input, options) {
        const method = this.methods[14], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * Returns a single notification config
     *
     * @generated from protobuf rpc: GetNotification(protos.GetNotificationRequest) returns (protos.GetNotificationResponse);
     */
    getNotification(input, options) {
        const method = this.methods[15], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * Attach a notification config to a pipeline
     *
     * @generated from protobuf rpc: AttachNotification(protos.AttachNotificationRequest) returns (protos.StandardResponse);
     */
    attachNotification(input, options) {
        const method = this.methods[16], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * Detach a notification config from a pipeline
     *
     * @generated from protobuf rpc: DetachNotification(protos.DetachNotificationRequest) returns (protos.StandardResponse);
     */
    detachNotification(input, options) {
        const method = this.methods[17], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * Delete an un-attached audience
     *
     * @generated from protobuf rpc: DeleteAudience(protos.DeleteAudienceRequest) returns (protos.StandardResponse);
     */
    deleteAudience(input, options) {
        const method = this.methods[18], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * Returns all metric counters
     *
     * @generated from protobuf rpc: GetMetrics(protos.GetMetricsRequest) returns (stream protos.GetMetricsResponse);
     */
    getMetrics(input, options) {
        const method = this.methods[19], opt = this._transport.mergeOptions(options);
        return stackIntercept("serverStreaming", this._transport, method, opt, input);
    }
    /**
     * @generated from protobuf rpc: Tail(protos.TailRequest) returns (stream protos.TailResponse);
     */
    tail(input, options) {
        const method = this.methods[20], opt = this._transport.mergeOptions(options);
        return stackIntercept("serverStreaming", this._transport, method, opt, input);
    }
    /**
     * @generated from protobuf rpc: GetAudienceRates(protos.GetAudienceRatesRequest) returns (stream protos.GetAudienceRatesResponse);
     */
    getAudienceRates(input, options) {
        const method = this.methods[21], opt = this._transport.mergeOptions(options);
        return stackIntercept("serverStreaming", this._transport, method, opt, input);
    }
    /**
     * Test method
     *
     * @generated from protobuf rpc: Test(protos.TestRequest) returns (protos.TestResponse);
     */
    test(input, options) {
        const method = this.methods[22], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
}
//# sourceMappingURL=sp_external.client.js.map