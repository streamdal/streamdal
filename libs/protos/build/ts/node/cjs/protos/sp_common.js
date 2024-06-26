"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = exports.SampleOptions = exports.Schema = exports.AudienceRate = exports.TailResponse = exports.TailRequest = exports.Metric = exports.Audience = exports.StandardResponse = exports.TailRequestType = exports.TailResponseType = exports.OperationType = exports.ResponseCode = void 0;
const runtime_1 = require("@protobuf-ts/runtime");
const runtime_2 = require("@protobuf-ts/runtime");
const runtime_3 = require("@protobuf-ts/runtime");
const runtime_4 = require("@protobuf-ts/runtime");
const runtime_5 = require("@protobuf-ts/runtime");
const sp_pipeline_1 = require("./sp_pipeline");
const sp_shared_1 = require("./shared/sp_shared");
const sp_notify_1 = require("./sp_notify");
const sp_pipeline_2 = require("./sp_pipeline");
/**
 * Common status codes used in gRPC method responses
 *
 * @generated from protobuf enum protos.ResponseCode
 */
var ResponseCode;
(function (ResponseCode) {
    /**
     * @generated from protobuf enum value: RESPONSE_CODE_UNSET = 0;
     */
    ResponseCode[ResponseCode["UNSET"] = 0] = "UNSET";
    /**
     * @generated from protobuf enum value: RESPONSE_CODE_OK = 1;
     */
    ResponseCode[ResponseCode["OK"] = 1] = "OK";
    /**
     * @generated from protobuf enum value: RESPONSE_CODE_BAD_REQUEST = 2;
     */
    ResponseCode[ResponseCode["BAD_REQUEST"] = 2] = "BAD_REQUEST";
    /**
     * @generated from protobuf enum value: RESPONSE_CODE_NOT_FOUND = 3;
     */
    ResponseCode[ResponseCode["NOT_FOUND"] = 3] = "NOT_FOUND";
    /**
     * @generated from protobuf enum value: RESPONSE_CODE_INTERNAL_SERVER_ERROR = 4;
     */
    ResponseCode[ResponseCode["INTERNAL_SERVER_ERROR"] = 4] = "INTERNAL_SERVER_ERROR";
    /**
     * @generated from protobuf enum value: RESPONSE_CODE_GENERIC_ERROR = 5;
     */
    ResponseCode[ResponseCode["GENERIC_ERROR"] = 5] = "GENERIC_ERROR";
})(ResponseCode || (exports.ResponseCode = ResponseCode = {}));
/**
 * Each SDK client is a $service + $component + $operation_type
 *
 * @generated from protobuf enum protos.OperationType
 */
var OperationType;
(function (OperationType) {
    /**
     * @generated from protobuf enum value: OPERATION_TYPE_UNSET = 0;
     */
    OperationType[OperationType["UNSET"] = 0] = "UNSET";
    /**
     * @generated from protobuf enum value: OPERATION_TYPE_CONSUMER = 1;
     */
    OperationType[OperationType["CONSUMER"] = 1] = "CONSUMER";
    /**
     * @generated from protobuf enum value: OPERATION_TYPE_PRODUCER = 2;
     */
    OperationType[OperationType["PRODUCER"] = 2] = "PRODUCER";
})(OperationType || (exports.OperationType = OperationType = {}));
/**
 * @generated from protobuf enum protos.TailResponseType
 */
var TailResponseType;
(function (TailResponseType) {
    /**
     * @generated from protobuf enum value: TAIL_RESPONSE_TYPE_UNSET = 0;
     */
    TailResponseType[TailResponseType["UNSET"] = 0] = "UNSET";
    /**
     * @generated from protobuf enum value: TAIL_RESPONSE_TYPE_PAYLOAD = 1;
     */
    TailResponseType[TailResponseType["PAYLOAD"] = 1] = "PAYLOAD";
    /**
     * @generated from protobuf enum value: TAIL_RESPONSE_TYPE_ERROR = 2;
     */
    TailResponseType[TailResponseType["ERROR"] = 2] = "ERROR";
})(TailResponseType || (exports.TailResponseType = TailResponseType = {}));
/**
 * @generated from protobuf enum protos.TailRequestType
 */
