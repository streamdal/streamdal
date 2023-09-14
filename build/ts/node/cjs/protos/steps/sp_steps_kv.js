"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KVStep = exports.KVStepResponse = exports.KVStatus = exports.KVMode = void 0;
const runtime_1 = require("@protobuf-ts/runtime");
const runtime_2 = require("@protobuf-ts/runtime");
const runtime_3 = require("@protobuf-ts/runtime");
const runtime_4 = require("@protobuf-ts/runtime");
const runtime_5 = require("@protobuf-ts/runtime");
const sp_shared_1 = require("../shared/sp_shared");
// !!!!!!!!!!!!!!!!!!!!!!!!!!! IMPORTANT !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// 
// KV consists of two parts:
// 
// - KVStep
// - KVStepResponse
// 
// KVStep is used in PipelineSteps that will execute a specific KV request;
// the actual KV lookup is performed by the KV WASM func that calls out to
// HostFuncKVExists() that is a function exported by the SDK.
// 
// The HostFuncKVExists() function is needed because as of 08.30.2023, WASM does
// not have socket support, so we need to call out to the SDK to perform the
// actual KV API call.
// 
// NOTE: The KV host funcs accept a special request type but return a generic
// response. This is done so that we can include custom request params that
// might only be relevant to that specific KV func while the response will
// contain fields that are common to all KV funcs. Ie. KVExistsRequest requires
// you to specify the lookup mode (which would not be needed for something like
// a KVGet request), while the response is generally the same - did it succeed?
// did it fail? was there an internal error? what is the return data (if any)?
/**
 * Used by frontend when constructing a pipeline that contains a KV step that
 * performs any KV request. The mode determines _what_ the contents of the
 * key will be. Read comments about "static" vs "dynamic".
 * protolint:disable:next ENUM_FIELD_NAMES_PREFIX
 *
 * @generated from protobuf enum protos.steps.KVMode
 */
var KVMode;
(function (KVMode) {
    /**
     * @generated from protobuf enum value: KV_MODE_UNSET = 0;
     */
    KVMode[KVMode["KV_MODE_UNSET"] = 0] = "KV_MODE_UNSET";
    /**
     * Will cause the KV lookup to use the key string as-is for the lookup
     *
     * @generated from protobuf enum value: KV_MODE_STATIC = 1;
     */
    KVMode[KVMode["KV_MODE_STATIC"] = 1] = "KV_MODE_STATIC";
    /**
     * DYNAMIC mode will cause the KV lookup WASM to use the key to lookup the
     * associated value and use the result for the key existence check.
     *
     * For example, if "key" in KVHostFuncRequest is set to "foo", KV WASM will do
     * the following:
     *
     * 1. Lookup the value of "foo" in the payload (which is "bar")
     * 2. Use "bar" as the "key" for the KV lookup
     *
     * @generated from protobuf enum value: KV_MODE_DYNAMIC = 2;
     */
    KVMode[KVMode["KV_MODE_DYNAMIC"] = 2] = "KV_MODE_DYNAMIC";
})(KVMode || (exports.KVMode = KVMode = {}));
/**
 * Returned by KV host func and interpreted by KV WASM.
 * protolint:disable:next ENUM_FIELD_NAMES_PREFIX
 *
 * @generated from protobuf enum protos.steps.KVStatus
 */
var KVStatus;
(function (KVStatus) {
    /**
     * @generated from protobuf enum value: KV_STATUS_UNSET = 0;
     */
    KVStatus[KVStatus["KV_STATUS_UNSET"] = 0] = "KV_STATUS_UNSET";
    /**
     * @generated from protobuf enum value: KV_STATUS_SUCCESS = 1;
     */
    KVStatus[KVStatus["KV_STATUS_SUCCESS"] = 1] = "KV_STATUS_SUCCESS";
    /**
     * @generated from protobuf enum value: KV_STATUS_FAILURE = 2;
     */
    KVStatus[KVStatus["KV_STATUS_FAILURE"] = 2] = "KV_STATUS_FAILURE";
    /**
     * @generated from protobuf enum value: KV_STATUS_ERROR = 3;
     */
    KVStatus[KVStatus["KV_STATUS_ERROR"] = 3] = "KV_STATUS_ERROR";
})(KVStatus || (exports.KVStatus = KVStatus = {}));
// @generated message type with reflection information, may provide speed optimized methods
class KVStepResponse$Type extends runtime_5.MessageType {
    constructor() {
        super("protos.steps.KVStepResponse", [
            { no: 1, name: "status", kind: "enum", T: () => ["protos.steps.KVStatus", KVStatus] },
            { no: 2, name: "message", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 3, name: "value", kind: "scalar", opt: true, T: 12 /*ScalarType.BYTES*/ }
        ]);
    }
    create(value) {
        const message = { status: 0, message: "" };
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
                case /* protos.steps.KVStatus status */ 1:
                    message.status = reader.int32();
                    break;
                case /* string message */ 2:
                    message.message = reader.string();
                    break;
                case /* optional bytes value */ 3:
                    message.value = reader.bytes();
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
        /* protos.steps.KVStatus status = 1; */
        if (message.status !== 0)
            writer.tag(1, runtime_1.WireType.Varint).int32(message.status);
        /* string message = 2; */
        if (message.message !== "")
            writer.tag(2, runtime_1.WireType.LengthDelimited).string(message.message);
        /* optional bytes value = 3; */
        if (message.value !== undefined)
            writer.tag(3, runtime_1.WireType.LengthDelimited).bytes(message.value);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.steps.KVStepResponse
 */
exports.KVStepResponse = new KVStepResponse$Type();
// @generated message type with reflection information, may provide speed optimized methods
class KVStep$Type extends runtime_5.MessageType {
    constructor() {
        super("protos.steps.KVStep", [
            { no: 1, name: "action", kind: "enum", T: () => ["protos.shared.KVAction", sp_shared_1.KVAction] },
            { no: 2, name: "mode", kind: "enum", T: () => ["protos.steps.KVMode", KVMode] },
            { no: 3, name: "key", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 4, name: "value", kind: "scalar", opt: true, T: 12 /*ScalarType.BYTES*/ }
        ]);
    }
    create(value) {
        const message = { action: 0, mode: 0, key: "" };
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
                case /* protos.shared.KVAction action */ 1:
                    message.action = reader.int32();
                    break;
                case /* protos.steps.KVMode mode */ 2:
                    message.mode = reader.int32();
                    break;
                case /* string key */ 3:
                    message.key = reader.string();
                    break;
                case /* optional bytes value */ 4:
                    message.value = reader.bytes();
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
        /* protos.shared.KVAction action = 1; */
        if (message.action !== 0)
            writer.tag(1, runtime_1.WireType.Varint).int32(message.action);
        /* protos.steps.KVMode mode = 2; */
        if (message.mode !== 0)
            writer.tag(2, runtime_1.WireType.Varint).int32(message.mode);
        /* string key = 3; */
        if (message.key !== "")
            writer.tag(3, runtime_1.WireType.LengthDelimited).string(message.key);
        /* optional bytes value = 4; */
        if (message.value !== undefined)
            writer.tag(4, runtime_1.WireType.LengthDelimited).bytes(message.value);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.steps.KVStep
 */
exports.KVStep = new KVStep$Type();
