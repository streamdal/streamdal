"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DetectiveStep = exports.DetectiveType = void 0;
const runtime_1 = require("@protobuf-ts/runtime");
const runtime_2 = require("@protobuf-ts/runtime");
const runtime_3 = require("@protobuf-ts/runtime");
const runtime_4 = require("@protobuf-ts/runtime");
const runtime_5 = require("@protobuf-ts/runtime");
/**
 * 1000-1999 reserved for core match types
 *
 * @generated from protobuf enum protos.steps.DetectiveType
 */
var DetectiveType;
(function (DetectiveType) {
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_UNKNOWN = 0;
     */
    DetectiveType[DetectiveType["UNKNOWN"] = 0] = "UNKNOWN";
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_IS_EMPTY = 1000;
     */
    DetectiveType[DetectiveType["IS_EMPTY"] = 1000] = "IS_EMPTY";
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_HAS_FIELD = 1001;
     */
    DetectiveType[DetectiveType["HAS_FIELD"] = 1001] = "HAS_FIELD";
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_IS_TYPE = 1002;
     */
    DetectiveType[DetectiveType["IS_TYPE"] = 1002] = "IS_TYPE";
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_STRING_CONTAINS_ANY = 1003;
     */
    DetectiveType[DetectiveType["STRING_CONTAINS_ANY"] = 1003] = "STRING_CONTAINS_ANY";
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_STRING_CONTAINS_ALL = 1004;
     */
    DetectiveType[DetectiveType["STRING_CONTAINS_ALL"] = 1004] = "STRING_CONTAINS_ALL";
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_STRING_EQUAL = 1005;
     */
    DetectiveType[DetectiveType["STRING_EQUAL"] = 1005] = "STRING_EQUAL";
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_IPV4_ADDRESS = 1006;
     */
    DetectiveType[DetectiveType["IPV4_ADDRESS"] = 1006] = "IPV4_ADDRESS";
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_IPV6_ADDRESS = 1007;
     */
    DetectiveType[DetectiveType["IPV6_ADDRESS"] = 1007] = "IPV6_ADDRESS";
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_MAC_ADDRESS = 1008;
     */
    DetectiveType[DetectiveType["MAC_ADDRESS"] = 1008] = "MAC_ADDRESS";
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_REGEX = 1009;
     */
    DetectiveType[DetectiveType["REGEX"] = 1009] = "REGEX";
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_TIMESTAMP_RFC3339 = 1010;
     */
    DetectiveType[DetectiveType["TIMESTAMP_RFC3339"] = 1010] = "TIMESTAMP_RFC3339";
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_TIMESTAMP_UNIX_NANO = 1011;
     */
    DetectiveType[DetectiveType["TIMESTAMP_UNIX_NANO"] = 1011] = "TIMESTAMP_UNIX_NANO";
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_TIMESTAMP_UNIX = 1012;
     */
    DetectiveType[DetectiveType["TIMESTAMP_UNIX"] = 1012] = "TIMESTAMP_UNIX";
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_BOOLEAN_TRUE = 1013;
     */
    DetectiveType[DetectiveType["BOOLEAN_TRUE"] = 1013] = "BOOLEAN_TRUE";
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_BOOLEAN_FALSE = 1014;
     */
    DetectiveType[DetectiveType["BOOLEAN_FALSE"] = 1014] = "BOOLEAN_FALSE";
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_UUID = 1015;
     */
    DetectiveType[DetectiveType["UUID"] = 1015] = "UUID";
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_URL = 1016;
     */
    DetectiveType[DetectiveType["URL"] = 1016] = "URL";
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_HOSTNAME = 1017;
     */
    DetectiveType[DetectiveType["HOSTNAME"] = 1017] = "HOSTNAME";
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_STRING_LENGTH_MIN = 1018;
     */
    DetectiveType[DetectiveType["STRING_LENGTH_MIN"] = 1018] = "STRING_LENGTH_MIN";
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_STRING_LENGTH_MAX = 1019;
     */
    DetectiveType[DetectiveType["STRING_LENGTH_MAX"] = 1019] = "STRING_LENGTH_MAX";
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_STRING_LENGTH_RANGE = 1020;
     */
    DetectiveType[DetectiveType["STRING_LENGTH_RANGE"] = 1020] = "STRING_LENGTH_RANGE";
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_SEMVER = 2021;
     */
    DetectiveType[DetectiveType["SEMVER"] = 2021] = "SEMVER";
    /**
     * / Payloads containing values with any PII - runs all PII matchers
     *
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_ANY = 2000;
     */
    DetectiveType[DetectiveType["PII_ANY"] = 2000] = "PII_ANY";
    /**
     * Payloads containing values with a credit card number
     *
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_CREDIT_CARD = 2001;
     */
    DetectiveType[DetectiveType["PII_CREDIT_CARD"] = 2001] = "PII_CREDIT_CARD";
    /**
     * Payloads containing values with a social security number
     *
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_SSN = 2002;
     */
    DetectiveType[DetectiveType["PII_SSN"] = 2002] = "PII_SSN";
    /**
     * Payloads containing values with an email address
     *
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_EMAIL = 2003;
     */
    DetectiveType[DetectiveType["PII_EMAIL"] = 2003] = "PII_EMAIL";
    /**
     * Payloads containing values with a phone number
     *
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_PHONE = 2004;
     */
    DetectiveType[DetectiveType["PII_PHONE"] = 2004] = "PII_PHONE";
    /**
     * Payloads containing values with a driver's license
     *
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_DRIVER_LICENSE = 2005;
     */
    DetectiveType[DetectiveType["PII_DRIVER_LICENSE"] = 2005] = "PII_DRIVER_LICENSE";
    /**
     * Payloads containing values with a passport ID
     *
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_PASSPORT_ID = 2006;
     */
    DetectiveType[DetectiveType["PII_PASSPORT_ID"] = 2006] = "PII_PASSPORT_ID";
    /**
     * Payloads containing values with a VIN number
     *
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_VIN_NUMBER = 2007;
     */
    DetectiveType[DetectiveType["PII_VIN_NUMBER"] = 2007] = "PII_VIN_NUMBER";
    /**
     * Payloads containing values with various serial number formats
     *
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_SERIAL_NUMBER = 2008;
     */
    DetectiveType[DetectiveType["PII_SERIAL_NUMBER"] = 2008] = "PII_SERIAL_NUMBER";
    /**
     * Payloads containing fields named "login", "username", "user", "userid", "user_id", "user", "password", "pass", "passwd", "pwd"
     *
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_LOGIN = 2009;
     */
    DetectiveType[DetectiveType["PII_LOGIN"] = 2009] = "PII_LOGIN";
    /**
     * Payloads containing fields named "taxpayer_id", "tax_id", "taxpayerid", "taxid"
     *
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_TAXPAYER_ID = 2010;
     */
    DetectiveType[DetectiveType["PII_TAXPAYER_ID"] = 2010] = "PII_TAXPAYER_ID";
    /**
     * Payloads containing fields named "address", "street", "city", "state", "zip", "zipcode", "zip_code", "country"
     *
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_ADDRESS = 2011;
     */
    DetectiveType[DetectiveType["PII_ADDRESS"] = 2011] = "PII_ADDRESS";
    /**
     * Payloads containing fields named "signature", "signature_image", "signature_image_url", "signature_image_uri"
     *
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_SIGNATURE = 2012;
     */
    DetectiveType[DetectiveType["PII_SIGNATURE"] = 2012] = "PII_SIGNATURE";
    /**
     * Payloads containing values that contain GPS data or coordinates like "lat", "lon", "latitude", "longitude"
     *
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_GEOLOCATION = 2013;
     */
    DetectiveType[DetectiveType["PII_GEOLOCATION"] = 2013] = "PII_GEOLOCATION";
    /**
     * Payloads containing fields like "school", "university", "college", "education"
     *
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_EDUCATION = 2014;
     */
    DetectiveType[DetectiveType["PII_EDUCATION"] = 2014] = "PII_EDUCATION";
    /**
     * Payloads containing fields like "account", "bank", "credit", "debit", "financial", "finance"
     *
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_FINANCIAL = 2015;
     */
    DetectiveType[DetectiveType["PII_FINANCIAL"] = 2015] = "PII_FINANCIAL";
    /**
     * Payloads containing fields like "patient", "health", "healthcare", "health care", "medical"
     *
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_HEALTH = 2016;
     */
    DetectiveType[DetectiveType["PII_HEALTH"] = 2016] = "PII_HEALTH";
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_NUMERIC_EQUAL_TO = 3000;
     */
    DetectiveType[DetectiveType["NUMERIC_EQUAL_TO"] = 3000] = "NUMERIC_EQUAL_TO";
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_NUMERIC_GREATER_THAN = 3001;
     */
    DetectiveType[DetectiveType["NUMERIC_GREATER_THAN"] = 3001] = "NUMERIC_GREATER_THAN";
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_NUMERIC_GREATER_EQUAL = 3002;
     */
    DetectiveType[DetectiveType["NUMERIC_GREATER_EQUAL"] = 3002] = "NUMERIC_GREATER_EQUAL";
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_NUMERIC_LESS_THAN = 3003;
     */
    DetectiveType[DetectiveType["NUMERIC_LESS_THAN"] = 3003] = "NUMERIC_LESS_THAN";
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_NUMERIC_LESS_EQUAL = 3004;
     */
    DetectiveType[DetectiveType["NUMERIC_LESS_EQUAL"] = 3004] = "NUMERIC_LESS_EQUAL";
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_NUMERIC_RANGE = 3005;
     */
    DetectiveType[DetectiveType["NUMERIC_RANGE"] = 3005] = "NUMERIC_RANGE";
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_NUMERIC_MIN = 3006;
     */
    DetectiveType[DetectiveType["NUMERIC_MIN"] = 3006] = "NUMERIC_MIN";
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_NUMERIC_MAX = 3007;
     */
    DetectiveType[DetectiveType["NUMERIC_MAX"] = 3007] = "NUMERIC_MAX";
})(DetectiveType || (exports.DetectiveType = DetectiveType = {}));
// @generated message type with reflection information, may provide speed optimized methods
class DetectiveStep$Type extends runtime_5.MessageType {
    constructor() {
        super("protos.steps.DetectiveStep", [
            { no: 1, name: "path", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "args", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
            { no: 3, name: "negate", kind: "scalar", opt: true, T: 8 /*ScalarType.BOOL*/ },
            { no: 4, name: "type", kind: "enum", T: () => ["protos.steps.DetectiveType", DetectiveType, "DETECTIVE_TYPE_"] }
        ]);
    }
    create(value) {
        const message = { args: [], type: 0 };
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
                case /* optional string path */ 1:
                    message.path = reader.string();
                    break;
                case /* repeated string args */ 2:
                    message.args.push(reader.string());
                    break;
                case /* optional bool negate */ 3:
                    message.negate = reader.bool();
                    break;
                case /* protos.steps.DetectiveType type */ 4:
                    message.type = reader.int32();
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
        /* optional string path = 1; */
        if (message.path !== undefined)
            writer.tag(1, runtime_1.WireType.LengthDelimited).string(message.path);
        /* repeated string args = 2; */
        for (let i = 0; i < message.args.length; i++)
            writer.tag(2, runtime_1.WireType.LengthDelimited).string(message.args[i]);
        /* optional bool negate = 3; */
        if (message.negate !== undefined)
            writer.tag(3, runtime_1.WireType.Varint).bool(message.negate);
        /* protos.steps.DetectiveType type = 4; */
        if (message.type !== 0)
            writer.tag(4, runtime_1.WireType.Varint).int32(message.type);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.steps.DetectiveStep
 */
exports.DetectiveStep = new DetectiveStep$Type();
