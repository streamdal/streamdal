// @generated by protobuf-ts 2.9.0 with parameter optimize_code_size
// @generated from protobuf file "internal_api.proto" (package "protos", syntax proto3)
// tslint:disable
import { StandardResponse } from "./common.ts";
import { ServiceType } from "@protobuf-ts/runtime-rpc";
import { MessageType } from "@protobuf-ts/runtime";
import { UnpausePipelineCommand } from "./pipeline.ts";
import { PausePipelineCommand } from "./pipeline.ts";
import { DeletePipelineCommand } from "./pipeline.ts";
import { SetPipelineCommand } from "./pipeline.ts";
/**
 * Each consumer and producer should send periodic heartbeats to the server
 * to let the server know that they are still active.
 *
 * @generated from protobuf message protos.HeartbeatRequest
 */
export interface HeartbeatRequest {
    /**
     * @generated from protobuf field: protos.Audience audience = 1;
     */
    audience?: Audience;
    /**
     * @generated from protobuf field: int64 last_activity_unix_timestamp_utc = 2;
     */
    lastActivityUnixTimestampUtc: bigint;
    /**
     * @generated from protobuf field: map<string, string> _metadata = 1000;
     */
    Metadata: {
        [key: string]: string;
    };
}
/**
 * @generated from protobuf message protos.NotifyRequest
 */
export interface NotifyRequest {
    /**
     * @generated from protobuf field: string rule_id = 1;
     */
    ruleId: string;
    /**
     * @generated from protobuf field: string rule_name = 2;
     */
    ruleName: string;
    /**
     * @generated from protobuf field: protos.Audience audience = 3;
     */
    audience?: Audience;
    /**
     * @generated from protobuf field: int64 occurred_at_unix_ts_utc = 4;
     */
    occurredAtUnixTsUtc: bigint;
    /**
     * @generated from protobuf field: map<string, string> _metadata = 1000;
     */
    Metadata: {
        [key: string]: string;
    };
}
/**
 * @generated from protobuf message protos.MetricsRequest
 */
export interface MetricsRequest {
    /**
     * @generated from protobuf field: string rule_id = 1;
     */
    ruleId: string;
    /**
     * @generated from protobuf field: string rule_name = 2;
     */
    ruleName: string;
    /**
     * @generated from protobuf field: protos.Audience audience = 3;
     */
    audience?: Audience;
    /**
     * @generated from protobuf field: map<string, string> _metadata = 1000;
     */
    Metadata: {
        [key: string]: string;
    };
}
/**
 * @generated from protobuf message protos.RegisterRequest
 */
export interface RegisterRequest {
    /**
     * @generated from protobuf field: string service_name = 1;
     */
    serviceName: string;
    /**
     * If set, we know that any pipelines or steps executed in this SDK will NOT
     * modify the input/output data. As in, the SDK will log what it _would_ do
     * and always return the original data set.
     *
     * @generated from protobuf field: bool dry_run = 2;
     */
    dryRun: boolean;
    /**
     * snitch-server uses this under the hood for debug
     *
     * @generated from protobuf field: map<string, string> _metadata = 1000;
     */
    Metadata: {
        [key: string]: string;
    };
}
/**
 * Type used by `snitch-server` for sending messages on its local bus.
 *
 * @generated from protobuf message protos.BusEvent
 */
export interface BusEvent {
    /**
     * @generated from protobuf field: string request_id = 1;
     */
    requestId: string;
    /**
     * @generated from protobuf field: string source = 2;
     */
    source: string;
    /**
     * @generated from protobuf oneof: event
     */
    event: {
        oneofKind: "commandResponse";
        /**
         * @generated from protobuf field: protos.CommandResponse command_response = 100;
         */
        commandResponse: CommandResponse;
    } | {
        oneofKind: "registerRequest";
        /**
         * @generated from protobuf field: protos.RegisterRequest register_request = 101;
         */
        registerRequest: RegisterRequest;
    } | {
        oneofKind: undefined;
    };
    /**
     * @generated from protobuf field: map<string, string> _metadata = 1000;
     */
    Metadata: {
        [key: string]: string;
    };
}
/**
 * The primary method to send commands to the SDK; server will send zero or more
 * RegisterResponse's with SetPipelineRequest on SDK instantiation.
 *
 * @generated from protobuf message protos.CommandResponse
 */
