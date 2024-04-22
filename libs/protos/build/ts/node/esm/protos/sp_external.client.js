import { External } from "./sp_external.js";
import { stackIntercept } from "@protobuf-ts/runtime-rpc";
/**
 * @generated from protobuf service protos.External
 */
export class ExternalClient {
    constructor(_transport) {
        this._transport = _transport;
        this.typeName = External.typeName;
        this.methods = External.methods;
        this.options = External.options;
    }
    /**
     * Returns all data needed for UI; called on initial console load
     *
     * @generated from protobuf rpc: GetAll(protos.GetAllRequest) returns (protos.GetAllResponse);
     */
    getAll(input, options) {
        const method = this.methods[0], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * Returns the current _full_ configuration of the server
     *
     * @generated from protobuf rpc: GetConfig(protos.GetConfigRequest) returns (protos.GetConfigResponse);
     */
    getConfig(input, options) {
        const method = this.methods[1], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * Used by console to stream updates to UI; called after initial GetAll()
     *
     * @generated from protobuf rpc: GetAllStream(protos.GetAllRequest) returns (stream protos.GetAllResponse);
     */
    getAllStream(input, options) {
        const method = this.methods[2], opt = this._transport.mergeOptions(options);
        return stackIntercept("serverStreaming", this._transport, method, opt, input);
    }
    /**
     * Returns pipelines (_wasm_bytes field is stripped)
     *
     * @generated from protobuf rpc: GetPipelines(protos.GetPipelinesRequest) returns (protos.GetPipelinesResponse);
     */
    getPipelines(input, options) {
        const method = this.methods[3], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * Returns a single pipeline (_wasm_bytes field is stripped)
     *
     * @generated from protobuf rpc: GetPipeline(protos.GetPipelineRequest) returns (protos.GetPipelineResponse);
     */
    getPipeline(input, options) {
        const method = this.methods[4], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * Create a new pipeline; id must be left empty on create
     *
     * @generated from protobuf rpc: CreatePipeline(protos.CreatePipelineRequest) returns (protos.CreatePipelineResponse);
     */
    createPipeline(input, options) {
        const method = this.methods[5], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * Update an existing pipeline; id must be set
     *
     * @generated from protobuf rpc: UpdatePipeline(protos.UpdatePipelineRequest) returns (protos.StandardResponse);
     */
    updatePipeline(input, options) {
        const method = this.methods[6], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * Delete a pipeline
     *
     * @generated from protobuf rpc: DeletePipeline(protos.DeletePipelineRequest) returns (protos.StandardResponse);
     */
    deletePipeline(input, options) {
        const method = this.methods[7], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * @generated from protobuf rpc: SetPipelines(protos.SetPipelinesRequest) returns (protos.StandardResponse);
     */
    setPipelines(input, options) {
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
     * @generated from protobuf rpc: CreateNotification(protos.CreateNotificationRequest) returns (protos.CreateNotificationResponse);
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
     * @deprecated
     * @generated from protobuf rpc: AttachNotification(protos.AttachNotificationRequest) returns (protos.StandardResponse);
     */
    attachNotification(input, options) {
        const method = this.methods[16], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * Detach a notification config from a pipeline
     *
     * @deprecated
     * @generated from protobuf rpc: DetachNotification(protos.DetachNotificationRequest) returns (protos.StandardResponse);
     */
    detachNotification(input, options) {
        const method = this.methods[17], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * Create an audience. Used for automation tooling (terraform, k8s cr's)
     *
     * @generated from protobuf rpc: CreateAudience(protos.CreateAudienceRequest) returns (protos.StandardResponse);
     */
    createAudience(input, options) {
        const method = this.methods[18], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * Delete an audience
     *
     * @generated from protobuf rpc: DeleteAudience(protos.DeleteAudienceRequest) returns (protos.StandardResponse);
     */
    deleteAudience(input, options) {
        const method = this.methods[19], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * Delete a service and all associated audiences
     *
     * @generated from protobuf rpc: DeleteService(protos.DeleteServiceRequest) returns (protos.StandardResponse);
     */
    deleteService(input, options) {
        const method = this.methods[20], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * Returns all metric counters
     *
     * @generated from protobuf rpc: GetMetrics(protos.GetMetricsRequest) returns (stream protos.GetMetricsResponse);
     */
    getMetrics(input, options) {
        const method = this.methods[21], opt = this._transport.mergeOptions(options);
        return stackIntercept("serverStreaming", this._transport, method, opt, input);
    }
    /**
     * @generated from protobuf rpc: Tail(protos.TailRequest) returns (stream protos.TailResponse);
     */
    tail(input, options) {
        const method = this.methods[22], opt = this._transport.mergeOptions(options);
        return stackIntercept("serverStreaming", this._transport, method, opt, input);
    }
    /**
     * @generated from protobuf rpc: PauseTail(protos.PauseTailRequest) returns (protos.StandardResponse);
     */
    pauseTail(input, options) {
        const method = this.methods[23], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * @generated from protobuf rpc: ResumeTail(protos.ResumeTailRequest) returns (protos.StandardResponse);
     */
    resumeTail(input, options) {
        const method = this.methods[24], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * @generated from protobuf rpc: GetAudienceRates(protos.GetAudienceRatesRequest) returns (stream protos.GetAudienceRatesResponse);
     */
    getAudienceRates(input, options) {
        const method = this.methods[25], opt = this._transport.mergeOptions(options);
        return stackIntercept("serverStreaming", this._transport, method, opt, input);
    }
    /**
     * @generated from protobuf rpc: GetSchema(protos.GetSchemaRequest) returns (protos.GetSchemaResponse);
     */
    getSchema(input, options) {
        const method = this.methods[26], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * @generated from protobuf rpc: AppRegistrationStatus(protos.AppRegistrationStatusRequest) returns (protos.AppRegistrationStatusResponse);
     */
    appRegistrationStatus(input, options) {
        const method = this.methods[27], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * @generated from protobuf rpc: AppRegister(protos.AppRegistrationRequest) returns (protos.StandardResponse);
     */
    appRegister(input, options) {
        const method = this.methods[28], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * @generated from protobuf rpc: AppVerifyRegistration(protos.AppVerifyRegistrationRequest) returns (protos.StandardResponse);
     */
    appVerifyRegistration(input, options) {
        const method = this.methods[29], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * @generated from protobuf rpc: AppRegisterReject(protos.AppRegisterRejectRequest) returns (protos.StandardResponse);
     */
    appRegisterReject(input, options) {
        const method = this.methods[30], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * BEGIN Wasm methods
     *
     * @generated from protobuf rpc: GetWasm(protos.GetWasmRequest) returns (protos.GetWasmResponse);
     */
    getWasm(input, options) {
        const method = this.methods[31], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * @generated from protobuf rpc: GetAllWasm(protos.GetAllWasmRequest) returns (protos.GetAllWasmResponse);
     */
    getAllWasm(input, options) {
        const method = this.methods[32], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * @generated from protobuf rpc: CreateWasm(protos.CreateWasmRequest) returns (protos.CreateWasmResponse);
     */
    createWasm(input, options) {
        const method = this.methods[33], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * @generated from protobuf rpc: UpdateWasm(protos.UpdateWasmRequest) returns (protos.StandardResponse);
     */
    updateWasm(input, options) {
        const method = this.methods[34], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * END Wasm methods
     *
     * @generated from protobuf rpc: DeleteWasm(protos.DeleteWasmRequest) returns (protos.StandardResponse);
     */
    deleteWasm(input, options) {
        const method = this.methods[35], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * Test method
     *
     * @generated from protobuf rpc: Test(protos.TestRequest) returns (protos.TestResponse);
     */
    test(input, options) {
        const method = this.methods[36], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
}
