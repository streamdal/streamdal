import { WireType } from "@protobuf-ts/runtime";
import { UnknownFieldHandler } from "@protobuf-ts/runtime";
import { reflectionMergePartial } from "@protobuf-ts/runtime";
import { MESSAGE_TYPE } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
/**
 * KVAction is a shared type that is used for protos.KVCommand and protos.KVStep.
 * Note that only a subset of actions are used for protos.KVCommand (CREATE,
 * UPDATE, DELETE, DELETE_ALL) while protos.KVStep uses most of them.
 *
 * protolint:disable:next ENUM_FIELD_NAMES_PREFIX
 *
 * @generated from protobuf enum protos.shared.KVAction
 */
export var KVAction;
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
})(KVAction || (KVAction = {}));
// @generated message type with reflection information, may provide speed optimized methods
class WasmModule$Type extends MessageType {
    constructor() {
        super("protos.shared.WasmModule", [
            { no: 1, name: "id", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "bytes", kind: "scalar", T: 12 /*ScalarType.BYTES*/ },
            { no: 3, name: "function", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 4, name: "name", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 5, name: "_filename", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 6, name: "_bundled", kind: "scalar", T: 8 /*ScalarType.BOOL*/ },
            { no: 7, name: "precompiled", kind: "map", K: 9 /*ScalarType.STRING*/, V: { kind: "scalar", T: 12 /*ScalarType.BYTES*/ } },
            { no: 101, name: "description", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 102, name: "version", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 103, name: "url", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 1000, name: "_created_at_unix_ts_ns_utc", kind: "scalar", opt: true, T: 3 /*ScalarType.INT64*/ },
            { no: 1001, name: "_updated_at_unix_ts_ns_utc", kind: "scalar", opt: true, T: 3 /*ScalarType.INT64*/ },
            { no: 1002, name: "_created_by", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value) {
        const message = { id: "", bytes: new Uint8Array(0), function: "", name: "", Filename: "", Bundled: false, precompiled: {} };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial(this, message, value);
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
                case /* map<string, bytes> precompiled */ 7:
                    this.binaryReadMap7(message.precompiled, reader, options);
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
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    binaryReadMap7(map, reader, options) {
        let len = reader.uint32(), end = reader.pos + len, key, val;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case 1:
                    key = reader.string();
                    break;
                case 2:
                    val = reader.bytes();
                    break;
                default: throw new globalThis.Error("unknown map entry field for field protos.shared.WasmModule.precompiled");
            }
        }
        map[key !== null && key !== void 0 ? key : ""] = val !== null && val !== void 0 ? val : new Uint8Array(0);
    }
    internalBinaryWrite(message, writer, options) {
        /* string id = 1; */
        if (message.id !== "")
            writer.tag(1, WireType.LengthDelimited).string(message.id);
        /* bytes bytes = 2; */
        if (message.bytes.length)
            writer.tag(2, WireType.LengthDelimited).bytes(message.bytes);
        /* string function = 3; */
        if (message.function !== "")
            writer.tag(3, WireType.LengthDelimited).string(message.function);
        /* string name = 4; */
        if (message.name !== "")
            writer.tag(4, WireType.LengthDelimited).string(message.name);
        /* string _filename = 5; */
        if (message.Filename !== "")
            writer.tag(5, WireType.LengthDelimited).string(message.Filename);
        /* bool _bundled = 6; */
        if (message.Bundled !== false)
            writer.tag(6, WireType.Varint).bool(message.Bundled);
        /* map<string, bytes> precompiled = 7; */
        for (let k of Object.keys(message.precompiled))
            writer.tag(7, WireType.LengthDelimited).fork().tag(1, WireType.LengthDelimited).string(k).tag(2, WireType.LengthDelimited).bytes(message.precompiled[k]).join();
        /* optional string description = 101; */
        if (message.description !== undefined)
            writer.tag(101, WireType.LengthDelimited).string(message.description);
        /* optional string version = 102; */
        if (message.version !== undefined)
            writer.tag(102, WireType.LengthDelimited).string(message.version);
        /* optional string url = 103; */
        if (message.url !== undefined)
            writer.tag(103, WireType.LengthDelimited).string(message.url);
        /* optional int64 _created_at_unix_ts_ns_utc = 1000; */
        if (message.CreatedAtUnixTsNsUtc !== undefined)
            writer.tag(1000, WireType.Varint).int64(message.CreatedAtUnixTsNsUtc);
        /* optional int64 _updated_at_unix_ts_ns_utc = 1001; */
        if (message.UpdatedAtUnixTsNsUtc !== undefined)
            writer.tag(1001, WireType.Varint).int64(message.UpdatedAtUnixTsNsUtc);
        /* optional string _created_by = 1002; */
        if (message.CreatedBy !== undefined)
            writer.tag(1002, WireType.LengthDelimited).string(message.CreatedBy);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.shared.WasmModule
 */
export const WasmModule = new WasmModule$Type();
