import { ServiceType } from "@protobuf-ts/runtime-rpc";
import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
import { Schema } from "./sp_common.js";
import { Command } from "./sp_command.js";
import { Metric } from "./sp_common.js";
import { PipelineStep } from "./sp_pipeline.js";
import { ClientInfo } from "./sp_info.js";
import { Audience } from "./sp_common.js";
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
    /**
     * Name of the service that is sending the heartbeat. Used for refreshing registration
     *
     * @generated from protobuf field: string service_name = 2;
     */
    serviceName: string;
    /**
     * Used for refreshing live audience keys in the event that backing store
     * connection is lost and TTLed audience keys are lost
     *
     * @generated from protobuf field: repeated protos.Audience audiences = 3;
     */
    audiences: Audience[];
    /**
     * Used for refreshing registration
     *
     * @generated from protobuf field: protos.ClientInfo client_info = 4;
     */
    clientInfo?: ClientInfo;
}
/**
 * @generated from protobuf message protos.NotifyRequest
 */
export interface NotifyRequest {
    /**
     * @generated from protobuf field: protos.NotifyRequest.ConditionType condition_type = 1;
     */
    conditionType: NotifyRequest_ConditionType;
    /**
     * Used for pulling step name and any other info needed in the future
     *
     * @generated from protobuf field: protos.PipelineStep step = 2;
     */
    step?: PipelineStep;
    /**
     * Included in notification
     *
     * @generated from protobuf field: protos.Audience audience = 3;
     */
    audience?: Audience;
    /**
     * Included in notification
     *
     * @generated from protobuf field: int64 occurred_at_unix_ts_utc = 4;
     */
    occurredAtUnixTsUtc: string;
    /**
     * Included in notification
     *
     * @generated from protobuf field: string pipeline_id = 5;
     */
    pipelineId: string;
    /**
     * Included in notification
     *
     * @generated from protobuf field: bytes payload = 6;
     */
    payload: Uint8Array;
}
/**
 * This will be used to pull the condition type (true, false, error) from the pipeline step,
 * so that we can include metadata, abort condition, etc., in the notification
 * The condition will contain the notification configuration also.
 *
 * @generated from protobuf enum protos.NotifyRequest.ConditionType
 */
export declare enum NotifyRequest_ConditionType {
    /**
     * @generated from protobuf enum value: CONDITION_TYPE_UNSET = 0;
     */
    UNSET = 0,
    /**
     * @generated from protobuf enum value: CONDITION_TYPE_ON_TRUE = 1;
     */
    ON_TRUE = 1,
    /**
     * @generated from protobuf enum value: CONDITION_TYPE_ON_FALSE = 2;
     */
    ON_FALSE = 2,
    /**
     * @generated from protobuf enum value: CONDITION_TYPE_ON_ERROR = 3;
     */
    ON_ERROR = 3
}
/**
 * @generated from protobuf message protos.MetricsRequest
 */
