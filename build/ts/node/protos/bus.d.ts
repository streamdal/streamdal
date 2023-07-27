import { MessageType } from "@protobuf-ts/runtime";
import { HeartbeatRequest } from "./internal.js";
import { DeregisterRequest } from "./internal.js";
import { RegisterRequest } from "./internal.js";
import { Command } from "./command.js";
/**
 * Type used by `snitch-server` for sending messages on its local bus.
 *
 * @generated from protobuf message protos.BusEvent
 */
export interface BusEvent {
    /**
     * @generated from protobuf field: string source = 1;
     */
    source: string;
    /**
     * @generated from protobuf oneof: event
     */
    event: {
        oneofKind: "command";
        /**
         * @generated from protobuf field: protos.Command command = 100;
         */
        command: Command;
    } | {
        oneofKind: "registerRequest";
        /**
         * @generated from protobuf field: protos.RegisterRequest register_request = 101;
         */
        registerRequest: RegisterRequest;
    } | {
        oneofKind: "deregisterRequest";
        /**
         * @generated from protobuf field: protos.DeregisterRequest deregister_request = 102;
         */
        deregisterRequest: DeregisterRequest;
    } | {
        oneofKind: "heartbeatRequest";
        /**
         * @generated from protobuf field: protos.HeartbeatRequest heartbeat_request = 103;
         */
        heartbeatRequest: HeartbeatRequest;
    } | {
        oneofKind: undefined;
    };
    /**
     * All gRPC metadata is stored in ctx; when request goes outside of gRPC
     * bounds, we will translate ctx metadata into this field.
     *
     * Example:
     * 1. Request comes into snitch-server via external gRPC to set new pipeline
     * 2. snitch-server has to send SetPipeline cmd to SDK via gRPC - it passes
     *    on original metadata in request.
     * 3. snitch-server has to broadcast SetPipeline cmd to other services via bus
     * 4. Since this is not a gRPC call, snitch-server translates ctx metadata to
     *    this field and includes it in the bus event.
     *
     * @generated from protobuf field: map<string, string> _metadata = 1000;
     */
    Metadata: {
        [key: string]: string;
    };
}
declare class BusEvent$Type extends MessageType<BusEvent> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.BusEvent
 */
export declare const BusEvent: BusEvent$Type;
export {};
