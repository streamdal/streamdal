import { MessageType } from "@protobuf-ts/runtime";
import { Pipeline } from "./pipeline.js";
import { Audience } from "./common.js";
/**
 * @generated from protobuf message protos.ServiceInfo
 */
export interface ServiceInfo {
    /**
     * @generated from protobuf field: string name = 1;
     */
    name: string;
    /**
     * @generated from protobuf field: string description = 2;
     */
    description: string;
    /**
     * @generated from protobuf field: repeated protos.PipelineInfo pipelines = 100;
     */
    pipelines: PipelineInfo[];
    /**
     * @generated from protobuf field: repeated protos.ConsumerInfo consumers = 101;
     */
    consumers: ConsumerInfo[];
    /**
     * @generated from protobuf field: repeated protos.ProducerInfo producers = 102;
     */
    producers: ProducerInfo[];
    /**
     * @generated from protobuf field: repeated protos.ClientInfo clients = 103;
     */
    clients: ClientInfo[];
}
/**
 * @generated from protobuf message protos.PipelineInfo
 */
export interface PipelineInfo {
    /**
     * @generated from protobuf field: protos.Audience audience = 1;
     */
    audience?: Audience;
    /**
     * @generated from protobuf field: protos.Pipeline pipeline = 2;
     */
    pipeline?: Pipeline;
}
/**
 * TBD
 *
 * @generated from protobuf message protos.ConsumerInfo
 */
export interface ConsumerInfo {
}
/**
 * TBD
 *
 * @generated from protobuf message protos.ProducerInfo
 */
export interface ProducerInfo {
}
/**
 * This should come from the register call
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
declare class ServiceInfo$Type extends MessageType<ServiceInfo> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.ServiceInfo
 */
export declare const ServiceInfo: ServiceInfo$Type;
declare class PipelineInfo$Type extends MessageType<PipelineInfo> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.PipelineInfo
 */
export declare const PipelineInfo: PipelineInfo$Type;
declare class ConsumerInfo$Type extends MessageType<ConsumerInfo> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.ConsumerInfo
 */
export declare const ConsumerInfo: ConsumerInfo$Type;
declare class ProducerInfo$Type extends MessageType<ProducerInfo> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.ProducerInfo
 */
export declare const ProducerInfo: ProducerInfo$Type;
declare class ClientInfo$Type extends MessageType<ClientInfo> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.ClientInfo
 */
export declare const ClientInfo: ClientInfo$Type;
export {};
