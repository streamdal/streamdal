import { MessageType } from "@protobuf-ts/runtime";
/**
 * @generated from protobuf message protos.HttpRequest
 */
export interface HttpRequest {
    /**
     * @generated from protobuf field: protos.HttpRequest.Method method = 1;
     */
    method: HttpRequest_Method;
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
 * @generated from protobuf enum protos.HttpRequest.Method
 */
export declare enum HttpRequest_Method {
    /**
     * @generated from protobuf enum value: METHOD_UNSET = 0;
     */
    UNSET = 0,
    /**
     * @generated from protobuf enum value: METHOD_GET = 1;
     */
    GET = 1,
    /**
     * @generated from protobuf enum value: METHOD_POST = 2;
     */
    POST = 2,
    /**
     * @generated from protobuf enum value: METHOD_PUT = 3;
     */
    PUT = 3,
    /**
     * @generated from protobuf enum value: METHOD_DELETE = 4;
     */
    DELETE = 4
}
/**
 * @generated from protobuf message protos.HttpResponse
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
declare class HttpRequest$Type extends MessageType<HttpRequest> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.HttpRequest
 */
export declare const HttpRequest: HttpRequest$Type;
declare class HttpResponse$Type extends MessageType<HttpResponse> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.HttpResponse
 */
export declare const HttpResponse: HttpResponse$Type;
export {};
