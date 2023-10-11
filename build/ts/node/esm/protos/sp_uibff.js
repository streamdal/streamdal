import { WireType } from "@protobuf-ts/runtime";
import { UnknownFieldHandler } from "@protobuf-ts/runtime";
import { reflectionMergePartial } from "@protobuf-ts/runtime";
import { MESSAGE_TYPE } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
/**
 * @generated from protobuf enum protos.RegistrationStatus.Status
 */
export var RegistrationStatus_Status;
(function (RegistrationStatus_Status) {
    /**
     * @generated from protobuf enum value: STATUS_UNSET = 0;
     */
    RegistrationStatus_Status[RegistrationStatus_Status["UNSET"] = 0] = "UNSET";
    /**
     * Submit means the user is not registered yet
     *
     * @generated from protobuf enum value: STATUS_SUBMIT = 1;
     */
    RegistrationStatus_Status[RegistrationStatus_Status["SUBMIT"] = 1] = "SUBMIT";
    /**
     * Verify means the user is registered but not verified yet
     *
     * @generated from protobuf enum value: STATUS_VERIFY = 2;
     */
    RegistrationStatus_Status[RegistrationStatus_Status["VERIFY"] = 2] = "VERIFY";
    /**
     * Done means the user is registered and verified
     *
     * @generated from protobuf enum value: STATUS_DONE = 3;
     */
    RegistrationStatus_Status[RegistrationStatus_Status["DONE"] = 3] = "DONE";
})(RegistrationStatus_Status || (RegistrationStatus_Status = {}));
// @generated message type with reflection information, may provide speed optimized methods
class RegistrationStatus$Type extends MessageType {
    constructor() {
        super("protos.RegistrationStatus", [
            { no: 1, name: "status", kind: "enum", T: () => ["protos.RegistrationStatus.Status", RegistrationStatus_Status, "STATUS_"] }
        ]);
    }
    create(value) {
        const message = { status: 0 };
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
                case /* protos.RegistrationStatus.Status status */ 1:
                    message.status = reader.int32();
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
    internalBinaryWrite(message, writer, options) {
        /* protos.RegistrationStatus.Status status = 1; */
        if (message.status !== 0)
            writer.tag(1, WireType.Varint).int32(message.status);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.RegistrationStatus
 */
export const RegistrationStatus = new RegistrationStatus$Type();
// @generated message type with reflection information, may provide speed optimized methods
class Registration$Type extends MessageType {
    constructor() {
        super("protos.Registration", [
            { no: 1, name: "email", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 100, name: "_code", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value) {
        const message = { email: "", Code: "" };
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
                case /* string email */ 1:
                    message.email = reader.string();
                    break;
                case /* string _code */ 100:
                    message.Code = reader.string();
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
    internalBinaryWrite(message, writer, options) {
        /* string email = 1; */
        if (message.email !== "")
            writer.tag(1, WireType.LengthDelimited).string(message.email);
        /* string _code = 100; */
        if (message.Code !== "")
            writer.tag(100, WireType.LengthDelimited).string(message.Code);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.Registration
 */
export const Registration = new Registration$Type();
// @generated message type with reflection information, may provide speed optimized methods
class Verify$Type extends MessageType {
    constructor() {
        super("protos.Verify", [
            { no: 1, name: "email", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "code", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value) {
        const message = { email: "", code: "" };
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
                case /* string email */ 1:
                    message.email = reader.string();
                    break;
                case /* string code */ 2:
                    message.code = reader.string();
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
    internalBinaryWrite(message, writer, options) {
        /* string email = 1; */
        if (message.email !== "")
            writer.tag(1, WireType.LengthDelimited).string(message.email);
        /* string code = 2; */
        if (message.code !== "")
            writer.tag(2, WireType.LengthDelimited).string(message.code);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.Verify
 */
export const Verify = new Verify$Type();
