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
    DELETE = 4
}
declare class HttpRequest$Type extends MessageType<HttpRequest> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.steps.HttpRequest
 */
export declare const HttpRequest: HttpRequest$Type;
declare class HttpResponse$Type extends MessageType<HttpResponse> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.steps.HttpResponse
 */
export declare const HttpResponse: HttpResponse$Type;
declare class HttpRequestStep$Type extends MessageType<HttpRequestStep> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.steps.HttpRequestStep
 */
export declare const HttpRequestStep: HttpRequestStep$Type;
export {};
