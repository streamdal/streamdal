"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WasmModule = exports.KVAction = void 0;
const runtime_1 = require("@protobuf-ts/runtime");
const runtime_2 = require("@protobuf-ts/runtime");
const runtime_3 = require("@protobuf-ts/runtime");
const runtime_4 = require("@protobuf-ts/runtime");
const runtime_5 = require("@protobuf-ts/runtime");
/**
 * KVAction is a shared type that is used for protos.KVCommand and protos.KVStep.
 * Note that only a subset of actions are used for protos.KVCommand (CREATE,
 * UPDATE, DELETE, DELETE_ALL) while protos.KVStep uses most of them.
 *
 * protolint:disable:next ENUM_FIELD_NAMES_PREFIX
 *
 * @generated from protobuf enum protos.shared.KVAction
 */
var KVAction;
(function (KVAction) {
    /**
     * @generated from protobuf enum value: KV_ACTION_UNSET = 0;
     */
    KVAction[KVAction["KV_ACTION_UNSET"] = 0] = "KV_ACTION_UNSET";
    /**
     * @generated from protobuf enum value: KV_ACTION_GET = 1;
     */
    KVAction[KVAction["KV_ACTION_GET"] = 1] = "KV_ACTION_GET";
    /**
     * @generated from protobuf enum value: KV_ACTION_CREATE = 2;
     */
    KVAction[KVAction["KV_ACTION_CREATE"] = 2] = "KV_ACTION_CREATE";
    /**
     * @generated from protobuf enum value: KV_ACTION_UPDATE = 3;
     */
    KVAction[KVAction["KV_ACTION_UPDATE"] = 3] = "KV_ACTION_UPDATE";
    /**
     * @generated from protobuf enum value: KV_ACTION_EXISTS = 4;
     */
    KVAction[KVAction["KV_ACTION_EXISTS"] = 4] = "KV_ACTION_EXISTS";
    /**
     * @generated from protobuf enum value: KV_ACTION_DELETE = 5;
     */
    KVAction[KVAction["KV_ACTION_DELETE"] = 5] = "KV_ACTION_DELETE";
    /**
     * @generated from protobuf enum value: KV_ACTION_DELETE_ALL = 6;
     */
    KVAction[KVAction["KV_ACTION_DELETE_ALL"] = 6] = "KV_ACTION_DELETE_ALL";
})(KVAction || (exports.KVAction = KVAction = {}));
// @generated message type with reflection information, may provide speed optimized methods
class WasmModule$Type extends runtime_5.MessageType {
    constructor() {
        super("protos.shared.WasmModule", [
            { no: 1, name: "id", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "bytes", kind: "scalar", T: 12 /*ScalarType.BYTES*/ },
            { no: 3, name: "function", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 4, name: "name", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 5, name: "_filename", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 6, name: "_bundled", kind: "scalar", T: 8 /*ScalarType.BOOL*/ },
            { no: 101, name: "description", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 102, name: "version", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 103, name: "url", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 1000, name: "_created_at_unix_ts_ns_utc", kind: "scalar", opt: true, T: 3 /*ScalarType.INT64*/ },
            { no: 1001, name: "_updated_at_unix_ts_ns_utc", kind: "scalar", opt: true, T: 3 /*ScalarType.INT64*/ },
            { no: 1002, name: "_created_by", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value) {
        const message = { id: "", bytes: new Uint8Array(0), function: "", name: "", Filename: "", Bundled: false };
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
                case /* bytes bytes */ 2:
                    message.bytes = reader.bytes();
                    break;
                case /* string function */ 3:
                    message.function = reader.string();
                    break;
                case /* string name */ 4:
                    message.name = reader.string();
                    break;
                case /* string _filename */ 5:
                    message.Filename = reader.string();
                    break;
                case /* bool _bundled */ 6:
                    message.Bundled = reader.bool();
                    break;
                case /* optional string description */ 101:
                    message.description = reader.string();
                    break;
                case /* optional string version */ 102:
                    message.version = reader.string();
                    break;
                case /* optional string url */ 103:
                    message.url = reader.string();
                    break;
                case /* optional int64 _created_at_unix_ts_ns_utc */ 1000:
                    message.CreatedAtUnixTsNsUtc = reader.int64().toString();
                    break;
                case /* optional int64 _updated_at_unix_ts_ns_utc */ 1001:
                    message.UpdatedAtUnixTsNsUtc = reader.int64().toString();
                    break;
                case /* optional string _created_by */ 1002:
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
        /* string id = 1; */
        if (message.id !== "")
            writer.tag(1, runtime_1.WireType.LengthDelimited).string(message.id);
        /* bytes bytes = 2; */
        if (message.bytes.length)
            writer.tag(2, runtime_1.WireType.LengthDelimited).bytes(message.bytes);
        /* string function = 3; */
        if (message.function !== "")
            writer.tag(3, runtime_1.WireType.LengthDelimited).string(message.function);
        /* string name = 4; */
        if (message.name !== "")
            writer.tag(4, runtime_1.WireType.LengthDelimited).string(message.name);
        /* string _filename = 5; */
        if (message.Filename !== "")
            writer.tag(5, runtime_1.WireType.LengthDelimited).string(message.Filename);
        /* bool _bundled = 6; */
        if (message.Bundled !== false)
            writer.tag(6, runtime_1.WireType.Varint).bool(message.Bundled);
        /* optional string description = 101; */
        if (message.description !== undefined)
            writer.tag(101, runtime_1.WireType.LengthDelimited).string(message.description);
        /* optional string version = 102; */
        if (message.version !== undefined)
            writer.tag(102, runtime_1.WireType.LengthDelimited).string(message.version);
        /* optional string url = 103; */
        if (message.url !== undefined)
            writer.tag(103, runtime_1.WireType.LengthDelimited).string(message.url);
        /* optional int64 _created_at_unix_ts_ns_utc = 1000; */
        if (message.CreatedAtUnixTsNsUtc !== undefined)
            writer.tag(1000, runtime_1.WireType.Varint).int64(message.CreatedAtUnixTsNsUtc);
        /* optional int64 _updated_at_unix_ts_ns_utc = 1001; */
        if (message.UpdatedAtUnixTsNsUtc !== undefined)
            writer.tag(1001, runtime_1.WireType.Varint).int64(message.UpdatedAtUnixTsNsUtc);
        /* optional string _created_by = 1002; */
        if (message.CreatedBy !== undefined)
            writer.tag(1002, runtime_1.WireType.LengthDelimited).string(message.CreatedBy);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.shared.WasmModule
 */
exports.WasmModule = new WasmModule$Type();