export interface MetricsRequest {
    /**
     * @generated from protobuf field: repeated protos.Metric metrics = 1;
     */
    metrics: Metric[];
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
 * Method used by SDKs to fetch all SetPipelinesCommands for a given service name.
 * The SDK may not know of all audiences yet so this method returns ALL
 * SetPipelinesCommands that use the same same service name. SDKs should store
 * the commands (or pipelines) in memory tied to an audience, so that if/when a
 * .Process() call occurs with an audience - the SDK will already have the
 * pipeline config in memory.
 *
 * @generated from protobuf message protos.GetSetPipelinesCommandsByServiceRequest
 */
export interface GetSetPipelinesCommandsByServiceRequest {
    /**
     * @generated from protobuf field: string service_name = 1;
     */
    serviceName: string;
}
/**
 * @generated from protobuf message protos.GetSetPipelinesCommandsByServiceResponse
 */
export interface GetSetPipelinesCommandsByServiceResponse {
    /**
     * SetPipelinesCommands for all active pipelines
     *
     * @generated from protobuf field: repeated protos.Command set_pipeline_commands = 1;
     */
    setPipelineCommands: Command[];
    /**
     * ID = wasm ID
     *
     * @generated from protobuf field: map<string, protos.WasmModule> wasm_modules = 3;
     */
    wasmModules: {
        [key: string]: WasmModule;
    };
}
/**
 * WasmModule is used to ensure we only send the wasm module once per request
 * instead of duplicated in every pipeline where it is used. This prevents
 * over-sized payloads on SDK startup
 *
 * @generated from protobuf message protos.WasmModule
 */
export interface WasmModule {
    /**
     * ID is a uuid(sha256(_wasm_bytes)) that is set by streamdal server
     *
     * @generated from protobuf field: string id = 1;
     */
    id: string;
    /**
     * WASM module bytes (set by server)
     *
     * @generated from protobuf field: bytes bytes = 2;
     */
    bytes: Uint8Array;
    /**
     * WASM function name to execute (set by server)
     *
     * @generated from protobuf field: string function = 3;
     */
    function: string;
}
/**
 * @generated from protobuf message protos.SendSchemaRequest
 */
export interface SendSchemaRequest {
    /**
     * @generated from protobuf field: protos.Audience audience = 1;
     */
    audience?: Audience;
    /**
     * @generated from protobuf field: protos.Schema schema = 2;
     */
    schema?: Schema;
}
declare class NewAudienceRequest$Type extends MessageType<NewAudienceRequest> {
    constructor();
    create(value?: PartialMessage<NewAudienceRequest>): NewAudienceRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: NewAudienceRequest): NewAudienceRequest;
    internalBinaryWrite(message: NewAudienceRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.NewAudienceRequest
 */
export declare const NewAudienceRequest: NewAudienceRequest$Type;
declare class HeartbeatRequest$Type extends MessageType<HeartbeatRequest> {
    constructor();
    create(value?: PartialMessage<HeartbeatRequest>): HeartbeatRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: HeartbeatRequest): HeartbeatRequest;
    internalBinaryWrite(message: HeartbeatRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.HeartbeatRequest
 */
export declare const HeartbeatRequest: HeartbeatRequest$Type;
declare class NotifyRequest$Type extends MessageType<NotifyRequest> {
    constructor();
    create(value?: PartialMessage<NotifyRequest>): NotifyRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: NotifyRequest): NotifyRequest;
    internalBinaryWrite(message: NotifyRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.NotifyRequest
 */
export declare const NotifyRequest: NotifyRequest$Type;
declare class MetricsRequest$Type extends MessageType<MetricsRequest> {
    constructor();
    create(value?: PartialMessage<MetricsRequest>): MetricsRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: MetricsRequest): MetricsRequest;
    internalBinaryWrite(message: MetricsRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.MetricsRequest
 */
export declare const MetricsRequest: MetricsRequest$Type;
declare class RegisterRequest$Type extends MessageType<RegisterRequest> {
    constructor();
    create(value?: PartialMessage<RegisterRequest>): RegisterRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: RegisterRequest): RegisterRequest;
    internalBinaryWrite(message: RegisterRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.RegisterRequest
 */
export declare const RegisterRequest: RegisterRequest$Type;
declare class DeregisterRequest$Type extends MessageType<DeregisterRequest> {
    constructor();
    create(value?: PartialMessage<DeregisterRequest>): DeregisterRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: DeregisterRequest): DeregisterRequest;
    internalBinaryWrite(message: DeregisterRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.DeregisterRequest
 */
export declare const DeregisterRequest: DeregisterRequest$Type;
declare class GetSetPipelinesCommandsByServiceRequest$Type extends MessageType<GetSetPipelinesCommandsByServiceRequest> {
    constructor();
    create(value?: PartialMessage<GetSetPipelinesCommandsByServiceRequest>): GetSetPipelinesCommandsByServiceRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: GetSetPipelinesCommandsByServiceRequest): GetSetPipelinesCommandsByServiceRequest;
    internalBinaryWrite(message: GetSetPipelinesCommandsByServiceRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.GetSetPipelinesCommandsByServiceRequest
 */
export declare const GetSetPipelinesCommandsByServiceRequest: GetSetPipelinesCommandsByServiceRequest$Type;
declare class GetSetPipelinesCommandsByServiceResponse$Type extends MessageType<GetSetPipelinesCommandsByServiceResponse> {
    constructor();
    create(value?: PartialMessage<GetSetPipelinesCommandsByServiceResponse>): GetSetPipelinesCommandsByServiceResponse;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: GetSetPipelinesCommandsByServiceResponse): GetSetPipelinesCommandsByServiceResponse;
    private binaryReadMap3;
    internalBinaryWrite(message: GetSetPipelinesCommandsByServiceResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.GetSetPipelinesCommandsByServiceResponse
 */
export declare const GetSetPipelinesCommandsByServiceResponse: GetSetPipelinesCommandsByServiceResponse$Type;
declare class WasmModule$Type extends MessageType<WasmModule> {
    constructor();
    create(value?: PartialMessage<WasmModule>): WasmModule;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: WasmModule): WasmModule;
    internalBinaryWrite(message: WasmModule, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.WasmModule
 */
export declare const WasmModule: WasmModule$Type;
declare class SendSchemaRequest$Type extends MessageType<SendSchemaRequest> {
    constructor();
    create(value?: PartialMessage<SendSchemaRequest>): SendSchemaRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: SendSchemaRequest): SendSchemaRequest;
    internalBinaryWrite(message: SendSchemaRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.SendSchemaRequest
 */
export declare const SendSchemaRequest: SendSchemaRequest$Type;
/**
 * @generated ServiceType for protobuf service protos.Internal
 */
export declare const Internal: ServiceType;
export {};
