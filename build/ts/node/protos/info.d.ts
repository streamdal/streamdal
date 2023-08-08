import { MessageType } from "@protobuf-ts/runtime";
import { Pipeline } from "./pipeline.js";
import { Audience } from "./common.js";
/**
 * @generated from protobuf message protos.LiveInfo
 */
export interface LiveInfo {
    /**
     * If empty, client has not announced any audiences
     *
     * @generated from protobuf field: repeated protos.Audience audiences = 1;
     */
    audiences: Audience[];
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
    SessionId?: string;
    /**
     * @generated from protobuf field: optional string _service_name = 8;
     */
    ServiceName?: string;
    /**
     * @generated from protobuf field: optional string _node_name = 9;
     */
    NodeName?: string;
}
/**
 * @generated from protobuf enum protos.PipelineState
 */
export declare enum PipelineState {
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
export declare enum ClientType {
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
declare class LiveInfo$Type extends MessageType<LiveInfo> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.LiveInfo
 */
export declare const LiveInfo: LiveInfo$Type;
declare class PipelineInfo$Type extends MessageType<PipelineInfo> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.PipelineInfo
 */
export declare const PipelineInfo: PipelineInfo$Type;
declare class ClientInfo$Type extends MessageType<ClientInfo> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.ClientInfo
 */
export declare const ClientInfo: ClientInfo$Type;
export {};
