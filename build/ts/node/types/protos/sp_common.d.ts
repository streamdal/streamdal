import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
/**
 * Common response message for many gRPC methods
 *
 * @generated from protobuf message protos.StandardResponse
 */
export interface StandardResponse {
    /**
     * Co-relation ID for the request / response
     *
     * @generated from protobuf field: string id = 1;
     */
    id: string;
    /**
     * @generated from protobuf field: protos.ResponseCode code = 2;
     */
    code: ResponseCode;
    /**
     * @generated from protobuf field: string message = 3;
     */
    message: string;
}
/**
 * Used to indicate who a command is intended for
 *
 * @generated from protobuf message protos.Audience
 */
export interface Audience {
    /**
     * Name of the service -- let's include the service name on all calls, we can
     * optimize later ~DS
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
    /**
     * Name for the consumer or producer
     *
     * @generated from protobuf field: string operation_name = 4;
     */
    operationName: string;
}
/**
 * @generated from protobuf message protos.Metric
 */
export interface Metric {
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
    /**
     * @generated from protobuf field: protos.Audience audience = 4;
     */
    audience?: Audience;
}
/**
 * @generated from protobuf message protos.TailRequest
 */
export interface TailRequest {
    /**
     * @generated from protobuf field: protos.TailRequestType type = 1;
     */
    type: TailRequestType;
    /**
     * @generated from protobuf field: string id = 2;
     */
    id: string;
    /**
     * @generated from protobuf field: protos.Audience audience = 3;
     */
    audience?: Audience;
    /**
     * @generated from protobuf field: string pipeline_id = 4;
     */
    pipelineId: string;
    /**
     * @generated from protobuf field: map<string, string> _metadata = 1000;
     */
    Metadata: {
        [key: string]: string;
    };
}
/**
 * TailResponse originates in the SDK and then is sent to snitch servers where
 * it is forwarded to the correct frontend streaming gRPC connection
 *
 * @generated from protobuf message protos.TailResponse
 */
export interface TailResponse {
    /**
     * @generated from protobuf field: protos.TailResponseType type = 1;
     */
    type: TailResponseType;
    /**
     * @generated from protobuf field: string tail_request_id = 2;
     */
    tailRequestId: string;
    /**
     * @generated from protobuf field: protos.Audience audience = 3;
     */
    audience?: Audience;
    /**
     * @generated from protobuf field: string pipeline_id = 4;
     */
    pipelineId: string;
    /**
     * @generated from protobuf field: string session_id = 5;
     */
    sessionId: string;
    /**
     * Timestamp in nanoseconds
     *
     * @generated from protobuf field: int64 timestamp_ns = 6;
     */
    timestampNs: string;
    /**
     * Payload data. For errors, this will be the error message
     * For payloads, this will be JSON of the payload data, post processing
     *
     * @generated from protobuf field: bytes original_data = 7;
     */
    originalData: Uint8Array;
    /**
     * For payloads, this will be the new data, post processing
     *
     * @generated from protobuf field: bytes new_data = 8;
     */
    newData: Uint8Array;
    /**
     * @generated from protobuf field: map<string, string> _metadata = 1000;
     */
    Metadata: {
        [key: string]: string;
    };
}
/**
 * @generated from protobuf message protos.AudienceRate
 */
export interface AudienceRate {
    /**
     * @generated from protobuf field: int64 bytes = 1;
     */
    bytes: string;
    /**
     * @generated from protobuf field: int64 processed = 2;
     */
    processed: string;
}
/**
 * @generated from protobuf message protos.Schema
 */
export interface Schema {
    /**
     * @generated from protobuf field: bytes json_schema = 1;
     */
    jsonSchema: Uint8Array;
    /**
     * @generated from protobuf field: int32 _version = 100;
     */
    Version: number;
}
/**
 * Common status codes used in gRPC method responses
 *
 * @generated from protobuf enum protos.ResponseCode
 */
