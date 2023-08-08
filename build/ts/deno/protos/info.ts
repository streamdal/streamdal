// @generated by protobuf-ts 2.9.0 with parameter optimize_code_size
// @generated from protobuf file "info.proto" (package "protos", syntax proto3)
// tslint:disable
import { MessageType } from "@protobuf-ts/runtime";
import { Pipeline } from "./pipeline.ts";
import { Audience } from "./common.ts";
/**
 * @generated from protobuf message protos.LiveInfo
 */
export interface LiveInfo {
    /**
     * If empty, client has not announced any audiences
     *
     * @generated from protobuf field: repeated protos.Audience audience = 1;
     */
    audience: Audience[];
    /**
     * @generated from protobuf field: protos.ClientInfo client = 2;
     */
    client?: ClientInfo;
}
/**
 * @generated from protobuf message protos.PipelineInfo
 */
export interface PipelineInfo {
    /**
     * If empty, pipeline is not attached to any audience
     *
     * @generated from protobuf field: repeated protos.Audience audiences = 1;
     */
    audiences: Audience[];
    /**
     * @generated from protobuf field: protos.Pipeline pipeline = 2;
     */
    pipeline?: Pipeline;
    /**
     * @generated from protobuf field: protos.PipelineState state = 3;
     */
    state: PipelineState;
}
/**
 * Most of this is constructed by client SDKs and provided during Register call
 *
 * @generated from protobuf message protos.ClientInfo
 */
export interface ClientInfo {
    /**
     * @generated from protobuf field: protos.ClientType client_type = 1;
     */
    clientType: ClientType;
    /**
     * @generated from protobuf field: string library_name = 2;
     */
    libraryName: string;
    /**
     * @generated from protobuf field: string library_version = 3;
     */
    libraryVersion: string;
    /**
     * @generated from protobuf field: string language = 4;
     */
    language: string;
    /**
     * @generated from protobuf field: string arch = 5;
     */
    arch: string;
    /**
     * @generated from protobuf field: string os = 6;
     */
    os: string;
    /**
     * Filled out by snitch_server on GetAll()
     *
     * @generated from protobuf field: optional string _session_id = 7;
     */
    SessionId?: string; // protolint:disable:this FIELD_NAMES_LOWER_SNAKE_CASE
    /**
     * @generated from protobuf field: optional string _service_name = 8;
     */
    ServiceName?: string; // protolint:disable:this FIELD_NAMES_LOWER_SNAKE_CASE
    /**
     * @generated from protobuf field: optional string _node_name = 9;
     */
    NodeName?: string; // protolint:disable:this FIELD_NAMES_LOWER_SNAKE_CASE
}
/**
 * @generated from protobuf enum protos.PipelineState
 */
export enum PipelineState {
    /**
     * @generated from protobuf enum value: PIPELINE_STATE_UNSET = 0;
     */
    UNSET = 0,
    /**
     * @generated from protobuf enum value: PIPELINE_STATE_PAUSED = 1;
     */
    PAUSED = 1
}
/**
 * @generated from protobuf enum protos.ClientType
 */
export enum ClientType {
    /**
     * @generated from protobuf enum value: CLIENT_TYPE_UNSET = 0;
     */
    UNSET = 0,
    /**
     * @generated from protobuf enum value: CLIENT_TYPE_SDK = 1;
     */
    SDK = 1,
    /**
     * @generated from protobuf enum value: CLIENT_TYPE_SHIM = 2;
     */
    SHIM = 2
}
// @generated message type with reflection information, may provide speed optimized methods
class LiveInfo$Type extends MessageType<LiveInfo> {
    constructor() {
        super("protos.LiveInfo", [
            { no: 1, name: "audience", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => Audience },
            { no: 2, name: "client", kind: "message", T: () => ClientInfo }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message protos.LiveInfo
 */
export const LiveInfo = new LiveInfo$Type();
// @generated message type with reflection information, may provide speed optimized methods
class PipelineInfo$Type extends MessageType<PipelineInfo> {
    constructor() {
        super("protos.PipelineInfo", [
            { no: 1, name: "audiences", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => Audience },
            { no: 2, name: "pipeline", kind: "message", T: () => Pipeline },
            { no: 3, name: "state", kind: "enum", T: () => ["protos.PipelineState", PipelineState, "PIPELINE_STATE_"] }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message protos.PipelineInfo
 */
export const PipelineInfo = new PipelineInfo$Type();
// @generated message type with reflection information, may provide speed optimized methods
class ClientInfo$Type extends MessageType<ClientInfo> {
    constructor() {
        super("protos.ClientInfo", [
            { no: 1, name: "client_type", kind: "enum", T: () => ["protos.ClientType", ClientType, "CLIENT_TYPE_"] },
            { no: 2, name: "library_name", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 3, name: "library_version", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 4, name: "language", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 5, name: "arch", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 6, name: "os", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 7, name: "_session_id", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 8, name: "_service_name", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 9, name: "_node_name", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message protos.ClientInfo
 */
export const ClientInfo = new ClientInfo$Type();
