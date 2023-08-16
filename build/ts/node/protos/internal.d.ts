import { ServiceType } from "@protobuf-ts/runtime-rpc";
import { MessageType } from "@protobuf-ts/runtime";
import { Command } from "./command.js";
import { ClientInfo } from "./info.js";
import { Audience } from "./common.js";
/**
 * @generated from protobuf message protos.NewAudienceRequest
 */
export interface NewAudienceRequest {
    /**
     * The session that is performing this call
     *
     * @generated from protobuf field: string session_id = 1;
     */
    sessionId: string;
    /**
     * Newly created audience.
     *
     * @generated from protobuf field: protos.Audience audience = 2;
     */
    audience?: Audience;
}
/**
 * Each consumer and producer should send periodic heartbeats to the server
 * to let the server know that they are still active.
 *
 * @generated from protobuf message protos.HeartbeatRequest
 */
export interface HeartbeatRequest {
    /**
     * Session ID for this instance of the SDK.
     *
     * @generated from protobuf field: string session_id = 1;
     */
    sessionId: string;
}
/**
 * @generated from protobuf message protos.NotifyRequest
 */
export interface NotifyRequest {
    /**
     * @generated from protobuf field: string pipeline_id = 1;
     */
    pipelineId: string;
    /**
     * @generated from protobuf field: string step_name = 2;
     */
    stepName: string;
    /**
     * @generated from protobuf field: protos.Audience audience = 3;
     */
    audience?: Audience;
    /**
     * @generated from protobuf field: int64 occurred_at_unix_ts_utc = 4;
     */
    occurredAtUnixTsUtc: bigint;
}
/**
 * @generated from protobuf message protos.Metrics
 */
export interface Metrics {
    /**
     * @generated from protobuf field: string name = 1;
     */
    name: string;
    /**
     * @generated from protobuf field: map<string, string> labels = 2;
     */
    labels: {
        [key: string]: string;
    };
    /**
     * @generated from protobuf field: double value = 3;
     */
    value: number;
}
/**
 * @generated from protobuf message protos.MetricsRequest
 */
export interface MetricsRequest {
    /**
     * @generated from protobuf field: repeated protos.Metrics metrics = 1;
     */
    metrics: Metrics[];
}
/**
 * @generated from protobuf message protos.RegisterRequest
 */
export interface RegisterRequest {
    /**
     * REQUIRED -- Name of the service that is registering.
     *
     * @generated from protobuf field: string service_name = 1;
     */
    serviceName: string;
    /**
     * REQUIRED -- Unique ID for this SDK instance.
     *
     * This should be generated every time the SDK is instantiated (oe. every
     * time a NEW registration is performed).
     *
     * @generated from protobuf field: string session_id = 2;
     */
    sessionId: string;
    /**
     * REQUIRED -- Info about the client (lib name, lang, os, arch, etc.)
     *
     * @generated from protobuf field: protos.ClientInfo client_info = 3;
     */
    clientInfo?: ClientInfo;
    /**
     * OPTIONAL -- if these are defined, these will show up in the UI even if
     * there is no active .Process() call from the SDK.
     *
     * @generated from protobuf field: repeated protos.Audience audiences = 4;
     */
    audiences: Audience[];
    /**
     * OPTIONAL -- If set, we know that any pipelines or steps executed in this
     * SDK will NOT modify the input/output data. As in, the SDK will log what it
     * _would_ do and always return the original data set.
     *
     * @generated from protobuf field: bool dry_run = 5;
     */
    dryRun: boolean;
}
/**
 * Same as RegisterRequest - used for broadcasting a deregistration event
 *
 * @generated from protobuf message protos.DeregisterRequest
 */
export interface DeregisterRequest {
    /**
     * @generated from protobuf field: string service_name = 1;
     */
    serviceName: string;
    /**
     * @generated from protobuf field: string session_id = 2;
     */
    sessionId: string;
}
/**
 * @generated from protobuf message protos.GetAttachCommandsByServiceRequest
 */
export interface GetAttachCommandsByServiceRequest {
    /**
     * @generated from protobuf field: string service_name = 1;
     */
    serviceName: string;
}
/**
 * @generated from protobuf message protos.GetAttachCommandsByServiceResponse
 */
export interface GetAttachCommandsByServiceResponse {
    /**
     * @generated from protobuf field: repeated protos.Command active = 1;
     */
    active: Command[];
    /**
     * @generated from protobuf field: repeated protos.Command paused = 2;
     */
    paused: Command[];
}
declare class NewAudienceRequest$Type extends MessageType<NewAudienceRequest> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.NewAudienceRequest
 */
export declare const NewAudienceRequest: NewAudienceRequest$Type;
declare class HeartbeatRequest$Type extends MessageType<HeartbeatRequest> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.HeartbeatRequest
 */
export declare const HeartbeatRequest: HeartbeatRequest$Type;
declare class NotifyRequest$Type extends MessageType<NotifyRequest> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.NotifyRequest
 */
export declare const NotifyRequest: NotifyRequest$Type;
declare class Metrics$Type extends MessageType<Metrics> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.Metrics
 */
export declare const Metrics: Metrics$Type;
declare class MetricsRequest$Type extends MessageType<MetricsRequest> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.MetricsRequest
 */
export declare const MetricsRequest: MetricsRequest$Type;
declare class RegisterRequest$Type extends MessageType<RegisterRequest> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.RegisterRequest
 */
export declare const RegisterRequest: RegisterRequest$Type;
declare class DeregisterRequest$Type extends MessageType<DeregisterRequest> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.DeregisterRequest
 */
export declare const DeregisterRequest: DeregisterRequest$Type;
declare class GetAttachCommandsByServiceRequest$Type extends MessageType<GetAttachCommandsByServiceRequest> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.GetAttachCommandsByServiceRequest
 */
export declare const GetAttachCommandsByServiceRequest: GetAttachCommandsByServiceRequest$Type;
declare class GetAttachCommandsByServiceResponse$Type extends MessageType<GetAttachCommandsByServiceResponse> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.GetAttachCommandsByServiceResponse
 */
export declare const GetAttachCommandsByServiceResponse: GetAttachCommandsByServiceResponse$Type;
/**
 * @generated ServiceType for protobuf service protos.Internal
 */
export declare const Internal: ServiceType;
export {};