export declare enum ResponseCode {
    /**
     * @generated from protobuf enum value: RESPONSE_CODE_UNSET = 0;
     */
    UNSET = 0,
    /**
     * @generated from protobuf enum value: RESPONSE_CODE_OK = 1;
     */
    OK = 1,
    /**
     * @generated from protobuf enum value: RESPONSE_CODE_BAD_REQUEST = 2;
     */
    BAD_REQUEST = 2,
    /**
     * @generated from protobuf enum value: RESPONSE_CODE_NOT_FOUND = 3;
     */
    NOT_FOUND = 3,
    /**
     * @generated from protobuf enum value: RESPONSE_CODE_INTERNAL_SERVER_ERROR = 4;
     */
    INTERNAL_SERVER_ERROR = 4,
    /**
     * @generated from protobuf enum value: RESPONSE_CODE_GENERIC_ERROR = 5;
     */
    GENERIC_ERROR = 5
}
/**
 * Each SDK client is a $service + $component + $operation_type
 *
 * @generated from protobuf enum protos.OperationType
 */
export declare enum OperationType {
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
/**
 * @generated from protobuf enum protos.TailResponseType
 */
export declare enum TailResponseType {
    /**
     * @generated from protobuf enum value: TAIL_RESPONSE_TYPE_UNSET = 0;
     */
    UNSET = 0,
    /**
     * @generated from protobuf enum value: TAIL_RESPONSE_TYPE_PAYLOAD = 1;
     */
    PAYLOAD = 1,
    /**
     * @generated from protobuf enum value: TAIL_RESPONSE_TYPE_ERROR = 2;
     */
    ERROR = 2
}
/**
 * @generated from protobuf enum protos.TailRequestType
 */
export declare enum TailRequestType {
    /**
     * @generated from protobuf enum value: TAIL_REQUEST_TYPE_UNSET = 0;
     */
    UNSET = 0,
    /**
     * @generated from protobuf enum value: TAIL_REQUEST_TYPE_START = 1;
     */
    START = 1,
    /**
     * @generated from protobuf enum value: TAIL_REQUEST_TYPE_STOP = 2;
     */
    STOP = 2
}
declare class StandardResponse$Type extends MessageType<StandardResponse> {
    constructor();
    create(value?: PartialMessage<StandardResponse>): StandardResponse;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: StandardResponse): StandardResponse;
    internalBinaryWrite(message: StandardResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.StandardResponse
 */
export declare const StandardResponse: StandardResponse$Type;
declare class Audience$Type extends MessageType<Audience> {
    constructor();
    create(value?: PartialMessage<Audience>): Audience;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: Audience): Audience;
    internalBinaryWrite(message: Audience, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.Audience
 */
export declare const Audience: Audience$Type;
declare class Metric$Type extends MessageType<Metric> {
    constructor();
    create(value?: PartialMessage<Metric>): Metric;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: Metric): Metric;
    private binaryReadMap2;
    internalBinaryWrite(message: Metric, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.Metric
 */
export declare const Metric: Metric$Type;
declare class TailRequest$Type extends MessageType<TailRequest> {
    constructor();
    create(value?: PartialMessage<TailRequest>): TailRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: TailRequest): TailRequest;
    private binaryReadMap1000;
    internalBinaryWrite(message: TailRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.TailRequest
 */
export declare const TailRequest: TailRequest$Type;
declare class TailResponse$Type extends MessageType<TailResponse> {
    constructor();
    create(value?: PartialMessage<TailResponse>): TailResponse;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: TailResponse): TailResponse;
    private binaryReadMap1000;
    internalBinaryWrite(message: TailResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.TailResponse
 */
export declare const TailResponse: TailResponse$Type;
declare class AudienceRate$Type extends MessageType<AudienceRate> {
    constructor();
    create(value?: PartialMessage<AudienceRate>): AudienceRate;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: AudienceRate): AudienceRate;
    internalBinaryWrite(message: AudienceRate, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.AudienceRate
 */
export declare const AudienceRate: AudienceRate$Type;
declare class Schema$Type extends MessageType<Schema> {
    constructor();
    create(value?: PartialMessage<Schema>): Schema;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: Schema): Schema;
    internalBinaryWrite(message: Schema, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.Schema
 */
export declare const Schema: Schema$Type;
export {};
