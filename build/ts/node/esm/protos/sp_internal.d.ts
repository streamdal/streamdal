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
    occurredAtUnixTsUtc: string;
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
 * @generated from protobuf message protos.GetActiveCommandsRequest
 */
export interface GetActiveCommandsRequest {
    /**
     * @generated from protobuf field: string service_name = 1;
     */
    serviceName: string;
}
/**
 * @generated from protobuf message protos.GetActiveCommandsResponse
 */
export interface GetActiveCommandsResponse {
    /**
     * Commands in active state
     *
     * @generated from protobuf field: repeated protos.Command active = 1;
     */
    active: Command[];
    /**
     * Commands in paused state
     *
     * @generated from protobuf field: repeated protos.Command paused = 2;
     */
    paused: Command[];
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
 * DEPRECATED as of 10.23.2023 -- use GetActiveCommandsRequest instead
 *
 * @generated from protobuf message protos.GetAttachCommandsByServiceRequest
 */
export interface GetAttachCommandsByServiceRequest {
    /**
     * @generated from protobuf field: string service_name = 1;
     */
    serviceName: string;
}
/**
 * DEPRECATED as of 10.23.2023 -- use GetActiveCommandsResponse instead
 *
 * @generated from protobuf message protos.GetAttachCommandsByServiceResponse
 */
export interface GetAttachCommandsByServiceResponse {
    /**
     * AttachCommands for all active pipelines
     *
     * @generated from protobuf field: repeated protos.Command active = 1;
     */
    active: Command[];
    /**
     * AttachCommands, but ones which are paused
     * The SDK still needs to have these to support un-pausing
     *
     * @generated from protobuf field: repeated protos.Command paused = 2;
     */
    paused: Command[];
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
declare class GetActiveCommandsRequest$Type extends MessageType<GetActiveCommandsRequest> {
    constructor();
    create(value?: PartialMessage<GetActiveCommandsRequest>): GetActiveCommandsRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: GetActiveCommandsRequest): GetActiveCommandsRequest;
    internalBinaryWrite(message: GetActiveCommandsRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.GetActiveCommandsRequest
 */
export declare const GetActiveCommandsRequest: GetActiveCommandsRequest$Type;
declare class GetActiveCommandsResponse$Type extends MessageType<GetActiveCommandsResponse> {
    constructor();
    create(value?: PartialMessage<GetActiveCommandsResponse>): GetActiveCommandsResponse;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: GetActiveCommandsResponse): GetActiveCommandsResponse;
    private binaryReadMap3;
    internalBinaryWrite(message: GetActiveCommandsResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.GetActiveCommandsResponse
 */
export declare const GetActiveCommandsResponse: GetActiveCommandsResponse$Type;
declare class GetAttachCommandsByServiceRequest$Type extends MessageType<GetAttachCommandsByServiceRequest> {
    constructor();
    create(value?: PartialMessage<GetAttachCommandsByServiceRequest>): GetAttachCommandsByServiceRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: GetAttachCommandsByServiceRequest): GetAttachCommandsByServiceRequest;
    internalBinaryWrite(message: GetAttachCommandsByServiceRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.GetAttachCommandsByServiceRequest
 */
export declare const GetAttachCommandsByServiceRequest: GetAttachCommandsByServiceRequest$Type;
declare class GetAttachCommandsByServiceResponse$Type extends MessageType<GetAttachCommandsByServiceResponse> {
    constructor();
    create(value?: PartialMessage<GetAttachCommandsByServiceResponse>): GetAttachCommandsByServiceResponse;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: GetAttachCommandsByServiceResponse): GetAttachCommandsByServiceResponse;
    private binaryReadMap3;
    internalBinaryWrite(message: GetAttachCommandsByServiceResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.GetAttachCommandsByServiceResponse
 */
export declare const GetAttachCommandsByServiceResponse: GetAttachCommandsByServiceResponse$Type;
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
