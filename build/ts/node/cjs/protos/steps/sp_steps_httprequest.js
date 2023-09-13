"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpRequestStep = exports.HttpResponse = exports.HttpRequest = exports.HttpRequestMethod = void 0;
// @generated by protobuf-ts 2.9.0 with parameter optimize_code_size
// @generated from protobuf file "steps/sp_steps_httprequest.proto" (package "protos.steps", syntax proto3)
// tslint:disable
const runtime_1 = require("@protobuf-ts/runtime");
/**
 * @generated from protobuf enum protos.steps.HttpRequestMethod
 */
var HttpRequestMethod;
(function (HttpRequestMethod) {
    /**
     * @generated from protobuf enum value: HTTP_REQUEST_METHOD_UNSET = 0;
     */
    HttpRequestMethod[HttpRequestMethod["UNSET"] = 0] = "UNSET";
    /**
     * @generated from protobuf enum value: HTTP_REQUEST_METHOD_GET = 1;
     */
    HttpRequestMethod[HttpRequestMethod["GET"] = 1] = "GET";
    /**
     * @generated from protobuf enum value: HTTP_REQUEST_METHOD_POST = 2;
     */
    HttpRequestMethod[HttpRequestMethod["POST"] = 2] = "POST";
    /**
     * @generated from protobuf enum value: HTTP_REQUEST_METHOD_PUT = 3;
     */
    HttpRequestMethod[HttpRequestMethod["PUT"] = 3] = "PUT";
    /**
     * @generated from protobuf enum value: HTTP_REQUEST_METHOD_DELETE = 4;
     */
    HttpRequestMethod[HttpRequestMethod["DELETE"] = 4] = "DELETE";
})(HttpRequestMethod || (exports.HttpRequestMethod = HttpRequestMethod = {}));
// @generated message type with reflection information, may provide speed optimized methods
class HttpRequest$Type extends runtime_1.MessageType {
    constructor() {
        super("protos.steps.HttpRequest", [
            { no: 1, name: "method", kind: "enum", T: () => ["protos.steps.HttpRequestMethod", HttpRequestMethod, "HTTP_REQUEST_METHOD_"] },
            { no: 2, name: "url", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 3, name: "body", kind: "scalar", T: 12 /*ScalarType.BYTES*/ },
            { no: 4, name: "headers", kind: "map", K: 9 /*ScalarType.STRING*/, V: { kind: "scalar", T: 9 /*ScalarType.STRING*/ } }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message protos.steps.HttpRequest
 */
exports.HttpRequest = new HttpRequest$Type();
// @generated message type with reflection information, may provide speed optimized methods
class HttpResponse$Type extends runtime_1.MessageType {
    constructor() {
        super("protos.steps.HttpResponse", [
            { no: 1, name: "code", kind: "scalar", T: 5 /*ScalarType.INT32*/ },
            { no: 2, name: "body", kind: "scalar", T: 12 /*ScalarType.BYTES*/ },
            { no: 3, name: "headers", kind: "map", K: 9 /*ScalarType.STRING*/, V: { kind: "scalar", T: 9 /*ScalarType.STRING*/ } }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message protos.steps.HttpResponse
 */
exports.HttpResponse = new HttpResponse$Type();
// @generated message type with reflection information, may provide speed optimized methods
class HttpRequestStep$Type extends runtime_1.MessageType {
    constructor() {
        super("protos.steps.HttpRequestStep", [
            { no: 1, name: "request", kind: "message", T: () => exports.HttpRequest }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message protos.steps.HttpRequestStep
 */
exports.HttpRequestStep = new HttpRequestStep$Type();