export interface CommandResponse {
    /**
     * Who is this command intended for?
     *
     * @generated from protobuf field: protos.Audience audience = 1;
     */
    audience?: Audience;
    /**
     * @generated from protobuf oneof: command
     */
    command: {
        oneofKind: "setPipeline";
        /**
         * @generated from protobuf field: protos.SetPipelineCommand set_pipeline = 100;
         */
        setPipeline: SetPipelineCommand;
    } | {
        oneofKind: "deletePipeline";
        /**
         * @generated from protobuf field: protos.DeletePipelineCommand delete_pipeline = 101;
         */
        deletePipeline: DeletePipelineCommand; // Hmm, should this be here?
    } | {
        oneofKind: "pausePipeline";
        /**
         * @generated from protobuf field: protos.PausePipelineCommand pause_pipeline = 102;
         */
        pausePipeline: PausePipelineCommand;
    } | {
        oneofKind: "unpausePipeline";
        /**
         * @generated from protobuf field: protos.UnpausePipelineCommand unpause_pipeline = 103;
         */
        unpausePipeline: UnpausePipelineCommand;
    } | {
        oneofKind: undefined;
    };
    /**
     * @generated from protobuf field: map<string, string> _metadata = 1000;
     */
    Metadata: {
        [key: string]: string;
    };
}
/**
 * Used to indicate who a request/command is intended for
 *
 * @generated from protobuf message protos.Audience
 */
export interface Audience {
    /**
     * Name of the service
     *
     * @generated from protobuf field: string service_name = 1;
     */
    serviceName: string;
    /**
     * Name of the component the SDK is interacting with (ie. kafka-$topic-name)
     *
     * @generated from protobuf field: string component_name = 2;
     */
    componentName: string;
    /**
     * Consumer or Producer
     *
     * @generated from protobuf field: protos.OperationType operation_type = 3;
     */
    operationType: OperationType;
}
/**
 * Types of commands that can be sent to the SDK
 *
 * @generated from protobuf enum protos.CommandType
 */
export enum CommandType {
    /**
     * @generated from protobuf enum value: SNITCH_COMMAND_TYPE_UNSET = 0;
     */
    SNITCH_COMMAND_TYPE_UNSET = 0,
    /**
     * Use this to keep connection alive; SDK doesn't need to do anything with this - it's there just to keep things alive
     *
     * @generated from protobuf enum value: SNITCH_COMMAND_TYPE_KEEPALIVE = 1;
     */
    SNITCH_COMMAND_TYPE_KEEPALIVE = 1,
    /**
     * @generated from protobuf enum value: SNITCH_COMMAND_TYPE_SET_PIPELINE = 2;
     */
    SNITCH_COMMAND_TYPE_SET_PIPELINE = 2,
    /**
     * @generated from protobuf enum value: SNITCH_COMMAND_TYPE_DELETE_PIPELINE = 3;
     */
    SNITCH_COMMAND_TYPE_DELETE_PIPELINE = 3,
    /**
     * @generated from protobuf enum value: SNITCH_COMMAND_TYPE_PAUSE_PIPELINE = 4;
     */
    SNITCH_COMMAND_TYPE_PAUSE_PIPELINE = 4,
    /**
     * @generated from protobuf enum value: SNITCH_COMMAND_TYPE_UNPAUSE_PIPELINE = 5;
     */
    SNITCH_COMMAND_TYPE_UNPAUSE_PIPELINE = 5
}
/**
 * @generated from protobuf enum protos.OperationType
 */
