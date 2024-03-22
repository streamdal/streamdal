"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DetectiveStepResult = exports.DetectiveStepResultMatch = exports.DetectiveStep = exports.DetectiveType = void 0;
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
     * @generated from protobuf enum value: DETECTIVE_TYPE_SEMVER = 1021;
     */
    DetectiveType[DetectiveType["SEMVER"] = 1021] = "SEMVER";
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
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_AWS_KEY_ID = 2017;
     */
    DetectiveType[DetectiveType["PII_AWS_KEY_ID"] = 2017] = "PII_AWS_KEY_ID";
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_RSA_KEY = 2018;
     */
    DetectiveType[DetectiveType["PII_RSA_KEY"] = 2018] = "PII_RSA_KEY";
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_TITLE = 2019;
     */
    DetectiveType[DetectiveType["PII_TITLE"] = 2019] = "PII_TITLE";
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_RELIGION = 2020;
     */
    DetectiveType[DetectiveType["PII_RELIGION"] = 2020] = "PII_RELIGION";
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_SLACK_TOKEN = 2021;
     */
    DetectiveType[DetectiveType["PII_SLACK_TOKEN"] = 2021] = "PII_SLACK_TOKEN";
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_STRIPE_KEY = 2022;
     */
    DetectiveType[DetectiveType["PII_STRIPE_KEY"] = 2022] = "PII_STRIPE_KEY";
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_IBAN = 2023;
     */
    DetectiveType[DetectiveType["PII_IBAN"] = 2023] = "PII_IBAN";
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_SWIFT_BIC = 2024;
     */
    DetectiveType[DetectiveType["PII_SWIFT_BIC"] = 2024] = "PII_SWIFT_BIC";
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_BANK_ROUTING_NUMBER = 2025;
     */
    DetectiveType[DetectiveType["PII_BANK_ROUTING_NUMBER"] = 2025] = "PII_BANK_ROUTING_NUMBER";
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_CRYPTO_ADDRESS = 2026;
     */
    DetectiveType[DetectiveType["PII_CRYPTO_ADDRESS"] = 2026] = "PII_CRYPTO_ADDRESS";
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_GITHUB_PAT = 2027;
     */
    DetectiveType[DetectiveType["PII_GITHUB_PAT"] = 2027] = "PII_GITHUB_PAT";
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_BRAINTREE_ACCESS_TOKEN = 2028;
     */
    DetectiveType[DetectiveType["PII_BRAINTREE_ACCESS_TOKEN"] = 2028] = "PII_BRAINTREE_ACCESS_TOKEN";
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_AWS_MWS_AUTH_TOKEN = 2029;
     */
    DetectiveType[DetectiveType["PII_AWS_MWS_AUTH_TOKEN"] = 2029] = "PII_AWS_MWS_AUTH_TOKEN";
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_DATABRICKS_PAT = 2030;
     */
    DetectiveType[DetectiveType["PII_DATABRICKS_PAT"] = 2030] = "PII_DATABRICKS_PAT";
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_SENDGRID_KEY = 2031;
     */
    DetectiveType[DetectiveType["PII_SENDGRID_KEY"] = 2031] = "PII_SENDGRID_KEY";
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_AZURE_SQL_CONN_STRING = 2032;
     */
    DetectiveType[DetectiveType["PII_AZURE_SQL_CONN_STRING"] = 2032] = "PII_AZURE_SQL_CONN_STRING";
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_JWT = 2033;
     */
    DetectiveType[DetectiveType["PII_JWT"] = 2033] = "PII_JWT";
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_DOCKER_SWARM_TOKEN = 2034;
     */
    DetectiveType[DetectiveType["PII_DOCKER_SWARM_TOKEN"] = 2034] = "PII_DOCKER_SWARM_TOKEN";
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_BEARER_TOKEN = 2035;
     */
    DetectiveType[DetectiveType["PII_BEARER_TOKEN"] = 2035] = "PII_BEARER_TOKEN";
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
// @generated message type with reflection information, may provide speed optimized methods
class DetectiveStepResultMatch$Type extends runtime_5.MessageType {
    constructor() {
        super("protos.steps.DetectiveStepResultMatch", [
            { no: 1, name: "type", kind: "enum", T: () => ["protos.steps.DetectiveType", DetectiveType, "DETECTIVE_TYPE_"] },
            { no: 2, name: "path", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 5, name: "value", kind: "scalar", T: 12 /*ScalarType.BYTES*/ }
        ]);
    }
    create(value) {
        const message = { type: 0, path: "", value: new Uint8Array(0) };
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
                case /* protos.steps.DetectiveType type */ 1:
                    message.type = reader.int32();
                    break;
                case /* string path */ 2:
                    message.path = reader.string();
                    break;
                case /* bytes value */ 5:
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
        /* protos.steps.DetectiveType type = 1; */
        if (message.type !== 0)
            writer.tag(1, runtime_1.WireType.Varint).int32(message.type);
        /* string path = 2; */
        if (message.path !== "")
            writer.tag(2, runtime_1.WireType.LengthDelimited).string(message.path);
        /* bytes value = 5; */
        if (message.value.length)
            writer.tag(5, runtime_1.WireType.LengthDelimited).bytes(message.value);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.steps.DetectiveStepResultMatch
 */
exports.DetectiveStepResultMatch = new DetectiveStepResultMatch$Type();
// @generated message type with reflection information, may provide speed optimized methods
class DetectiveStepResult$Type extends runtime_5.MessageType {
    constructor() {
        super("protos.steps.DetectiveStepResult", [
            { no: 1, name: "matches", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => exports.DetectiveStepResultMatch }
        ]);
    }
    create(value) {
        const message = { matches: [] };
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
                case /* repeated protos.steps.DetectiveStepResultMatch matches */ 1:
                    message.matches.push(exports.DetectiveStepResultMatch.internalBinaryRead(reader, reader.uint32(), options));
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
        /* repeated protos.steps.DetectiveStepResultMatch matches = 1; */
        for (let i = 0; i < message.matches.length; i++)
            exports.DetectiveStepResultMatch.internalBinaryWrite(message.matches[i], writer.tag(1, runtime_1.WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.steps.DetectiveStepResult
 */
exports.DetectiveStepResult = new DetectiveStepResult$Type();
