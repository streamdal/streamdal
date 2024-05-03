import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
/**
 * @generated from protobuf message protos.steps.HttpRequest
 */
export interface HttpRequest {
    /**
     * @generated from protobuf field: protos.steps.HttpRequestMethod method = 1;
     */
    method: HttpRequestMethod;
    /**
     * @generated from protobuf field: string url = 2;
     */
    url: string;
    /**
     * @generated from protobuf field: bytes body = 3;
     */
    body: Uint8Array;
    /**
     * @generated from protobuf field: map<string, string> headers = 4;
     */
    headers: {
        [key: string]: string;
    };
    /**
     * @generated from protobuf field: protos.steps.HttpRequestBodyMode body_mode = 5;
     */
    bodyMode: HttpRequestBodyMode;
}
/**
 * @generated from protobuf message protos.steps.HttpResponse
 */
export interface HttpResponse {
    /**
     * @generated from protobuf field: int32 code = 1;
     */
    code: number;
    /**
     * @generated from protobuf field: bytes body = 2;
     */
    body: Uint8Array;
    /**
     * @generated from protobuf field: map<string, string> headers = 3;
     */
    headers: {
        [key: string]: string;
    };
}
/**
 * @generated from protobuf message protos.steps.HttpRequestStep
 */
export interface HttpRequestStep {
    /**
     * @generated from protobuf field: protos.steps.HttpRequest request = 1;
     */
    request?: HttpRequest;
}
/**
 * @generated from protobuf enum protos.steps.HttpRequestMethod
 */
export declare enum HttpRequestMethod {
    /**
     * @generated from protobuf enum value: HTTP_REQUEST_METHOD_UNSET = 0;
     */
    UNSET = 0,
    /**
     * @generated from protobuf enum value: HTTP_REQUEST_METHOD_GET = 1;
     */
    GET = 1,
    /**
     * @generated from protobuf enum value: HTTP_REQUEST_METHOD_POST = 2;
     */
    POST = 2,
    /**
     * @generated from protobuf enum value: HTTP_REQUEST_METHOD_PUT = 3;
     */
    PUT = 3,
    /**
     * @generated from protobuf enum value: HTTP_REQUEST_METHOD_DELETE = 4;
     */
    DELETE = 4,
    /**
     * @generated from protobuf enum value: HTTP_REQUEST_METHOD_PATCH = 5;
     */
    PATCH = 5,
    /**
     * @generated from protobuf enum value: HTTP_REQUEST_METHOD_HEAD = 6;
     */
    HEAD = 6,
    /**
     * @generated from protobuf enum value: HTTP_REQUEST_METHOD_OPTIONS = 7;
     */
    OPTIONS = 7
}
/**
 * @generated from protobuf enum protos.steps.HttpRequestBodyMode
 */
export declare enum HttpRequestBodyMode {
    /**
     * @generated from protobuf enum value: HTTP_REQUEST_BODY_MODE_UNSET = 0;
     */
    UNSET = 0,
    /**
     * @generated from protobuf enum value: HTTP_REQUEST_BODY_MODE_STATIC = 1;
     */
    STATIC = 1,
    /**
     * @generated from protobuf enum value: HTTP_REQUEST_BODY_MODE_INTER_STEP_RESULT = 2;
     */
    INTER_STEP_RESULT = 2
}
declare class HttpRequest$Type extends MessageType<HttpRequest> {
    constructor();
    create(value?: PartialMessage<HttpRequest>): HttpRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: HttpRequest): HttpRequest;
    private binaryReadMap4;
    internalBinaryWrite(message: HttpRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.steps.HttpRequest
 */
export declare const HttpRequest: HttpRequest$Type;
declare class HttpResponse$Type extends MessageType<HttpResponse> {
    constructor();
    create(value?: PartialMessage<HttpResponse>): HttpResponse;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: HttpResponse): HttpResponse;
    private binaryReadMap3;
    internalBinaryWrite(message: HttpResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.steps.HttpResponse
 */
export declare const HttpResponse: HttpResponse$Type;
declare class HttpRequestStep$Type extends MessageType<HttpRequestStep> {
    constructor();
    create(value?: PartialMessage<HttpRequestStep>): HttpRequestStep;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: HttpRequestStep): HttpRequestStep;
    internalBinaryWrite(message: HttpRequestStep, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.steps.HttpRequestStep
 */
export declare const HttpRequestStep: HttpRequestStep$Type;
export {};
