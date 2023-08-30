// @generated by protobuf-ts 2.9.0 with parameter optimize_code_size
// @generated from protobuf file "sp_common.proto" (package "protos", syntax proto3)
// tslint:disable
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
}
/**
 * @generated from protobuf message protos.TailRequest
 */
export interface TailRequest {
    /**
     * @generated from protobuf field: protos.Audience audience = 1;
     */
    audience?: Audience;
    /**
     * @generated from protobuf field: string pipeline_id = 2;
     */
    pipelineId: string;
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
     * @generated from protobuf field: protos.Audience audience = 2;
     */
    audience?: Audience;
    /**
     * Timestamp in nanoseconds
     *
     * @generated from protobuf field: int64 timestamp_ns = 3;
     */
    timestampNs: bigint;
    /**
     * Payload data. For errors, this will be the error message
     * For payloads, this will be JSON of the payload data, post processing
     *
     * @generated from protobuf field: bytes data = 4;
     */
    data: Uint8Array;
}
/**
 * @generated from protobuf message protos.TailCommand
 */
export interface TailCommand {
    /**
     * @generated from protobuf field: protos.TailRequest request = 1;
     */
    request?: TailRequest;
}
/**
 * Common status codes used in gRPC method responses
 *
 * @generated from protobuf enum protos.ResponseCode
 */
export enum ResponseCode {
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
/**
 * @generated from protobuf enum protos.TailResponseType
 */
export enum TailResponseType {
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
// @generated message type with reflection information, may provide speed optimized methods
class StandardResponse$Type extends MessageType<StandardResponse> {
    constructor() {
        super("protos.StandardResponse", [
            { no: 1, name: "id", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "code", kind: "enum", T: () => ["protos.ResponseCode", ResponseCode, "RESPONSE_CODE_"] },
            { no: 3, name: "message", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message protos.StandardResponse
 */
export const StandardResponse = new StandardResponse$Type();
// @generated message type with reflection information, may provide speed optimized methods
class Audience$Type extends MessageType<Audience> {
    constructor() {
        super("protos.Audience", [
            { no: 1, name: "service_name", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "component_name", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 3, name: "operation_type", kind: "enum", T: () => ["protos.OperationType", OperationType, "OPERATION_TYPE_"] },
            { no: 4, name: "operation_name", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message protos.Audience
 */
export const Audience = new Audience$Type();
// @generated message type with reflection information, may provide speed optimized methods
class Metric$Type extends MessageType<Metric> {
    constructor() {
        super("protos.Metric", [
            { no: 1, name: "name", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "labels", kind: "map", K: 9 /*ScalarType.STRING*/, V: { kind: "scalar", T: 9 /*ScalarType.STRING*/ } },
            { no: 3, name: "value", kind: "scalar", T: 1 /*ScalarType.DOUBLE*/ }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message protos.Metric
 */
export const Metric = new Metric$Type();
// @generated message type with reflection information, may provide speed optimized methods
class TailRequest$Type extends MessageType<TailRequest> {
    constructor() {
        super("protos.TailRequest", [
            { no: 1, name: "audience", kind: "message", T: () => Audience },
            { no: 2, name: "pipeline_id", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message protos.TailRequest
 */
export const TailRequest = new TailRequest$Type();
// @generated message type with reflection information, may provide speed optimized methods
class TailResponse$Type extends MessageType<TailResponse> {
    constructor() {
        super("protos.TailResponse", [
            { no: 1, name: "type", kind: "enum", T: () => ["protos.TailResponseType", TailResponseType, "TAIL_RESPONSE_TYPE_"] },
            { no: 2, name: "audience", kind: "message", T: () => Audience },
            { no: 3, name: "timestamp_ns", kind: "scalar", T: 3 /*ScalarType.INT64*/, L: 0 /*LongType.BIGINT*/ },
            { no: 4, name: "data", kind: "scalar", T: 12 /*ScalarType.BYTES*/ }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message protos.TailResponse
 */
export const TailResponse = new TailResponse$Type();
// @generated message type with reflection information, may provide speed optimized methods
class TailCommand$Type extends MessageType<TailCommand> {
    constructor() {
        super("protos.TailCommand", [
            { no: 1, name: "request", kind: "message", T: () => TailRequest }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message protos.TailCommand
 */
export const TailCommand = new TailCommand$Type();
