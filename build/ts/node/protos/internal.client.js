import { Internal } from "./internal.js";
import { stackIntercept } from "@protobuf-ts/runtime-rpc";
/**
 * @generated from protobuf service protos.Internal
 */
export class InternalClient {
    _transport;
    typeName = Internal.typeName;
    methods = Internal.methods;
    options = Internal.options;
    constructor(_transport) {
        this._transport = _transport;
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
     * SDK is responsible for sending heartbeats to the server to let the server
     * know about active consumers and producers.
     *
     * @generated from protobuf rpc: Heartbeat(protos.HeartbeatRequest) returns (protos.StandardResponse);
     */
    heartbeat(input, options) {
        const method = this.methods[1], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * Use this method when Notify condition has been triggered; the server will
     * decide on what to do about the notification.
     *
     * @generated from protobuf rpc: Notify(protos.NotifyRequest) returns (protos.StandardResponse);
     */
    notify(input, options) {
        const method = this.methods[2], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * Send periodic metrics to the server
     *
     * @generated from protobuf rpc: Metrics(protos.MetricsRequest) returns (protos.StandardResponse);
     */
    metrics(input, options) {
        const method = this.methods[3], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
}
//# sourceMappingURL=internal.client.js.map