export enum OperationType {
    /**
     * @generated from protobuf enum value: OPERATION_TYPE_UNSET = 0;
     */
    UNSET = 0,
    /**
     * @generated from protobuf enum value: OPERATION_TYPE_CONSUMER = 1;
     */
    CONSUMER = 1,
    /**
     * @generated from protobuf enum value: OPERATION_TYPE_PRODUCER = 2;
     */
    PRODUCER = 2
}
// @generated message type with reflection information, may provide speed optimized methods
class HeartbeatRequest$Type extends MessageType<HeartbeatRequest> {
    constructor() {
        super("protos.HeartbeatRequest", [
            { no: 1, name: "audience", kind: "message", T: () => Audience },
            { no: 2, name: "last_activity_unix_timestamp_utc", kind: "scalar", T: 3 /*ScalarType.INT64*/, L: 0 /*LongType.BIGINT*/ },
            { no: 1000, name: "_metadata", kind: "map", K: 9 /*ScalarType.STRING*/, V: { kind: "scalar", T: 9 /*ScalarType.STRING*/ } }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message protos.HeartbeatRequest
 */
export const HeartbeatRequest = new HeartbeatRequest$Type();
// @generated message type with reflection information, may provide speed optimized methods
class NotifyRequest$Type extends MessageType<NotifyRequest> {
    constructor() {
        super("protos.NotifyRequest", [
            { no: 1, name: "rule_id", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "rule_name", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 3, name: "audience", kind: "message", T: () => Audience },
            { no: 4, name: "occurred_at_unix_ts_utc", kind: "scalar", T: 3 /*ScalarType.INT64*/, L: 0 /*LongType.BIGINT*/ },
            { no: 1000, name: "_metadata", kind: "map", K: 9 /*ScalarType.STRING*/, V: { kind: "scalar", T: 9 /*ScalarType.STRING*/ } }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message protos.NotifyRequest
 */
export const NotifyRequest = new NotifyRequest$Type();
// @generated message type with reflection information, may provide speed optimized methods
class MetricsRequest$Type extends MessageType<MetricsRequest> {
    constructor() {
        super("protos.MetricsRequest", [
            { no: 1, name: "rule_id", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "rule_name", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 3, name: "audience", kind: "message", T: () => Audience },
            { no: 1000, name: "_metadata", kind: "map", K: 9 /*ScalarType.STRING*/, V: { kind: "scalar", T: 9 /*ScalarType.STRING*/ } }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message protos.MetricsRequest
 */
export const MetricsRequest = new MetricsRequest$Type();
// @generated message type with reflection information, may provide speed optimized methods
class RegisterRequest$Type extends MessageType<RegisterRequest> {
    constructor() {
        super("protos.RegisterRequest", [
            { no: 1, name: "service_name", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "dry_run", kind: "scalar", T: 8 /*ScalarType.BOOL*/ },
            { no: 1000, name: "_metadata", kind: "map", K: 9 /*ScalarType.STRING*/, V: { kind: "scalar", T: 9 /*ScalarType.STRING*/ } }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message protos.RegisterRequest
 */
export const RegisterRequest = new RegisterRequest$Type();
// @generated message type with reflection information, may provide speed optimized methods
class BusEvent$Type extends MessageType<BusEvent> {
    constructor() {
        super("protos.BusEvent", [
            { no: 1, name: "request_id", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "source", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 100, name: "command_response", kind: "message", oneof: "event", T: () => CommandResponse },
            { no: 101, name: "register_request", kind: "message", oneof: "event", T: () => RegisterRequest },
            { no: 1000, name: "_metadata", kind: "map", K: 9 /*ScalarType.STRING*/, V: { kind: "scalar", T: 9 /*ScalarType.STRING*/ } }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message protos.BusEvent
 */
export const BusEvent = new BusEvent$Type();
// @generated message type with reflection information, may provide speed optimized methods
class CommandResponse$Type extends MessageType<CommandResponse> {
    constructor() {
        super("protos.CommandResponse", [
            { no: 1, name: "audience", kind: "message", T: () => Audience },
            { no: 100, name: "set_pipeline", kind: "message", oneof: "command", T: () => SetPipelineCommand },
            { no: 101, name: "delete_pipeline", kind: "message", oneof: "command", T: () => DeletePipelineCommand },
            { no: 102, name: "pause_pipeline", kind: "message", oneof: "command", T: () => PausePipelineCommand },
            { no: 103, name: "unpause_pipeline", kind: "message", oneof: "command", T: () => UnpausePipelineCommand },
            { no: 1000, name: "_metadata", kind: "map", K: 9 /*ScalarType.STRING*/, V: { kind: "scalar", T: 9 /*ScalarType.STRING*/ } }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message protos.CommandResponse
 */
export const CommandResponse = new CommandResponse$Type();
// @generated message type with reflection information, may provide speed optimized methods
class Audience$Type extends MessageType<Audience> {
    constructor() {
        super("protos.Audience", [
            { no: 1, name: "service_name", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "component_name", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 3, name: "operation_type", kind: "enum", T: () => ["protos.OperationType", OperationType, "OPERATION_TYPE_"] }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message protos.Audience
 */
export const Audience = new Audience$Type();
/**
 * @generated ServiceType for protobuf service protos.Internal
 */
export const Internal = new ServiceType("protos.Internal", [
    { name: "Register", serverStreaming: true, options: {}, I: RegisterRequest, O: CommandResponse },
    { name: "Heartbeat", options: {}, I: HeartbeatRequest, O: StandardResponse },
    { name: "Notify", options: {}, I: NotifyRequest, O: StandardResponse },
    { name: "Metrics", options: {}, I: MetricsRequest, O: StandardResponse }
]);