var TailRequestType;
(function (TailRequestType) {
    /**
     * @generated from protobuf enum value: TAIL_REQUEST_TYPE_UNSET = 0;
     */
    TailRequestType[TailRequestType["UNSET"] = 0] = "UNSET";
    /**
     * @generated from protobuf enum value: TAIL_REQUEST_TYPE_START = 1;
     */
    TailRequestType[TailRequestType["START"] = 1] = "START";
    /**
     * @generated from protobuf enum value: TAIL_REQUEST_TYPE_STOP = 2;
     */
    TailRequestType[TailRequestType["STOP"] = 2] = "STOP";
    /**
     * @generated from protobuf enum value: TAIL_REQUEST_TYPE_PAUSE = 3;
     */
    TailRequestType[TailRequestType["PAUSE"] = 3] = "PAUSE";
    /**
     * @generated from protobuf enum value: TAIL_REQUEST_TYPE_RESUME = 4;
     */
    TailRequestType[TailRequestType["RESUME"] = 4] = "RESUME";
})(TailRequestType || (exports.TailRequestType = TailRequestType = {}));
// @generated message type with reflection information, may provide speed optimized methods
class StandardResponse$Type extends runtime_5.MessageType {
    constructor() {
        super("protos.StandardResponse", [
            { no: 1, name: "id", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "code", kind: "enum", T: () => ["protos.ResponseCode", ResponseCode, "RESPONSE_CODE_"] },
            { no: 3, name: "message", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value) {
        const message = { id: "", code: 0, message: "" };
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
                case /* string id */ 1:
                    message.id = reader.string();
                    break;
                case /* protos.ResponseCode code */ 2:
                    message.code = reader.int32();
                    break;
                case /* string message */ 3:
                    message.message = reader.string();
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
        /* string id = 1; */
        if (message.id !== "")
            writer.tag(1, runtime_1.WireType.LengthDelimited).string(message.id);
        /* protos.ResponseCode code = 2; */
        if (message.code !== 0)
            writer.tag(2, runtime_1.WireType.Varint).int32(message.code);
        /* string message = 3; */
        if (message.message !== "")
            writer.tag(3, runtime_1.WireType.LengthDelimited).string(message.message);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.StandardResponse
 */
exports.StandardResponse = new StandardResponse$Type();
// @generated message type with reflection information, may provide speed optimized methods
class Audience$Type extends runtime_5.MessageType {
    constructor() {
        super("protos.Audience", [
            { no: 1, name: "service_name", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "component_name", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 3, name: "operation_type", kind: "enum", T: () => ["protos.OperationType", OperationType, "OPERATION_TYPE_"] },
            { no: 4, name: "operation_name", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 1000, name: "_created_by", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value) {
        const message = { serviceName: "", componentName: "", operationType: 0, operationName: "" };
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
                case /* string service_name */ 1:
                    message.serviceName = reader.string();
                    break;
                case /* string component_name */ 2:
                    message.componentName = reader.string();
                    break;
                case /* protos.OperationType operation_type */ 3:
                    message.operationType = reader.int32();
                    break;
                case /* string operation_name */ 4:
                    message.operationName = reader.string();
                    break;
                case /* optional string _created_by */ 1000:
                    message.CreatedBy = reader.string();
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
        /* string service_name = 1; */
        if (message.serviceName !== "")
            writer.tag(1, runtime_1.WireType.LengthDelimited).string(message.serviceName);
        /* string component_name = 2; */
        if (message.componentName !== "")
            writer.tag(2, runtime_1.WireType.LengthDelimited).string(message.componentName);
        /* protos.OperationType operation_type = 3; */
        if (message.operationType !== 0)
            writer.tag(3, runtime_1.WireType.Varint).int32(message.operationType);
        /* string operation_name = 4; */
        if (message.operationName !== "")
            writer.tag(4, runtime_1.WireType.LengthDelimited).string(message.operationName);
        /* optional string _created_by = 1000; */
        if (message.CreatedBy !== undefined)
            writer.tag(1000, runtime_1.WireType.LengthDelimited).string(message.CreatedBy);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.Audience
 */
exports.Audience = new Audience$Type();
// @generated message type with reflection information, may provide speed optimized methods
class Metric$Type extends runtime_5.MessageType {
    constructor() {
        super("protos.Metric", [
            { no: 1, name: "name", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "labels", kind: "map", K: 9 /*ScalarType.STRING*/, V: { kind: "scalar", T: 9 /*ScalarType.STRING*/ } },
            { no: 3, name: "value", kind: "scalar", T: 1 /*ScalarType.DOUBLE*/ },
            { no: 4, name: "audience", kind: "message", T: () => exports.Audience }
        ]);
    }
    create(value) {
        const message = { name: "", labels: {}, value: 0 };
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
                case /* string name */ 1:
                    message.name = reader.string();
                    break;
                case /* map<string, string> labels */ 2:
                    this.binaryReadMap2(message.labels, reader, options);
                    break;
                case /* double value */ 3:
                    message.value = reader.double();
                    break;
                case /* protos.Audience audience */ 4:
                    message.audience = exports.Audience.internalBinaryRead(reader, reader.uint32(), options, message.audience);
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
    binaryReadMap2(map, reader, options) {
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
                default: throw new globalThis.Error("unknown map entry field for field protos.Metric.labels");
            }
        }
        map[key !== null && key !== void 0 ? key : ""] = val !== null && val !== void 0 ? val : "";
    }
    internalBinaryWrite(message, writer, options) {
        /* string name = 1; */
        if (message.name !== "")
            writer.tag(1, runtime_1.WireType.LengthDelimited).string(message.name);
        /* map<string, string> labels = 2; */
        for (let k of Object.keys(message.labels))
            writer.tag(2, runtime_1.WireType.LengthDelimited).fork().tag(1, runtime_1.WireType.LengthDelimited).string(k).tag(2, runtime_1.WireType.LengthDelimited).string(message.labels[k]).join();
        /* double value = 3; */
        if (message.value !== 0)
            writer.tag(3, runtime_1.WireType.Bit64).double(message.value);
        /* protos.Audience audience = 4; */
        if (message.audience)
            exports.Audience.internalBinaryWrite(message.audience, writer.tag(4, runtime_1.WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.Metric
 */
exports.Metric = new Metric$Type();
// @generated message type with reflection information, may provide speed optimized methods
class TailRequest$Type extends runtime_5.MessageType {
    constructor() {
        super("protos.TailRequest", [
            { no: 1, name: "type", kind: "enum", T: () => ["protos.TailRequestType", TailRequestType, "TAIL_REQUEST_TYPE_"] },
            { no: 2, name: "id", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 3, name: "audience", kind: "message", T: () => exports.Audience },
            { no: 4, name: "pipeline_id", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 5, name: "sample_options", kind: "message", T: () => exports.SampleOptions },
            { no: 1000, name: "_metadata", kind: "map", K: 9 /*ScalarType.STRING*/, V: { kind: "scalar", T: 9 /*ScalarType.STRING*/ } }
        ]);
    }
    create(value) {
        const message = { type: 0, id: "", Metadata: {} };
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
                case /* protos.TailRequestType type */ 1:
                    message.type = reader.int32();
                    break;
                case /* string id */ 2:
                    message.id = reader.string();
                    break;
                case /* protos.Audience audience */ 3:
                    message.audience = exports.Audience.internalBinaryRead(reader, reader.uint32(), options, message.audience);
                    break;
                case /* optional string pipeline_id = 4 [deprecated = true];*/ 4:
                    message.pipelineId = reader.string();
                    break;
                case /* protos.SampleOptions sample_options */ 5:
                    message.sampleOptions = exports.SampleOptions.internalBinaryRead(reader, reader.uint32(), options, message.sampleOptions);
                    break;
                case /* map<string, string> _metadata */ 1000:
                    this.binaryReadMap1000(message.Metadata, reader, options);
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
    binaryReadMap1000(map, reader, options) {
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
                default: throw new globalThis.Error("unknown map entry field for field protos.TailRequest._metadata");
            }
        }
        map[key !== null && key !== void 0 ? key : ""] = val !== null && val !== void 0 ? val : "";
    }
    internalBinaryWrite(message, writer, options) {
        /* protos.TailRequestType type = 1; */
        if (message.type !== 0)
            writer.tag(1, runtime_1.WireType.Varint).int32(message.type);
        /* string id = 2; */
        if (message.id !== "")
            writer.tag(2, runtime_1.WireType.LengthDelimited).string(message.id);
        /* protos.Audience audience = 3; */
        if (message.audience)
            exports.Audience.internalBinaryWrite(message.audience, writer.tag(3, runtime_1.WireType.LengthDelimited).fork(), options).join();
        /* optional string pipeline_id = 4 [deprecated = true]; */
        if (message.pipelineId !== undefined)
            writer.tag(4, runtime_1.WireType.LengthDelimited).string(message.pipelineId);
        /* protos.SampleOptions sample_options = 5; */
        if (message.sampleOptions)
            exports.SampleOptions.internalBinaryWrite(message.sampleOptions, writer.tag(5, runtime_1.WireType.LengthDelimited).fork(), options).join();
        /* map<string, string> _metadata = 1000; */
        for (let k of Object.keys(message.Metadata))
            writer.tag(1000, runtime_1.WireType.LengthDelimited).fork().tag(1, runtime_1.WireType.LengthDelimited).string(k).tag(2, runtime_1.WireType.LengthDelimited).string(message.Metadata[k]).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.TailRequest
 */
exports.TailRequest = new TailRequest$Type();
// @generated message type with reflection information, may provide speed optimized methods
class TailResponse$Type extends runtime_5.MessageType {
    constructor() {
        super("protos.TailResponse", [
            { no: 1, name: "type", kind: "enum", T: () => ["protos.TailResponseType", TailResponseType, "TAIL_RESPONSE_TYPE_"] },
            { no: 2, name: "tail_request_id", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 3, name: "audience", kind: "message", T: () => exports.Audience },
            { no: 4, name: "pipeline_id", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 5, name: "session_id", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 6, name: "timestamp_ns", kind: "scalar", T: 3 /*ScalarType.INT64*/ },
            { no: 7, name: "original_data", kind: "scalar", T: 12 /*ScalarType.BYTES*/ },
            { no: 8, name: "new_data", kind: "scalar", T: 12 /*ScalarType.BYTES*/ },
            { no: 1000, name: "_metadata", kind: "map", K: 9 /*ScalarType.STRING*/, V: { kind: "scalar", T: 9 /*ScalarType.STRING*/ } },
            { no: 1001, name: "_keepalive", kind: "scalar", opt: true, T: 8 /*ScalarType.BOOL*/ }
        ]);
    }
    create(value) {
        const message = { type: 0, tailRequestId: "", pipelineId: "", sessionId: "", timestampNs: "0", originalData: new Uint8Array(0), newData: new Uint8Array(0), Metadata: {} };
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
                case /* protos.TailResponseType type */ 1:
                    message.type = reader.int32();
                    break;
                case /* string tail_request_id */ 2:
                    message.tailRequestId = reader.string();
                    break;
                case /* protos.Audience audience */ 3:
                    message.audience = exports.Audience.internalBinaryRead(reader, reader.uint32(), options, message.audience);
                    break;
                case /* string pipeline_id */ 4:
                    message.pipelineId = reader.string();
                    break;
                case /* string session_id */ 5:
                    message.sessionId = reader.string();
                    break;
                case /* int64 timestamp_ns */ 6:
                    message.timestampNs = reader.int64().toString();
                    break;
                case /* bytes original_data */ 7:
                    message.originalData = reader.bytes();
                    break;
                case /* bytes new_data */ 8:
                    message.newData = reader.bytes();
                    break;
                case /* map<string, string> _metadata */ 1000:
                    this.binaryReadMap1000(message.Metadata, reader, options);
                    break;
                case /* optional bool _keepalive */ 1001:
                    message.Keepalive = reader.bool();
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
    binaryReadMap1000(map, reader, options) {
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
                default: throw new globalThis.Error("unknown map entry field for field protos.TailResponse._metadata");
            }
        }
        map[key !== null && key !== void 0 ? key : ""] = val !== null && val !== void 0 ? val : "";
    }
    internalBinaryWrite(message, writer, options) {
        /* protos.TailResponseType type = 1; */
        if (message.type !== 0)
            writer.tag(1, runtime_1.WireType.Varint).int32(message.type);
        /* string tail_request_id = 2; */
        if (message.tailRequestId !== "")
            writer.tag(2, runtime_1.WireType.LengthDelimited).string(message.tailRequestId);
        /* protos.Audience audience = 3; */
        if (message.audience)
            exports.Audience.internalBinaryWrite(message.audience, writer.tag(3, runtime_1.WireType.LengthDelimited).fork(), options).join();
        /* string pipeline_id = 4; */
        if (message.pipelineId !== "")
            writer.tag(4, runtime_1.WireType.LengthDelimited).string(message.pipelineId);
        /* string session_id = 5; */
        if (message.sessionId !== "")
            writer.tag(5, runtime_1.WireType.LengthDelimited).string(message.sessionId);
        /* int64 timestamp_ns = 6; */
        if (message.timestampNs !== "0")
            writer.tag(6, runtime_1.WireType.Varint).int64(message.timestampNs);
        /* bytes original_data = 7; */
        if (message.originalData.length)
            writer.tag(7, runtime_1.WireType.LengthDelimited).bytes(message.originalData);
        /* bytes new_data = 8; */
        if (message.newData.length)
            writer.tag(8, runtime_1.WireType.LengthDelimited).bytes(message.newData);
        /* map<string, string> _metadata = 1000; */
        for (let k of Object.keys(message.Metadata))
            writer.tag(1000, runtime_1.WireType.LengthDelimited).fork().tag(1, runtime_1.WireType.LengthDelimited).string(k).tag(2, runtime_1.WireType.LengthDelimited).string(message.Metadata[k]).join();
        /* optional bool _keepalive = 1001; */
        if (message.Keepalive !== undefined)
            writer.tag(1001, runtime_1.WireType.Varint).bool(message.Keepalive);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.TailResponse
 */
exports.TailResponse = new TailResponse$Type();
// @generated message type with reflection information, may provide speed optimized methods
class AudienceRate$Type extends runtime_5.MessageType {
    constructor() {
        super("protos.AudienceRate", [
            { no: 1, name: "bytes", kind: "scalar", T: 1 /*ScalarType.DOUBLE*/ },
            { no: 2, name: "processed", kind: "scalar", T: 1 /*ScalarType.DOUBLE*/ }
        ]);
    }
    create(value) {
        const message = { bytes: 0, processed: 0 };
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
                case /* double bytes */ 1:
                    message.bytes = reader.double();
                    break;
                case /* double processed */ 2:
                    message.processed = reader.double();
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
        /* double bytes = 1; */
        if (message.bytes !== 0)
            writer.tag(1, runtime_1.WireType.Bit64).double(message.bytes);
        /* double processed = 2; */
        if (message.processed !== 0)
            writer.tag(2, runtime_1.WireType.Bit64).double(message.processed);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.AudienceRate
 */
exports.AudienceRate = new AudienceRate$Type();
// @generated message type with reflection information, may provide speed optimized methods
class Schema$Type extends runtime_5.MessageType {
    constructor() {
        super("protos.Schema", [
            { no: 1, name: "json_schema", kind: "scalar", T: 12 /*ScalarType.BYTES*/ },
            { no: 100, name: "_version", kind: "scalar", T: 5 /*ScalarType.INT32*/ },
            { no: 1000, name: "_metadata", kind: "map", K: 9 /*ScalarType.STRING*/, V: { kind: "scalar", T: 9 /*ScalarType.STRING*/ } }
        ]);
    }
    create(value) {
        const message = { jsonSchema: new Uint8Array(0), Version: 0, Metadata: {} };
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
                case /* bytes json_schema */ 1:
                    message.jsonSchema = reader.bytes();
                    break;
                case /* int32 _version */ 100:
                    message.Version = reader.int32();
                    break;
                case /* map<string, string> _metadata */ 1000:
                    this.binaryReadMap1000(message.Metadata, reader, options);
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
    binaryReadMap1000(map, reader, options) {
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
                default: throw new globalThis.Error("unknown map entry field for field protos.Schema._metadata");
            }
        }
        map[key !== null && key !== void 0 ? key : ""] = val !== null && val !== void 0 ? val : "";
    }
    internalBinaryWrite(message, writer, options) {
        /* bytes json_schema = 1; */
        if (message.jsonSchema.length)
            writer.tag(1, runtime_1.WireType.LengthDelimited).bytes(message.jsonSchema);
        /* int32 _version = 100; */
        if (message.Version !== 0)
            writer.tag(100, runtime_1.WireType.Varint).int32(message.Version);
        /* map<string, string> _metadata = 1000; */
        for (let k of Object.keys(message.Metadata))
            writer.tag(1000, runtime_1.WireType.LengthDelimited).fork().tag(1, runtime_1.WireType.LengthDelimited).string(k).tag(2, runtime_1.WireType.LengthDelimited).string(message.Metadata[k]).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.Schema
 */
exports.Schema = new Schema$Type();
// @generated message type with reflection information, may provide speed optimized methods
class SampleOptions$Type extends runtime_5.MessageType {
    constructor() {
        super("protos.SampleOptions", [
            { no: 1, name: "sample_rate", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
            { no: 2, name: "sample_interval_seconds", kind: "scalar", T: 13 /*ScalarType.UINT32*/ }
        ]);
    }
    create(value) {
        const message = { sampleRate: 0, sampleIntervalSeconds: 0 };
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
                case /* uint32 sample_rate */ 1:
                    message.sampleRate = reader.uint32();
                    break;
                case /* uint32 sample_interval_seconds */ 2:
                    message.sampleIntervalSeconds = reader.uint32();
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
        /* uint32 sample_rate = 1; */
        if (message.sampleRate !== 0)
            writer.tag(1, runtime_1.WireType.Varint).uint32(message.sampleRate);
        /* uint32 sample_interval_seconds = 2; */
        if (message.sampleIntervalSeconds !== 0)
            writer.tag(2, runtime_1.WireType.Varint).uint32(message.sampleIntervalSeconds);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.SampleOptions
 */
exports.SampleOptions = new SampleOptions$Type();
// @generated message type with reflection information, may provide speed optimized methods
class Config$Type extends runtime_5.MessageType {
    constructor() {
        super("protos.Config", [
            { no: 1, name: "audiences", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => exports.Audience },
            { no: 2, name: "pipelines", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => sp_pipeline_2.Pipeline },
            { no: 3, name: "notifications", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => sp_notify_1.NotificationConfig },
            { no: 4, name: "wasm_modules", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => sp_shared_1.WasmModule },
            { no: 5, name: "audience_mappings", kind: "map", K: 9 /*ScalarType.STRING*/, V: { kind: "message", T: () => sp_pipeline_1.PipelineConfigs } }
        ]);
    }
    create(value) {
        const message = { audiences: [], pipelines: [], notifications: [], wasmModules: [], audienceMappings: {} };
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
                case /* repeated protos.Audience audiences */ 1:
                    message.audiences.push(exports.Audience.internalBinaryRead(reader, reader.uint32(), options));
                    break;
                case /* repeated protos.Pipeline pipelines */ 2:
                    message.pipelines.push(sp_pipeline_2.Pipeline.internalBinaryRead(reader, reader.uint32(), options));
                    break;
                case /* repeated protos.NotificationConfig notifications */ 3:
                    message.notifications.push(sp_notify_1.NotificationConfig.internalBinaryRead(reader, reader.uint32(), options));
                    break;
                case /* repeated protos.shared.WasmModule wasm_modules */ 4:
                    message.wasmModules.push(sp_shared_1.WasmModule.internalBinaryRead(reader, reader.uint32(), options));
                    break;
                case /* map<string, protos.PipelineConfigs> audience_mappings */ 5:
                    this.binaryReadMap5(message.audienceMappings, reader, options);
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
    binaryReadMap5(map, reader, options) {
        let len = reader.uint32(), end = reader.pos + len, key, val;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case 1:
                    key = reader.string();
                    break;
                case 2:
                    val = sp_pipeline_1.PipelineConfigs.internalBinaryRead(reader, reader.uint32(), options);
                    break;
                default: throw new globalThis.Error("unknown map entry field for field protos.Config.audience_mappings");
            }
        }
        map[key !== null && key !== void 0 ? key : ""] = val !== null && val !== void 0 ? val : sp_pipeline_1.PipelineConfigs.create();
    }
    internalBinaryWrite(message, writer, options) {
        /* repeated protos.Audience audiences = 1; */
        for (let i = 0; i < message.audiences.length; i++)
            exports.Audience.internalBinaryWrite(message.audiences[i], writer.tag(1, runtime_1.WireType.LengthDelimited).fork(), options).join();
        /* repeated protos.Pipeline pipelines = 2; */
        for (let i = 0; i < message.pipelines.length; i++)
            sp_pipeline_2.Pipeline.internalBinaryWrite(message.pipelines[i], writer.tag(2, runtime_1.WireType.LengthDelimited).fork(), options).join();
        /* repeated protos.NotificationConfig notifications = 3; */
        for (let i = 0; i < message.notifications.length; i++)
            sp_notify_1.NotificationConfig.internalBinaryWrite(message.notifications[i], writer.tag(3, runtime_1.WireType.LengthDelimited).fork(), options).join();
        /* repeated protos.shared.WasmModule wasm_modules = 4; */
        for (let i = 0; i < message.wasmModules.length; i++)
            sp_shared_1.WasmModule.internalBinaryWrite(message.wasmModules[i], writer.tag(4, runtime_1.WireType.LengthDelimited).fork(), options).join();
        /* map<string, protos.PipelineConfigs> audience_mappings = 5; */
        for (let k of Object.keys(message.audienceMappings)) {
            writer.tag(5, runtime_1.WireType.LengthDelimited).fork().tag(1, runtime_1.WireType.LengthDelimited).string(k);
            writer.tag(2, runtime_1.WireType.LengthDelimited).fork();
            sp_pipeline_1.PipelineConfigs.internalBinaryWrite(message.audienceMappings[k], writer, options);
            writer.join().join();
        }
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.Config
 */
exports.Config = new Config$Type();
