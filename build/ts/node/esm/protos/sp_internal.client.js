import { Internal } from "./sp_internal.js";
import { stackIntercept } from "@protobuf-ts/runtime-rpc";
/**
 * @generated from protobuf service protos.Internal
 */
export class InternalClient {
    constructor(_transport) {
        this._transport = _transport;
        this.typeName = Internal.typeName;
        this.methods = Internal.methods;
        this.options = Internal.options;
    }
    /**
     * Initial method that an SDK should call to register itself with the server.
     * The server will use this stream to send commands to the SDK via the
     * `CommandResponse` message. Clients should continuously listen for
     * CommandResponse messages and re-establish registration if the stream gets
     * disconnected.
     *
     * @generated from protobuf rpc: Register(protos.RegisterRequest) returns (stream protos.Command);
     */
    register(input, options) {
        const method = this.methods[0], opt = this._transport.mergeOptions(options);
        return stackIntercept("serverStreaming", this._transport, method, opt, input);
    }
    /**
     * Declare a new audience that the SDK is able to accept commands for.
     * An SDK would use this method when a new audience is declared by the user
     * via `.Process()`.
     *
     * @generated from protobuf rpc: NewAudience(protos.NewAudienceRequest) returns (protos.StandardResponse);
     */
    newAudience(input, options) {
        const method = this.methods[1], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * SDK is responsible for sending heartbeats to the server to let the server
     * know about active consumers and producers.
     *
     * @generated from protobuf rpc: Heartbeat(protos.HeartbeatRequest) returns (protos.StandardResponse);
     */
    heartbeat(input, options) {
        const method = this.methods[2], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * Use this method when Notify condition has been triggered; the server will
     * decide on what to do about the notification.
     *
     * @generated from protobuf rpc: Notify(protos.NotifyRequest) returns (protos.StandardResponse);
     */
    notify(input, options) {
        const method = this.methods[3], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * Send periodic metrics to the server
     *
     * @generated from protobuf rpc: Metrics(protos.MetricsRequest) returns (protos.StandardResponse);
     */
    metrics(input, options) {
        const method = this.methods[4], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * Used to pull all pipeline configs for the service name in the SDK's constructor
     * This is needed because Register() is async
     *
     * @generated from protobuf rpc: GetAttachCommandsByService(protos.GetAttachCommandsByServiceRequest) returns (protos.GetAttachCommandsByServiceResponse);
     */
    getAttachCommandsByService(input, options) {
        const method = this.methods[5], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * @generated from protobuf rpc: SendTail(stream protos.TailResponse) returns (protos.StandardResponse);
     */
    sendTail(options) {
        const method = this.methods[6], opt = this._transport.mergeOptions(options);
        return stackIntercept("clientStreaming", this._transport, method, opt);
    }
    /**
     * Used by SDK to send a new schema to the server
     *
     * @generated from protobuf rpc: SendSchema(protos.SendSchemaRequest) returns (protos.StandardResponse);
     */
    sendSchema(input, options) {
        const method = this.methods[7], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
}
