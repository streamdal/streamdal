"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpRequestStep = exports.HttpResponse = exports.HttpRequest = exports.HttpRequestMethod = void 0;
const runtime_1 = require("@protobuf-ts/runtime");
const runtime_2 = require("@protobuf-ts/runtime");
const runtime_3 = require("@protobuf-ts/runtime");
const runtime_4 = require("@protobuf-ts/runtime");
const runtime_5 = require("@protobuf-ts/runtime");
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
class HttpRequest$Type extends runtime_5.MessageType {
    constructor() {
        super("protos.steps.HttpRequest", [
            { no: 1, name: "method", kind: "enum", T: () => ["protos.steps.HttpRequestMethod", HttpRequestMethod, "HTTP_REQUEST_METHOD_"] },
            { no: 2, name: "url", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 3, name: "body", kind: "scalar", T: 12 /*ScalarType.BYTES*/ },
            { no: 4, name: "headers", kind: "map", K: 9 /*ScalarType.STRING*/, V: { kind: "scalar", T: 9 /*ScalarType.STRING*/ } }
        ]);
    }
    create(value) {
        const message = { method: 0, url: "", body: new Uint8Array(0), headers: {} };
        globalThis.Object.defineProperty(message, runtime_4.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            (0, runtime_3.reflectionMergePartial)(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target !== null && target !== void 0 ? target : this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* protos.steps.HttpRequestMethod method */ 1:
                    message.method = reader.int32();
                    break;
                case /* string url */ 2:
                    message.url = reader.string();
                    break;
                case /* bytes body */ 3:
                    message.body = reader.bytes();
                    break;
                case /* map<string, string> headers */ 4:
                    this.binaryReadMap4(message.headers, reader, options);
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? runtime_2.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    binaryReadMap4(map, reader, options) {
        let len = reader.uint32(), end = reader.pos + len, key, val;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case 1:
                    key = reader.string();
                    break;
                case 2:
                    val = reader.string();
                    break;
                default: throw new globalThis.Error("unknown map entry field for field protos.steps.HttpRequest.headers");
            }
        }
        map[key !== null && key !== void 0 ? key : ""] = val !== null && val !== void 0 ? val : "";
    }
    internalBinaryWrite(message, writer, options) {
        /* protos.steps.HttpRequestMethod method = 1; */
        if (message.method !== 0)
            writer.tag(1, runtime_1.WireType.Varint).int32(message.method);
        /* string url = 2; */
        if (message.url !== "")
            writer.tag(2, runtime_1.WireType.LengthDelimited).string(message.url);
        /* bytes body = 3; */
        if (message.body.length)
            writer.tag(3, runtime_1.WireType.LengthDelimited).bytes(message.body);
        /* map<string, string> headers = 4; */
        for (let k of Object.keys(message.headers))
            writer.tag(4, runtime_1.WireType.LengthDelimited).fork().tag(1, runtime_1.WireType.LengthDelimited).string(k).tag(2, runtime_1.WireType.LengthDelimited).string(message.headers[k]).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.steps.HttpRequest
 */
exports.HttpRequest = new HttpRequest$Type();
// @generated message type with reflection information, may provide speed optimized methods
class HttpResponse$Type extends runtime_5.MessageType {
    constructor() {
        super("protos.steps.HttpResponse", [
            { no: 1, name: "code", kind: "scalar", T: 5 /*ScalarType.INT32*/ },
            { no: 2, name: "body", kind: "scalar", T: 12 /*ScalarType.BYTES*/ },
            { no: 3, name: "headers", kind: "map", K: 9 /*ScalarType.STRING*/, V: { kind: "scalar", T: 9 /*ScalarType.STRING*/ } }
        ]);
    }
    create(value) {
        const message = { code: 0, body: new Uint8Array(0), headers: {} };
        globalThis.Object.defineProperty(message, runtime_4.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            (0, runtime_3.reflectionMergePartial)(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target !== null && target !== void 0 ? target : this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* int32 code */ 1:
                    message.code = reader.int32();
                    break;
                case /* bytes body */ 2:
                    message.body = reader.bytes();
                    break;
                case /* map<string, string> headers */ 3:
                    this.binaryReadMap3(message.headers, reader, options);
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? runtime_2.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    binaryReadMap3(map, reader, options) {
        let len = reader.uint32(), end = reader.pos + len, key, val;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case 1:
                    key = reader.string();
                    break;
                case 2:
                    val = reader.string();
                    break;
                default: throw new globalThis.Error("unknown map entry field for field protos.steps.HttpResponse.headers");
            }
        }
        map[key !== null && key !== void 0 ? key : ""] = val !== null && val !== void 0 ? val : "";
    }
    internalBinaryWrite(message, writer, options) {
        /* int32 code = 1; */
        if (message.code !== 0)
            writer.tag(1, runtime_1.WireType.Varint).int32(message.code);
        /* bytes body = 2; */
        if (message.body.length)
            writer.tag(2, runtime_1.WireType.LengthDelimited).bytes(message.body);
        /* map<string, string> headers = 3; */
        for (let k of Object.keys(message.headers))
            writer.tag(3, runtime_1.WireType.LengthDelimited).fork().tag(1, runtime_1.WireType.LengthDelimited).string(k).tag(2, runtime_1.WireType.LengthDelimited).string(message.headers[k]).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.steps.HttpResponse
 */
exports.HttpResponse = new HttpResponse$Type();
// @generated message type with reflection information, may provide speed optimized methods
class HttpRequestStep$Type extends runtime_5.MessageType {
    constructor() {
        super("protos.steps.HttpRequestStep", [
            { no: 1, name: "request", kind: "message", T: () => exports.HttpRequest }
        ]);
    }
    create(value) {
        const message = {};
        globalThis.Object.defineProperty(message, runtime_4.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            (0, runtime_3.reflectionMergePartial)(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target !== null && target !== void 0 ? target : this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* protos.steps.HttpRequest request */ 1:
                    message.request = exports.HttpRequest.internalBinaryRead(reader, reader.uint32(), options, message.request);
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? runtime_2.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message, writer, options) {
        /* protos.steps.HttpRequest request = 1; */
        if (message.request)
            exports.HttpRequest.internalBinaryWrite(message.request, writer.tag(1, runtime_1.WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.steps.HttpRequestStep
 */
exports.HttpRequestStep = new HttpRequestStep$Type();
