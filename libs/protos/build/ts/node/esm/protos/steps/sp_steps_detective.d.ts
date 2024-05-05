import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
/**
 * @generated from protobuf message protos.steps.DetectiveStep
 */
export interface DetectiveStep {
    /**
     * @generated from protobuf field: optional string path = 1;
     */
    path?: string;
    /**
     * @generated from protobuf field: repeated string args = 2;
     */
    args: string[];
    /**
     * @generated from protobuf field: optional bool negate = 3;
     */
    negate?: boolean;
    /**
     * @generated from protobuf field: protos.steps.DetectiveType type = 4;
     */
    type: DetectiveType;
    /**
     * Only used if DetectiveType is set to DETECTIVE_TYPE_PII_KEYWORD
     *
     * @generated from protobuf field: optional protos.steps.DetectiveTypePIIKeywordMode pii_keyword_mode = 5;
     */
    piiKeywordMode?: DetectiveTypePIIKeywordMode;
}
/**
 * @generated from protobuf message protos.steps.DetectiveStepResultMatch
 */
export interface DetectiveStepResultMatch {
    /**
     * @generated from protobuf field: protos.steps.DetectiveType type = 1;
     */
    type: DetectiveType;
    /**
     * For JSON payloads, the path to the match
     *
     * @generated from protobuf field: string path = 2;
     */
    path: string;
    /**
     * Value of the match
     *
     * @generated from protobuf field: bytes value = 5;
     */
    value: Uint8Array;
    /**
     * Used to return the type of PII we detected.
     * This differs from `type` in that it is the type of PII we detected, not the type of match we used to detect it.
     * This value is freeform and determined based on the values inside the keyword matcher.
     *
     * @generated from protobuf field: string pii_type = 6;
     */
    piiType: string;
}
/**
 * @generated from protobuf message protos.steps.DetectiveStepResult
 */
export interface DetectiveStepResult {
    /**
     * @generated from protobuf field: repeated protos.steps.DetectiveStepResultMatch matches = 1;
     */
    matches: DetectiveStepResultMatch[];
}
/**
 * 1000-1999 reserved for core match types
 *
 * @generated from protobuf enum protos.steps.DetectiveType
 */
export declare enum DetectiveType {
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_UNKNOWN = 0;
     */
    UNKNOWN = 0,
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_IS_EMPTY = 1000;
     */
    IS_EMPTY = 1000,
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_HAS_FIELD = 1001;
     */
    HAS_FIELD = 1001,
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_IS_TYPE = 1002;
     */
    IS_TYPE = 1002,
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_STRING_CONTAINS_ANY = 1003;
     */
    STRING_CONTAINS_ANY = 1003,
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_STRING_CONTAINS_ALL = 1004;
     */
    STRING_CONTAINS_ALL = 1004,
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_STRING_EQUAL = 1005;
     */
    STRING_EQUAL = 1005,
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_IPV4_ADDRESS = 1006;
     */
    IPV4_ADDRESS = 1006,
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_IPV6_ADDRESS = 1007;
     */
    IPV6_ADDRESS = 1007,
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_MAC_ADDRESS = 1008;
     */
    MAC_ADDRESS = 1008,
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_REGEX = 1009;
     */
    REGEX = 1009,
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_TIMESTAMP_RFC3339 = 1010;
     */
    TIMESTAMP_RFC3339 = 1010,
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_TIMESTAMP_UNIX_NANO = 1011;
     */
    TIMESTAMP_UNIX_NANO = 1011,
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_TIMESTAMP_UNIX = 1012;
     */
    TIMESTAMP_UNIX = 1012,
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_BOOLEAN_TRUE = 1013;
     */
    BOOLEAN_TRUE = 1013,
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_BOOLEAN_FALSE = 1014;
     */
    BOOLEAN_FALSE = 1014,
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_UUID = 1015;
     */
    UUID = 1015,
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_URL = 1016;
     */
    URL = 1016,
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_HOSTNAME = 1017;
     */
    HOSTNAME = 1017,
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_STRING_LENGTH_MIN = 1018;
     */
    STRING_LENGTH_MIN = 1018,
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_STRING_LENGTH_MAX = 1019;
     */
    STRING_LENGTH_MAX = 1019,
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_STRING_LENGTH_RANGE = 1020;
     */
    STRING_LENGTH_RANGE = 1020,
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_SEMVER = 1021;
     */
    SEMVER = 1021,
    /**
     * / Payloads containing values with any PII - runs all PII matchers
     *
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_ANY = 2000;
     */
    PII_ANY = 2000,
    /**
     * Payloads containing values with a credit card number
     *
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_CREDIT_CARD = 2001;
     */
    PII_CREDIT_CARD = 2001,
    /**
     * Payloads containing values with a social security number
     *
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_SSN = 2002;
     */
    PII_SSN = 2002,
    /**
     * Payloads containing values with an email address
     *
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_EMAIL = 2003;
     */
    PII_EMAIL = 2003,
    /**
     * Payloads containing values with a phone number
     *
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_PHONE = 2004;
     */
    PII_PHONE = 2004,
    /**
     * Payloads containing values with a driver's license
     *
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_DRIVER_LICENSE = 2005;
     */
    PII_DRIVER_LICENSE = 2005,
    /**
     * Payloads containing values with a passport ID
     *
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_PASSPORT_ID = 2006;
     */
    PII_PASSPORT_ID = 2006,
    /**
     * Payloads containing values with a VIN number
     *
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_VIN_NUMBER = 2007;
     */
    PII_VIN_NUMBER = 2007,
    /**
     * Payloads containing values with various serial number formats
     *
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_SERIAL_NUMBER = 2008;
     */
    PII_SERIAL_NUMBER = 2008,
    /**
     * Payloads containing fields named "login", "username", "user", "userid", "user_id", "user", "password", "pass", "passwd", "pwd"
     *
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_LOGIN = 2009;
     */
    PII_LOGIN = 2009,
    /**
     * Payloads containing fields named "taxpayer_id", "tax_id", "taxpayerid", "taxid"
     *
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_TAXPAYER_ID = 2010;
     */
    PII_TAXPAYER_ID = 2010,
    /**
     * Payloads containing fields named "address", "street", "city", "state", "zip", "zipcode", "zip_code", "country"
     *
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_ADDRESS = 2011;
     */
    PII_ADDRESS = 2011,
    /**
     * Payloads containing fields named "signature", "signature_image", "signature_image_url", "signature_image_uri"
     *
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_SIGNATURE = 2012;
     */
    PII_SIGNATURE = 2012,
    /**
     * Payloads containing values that contain GPS data or coordinates like "lat", "lon", "latitude", "longitude"
     *
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_GEOLOCATION = 2013;
     */
    PII_GEOLOCATION = 2013,
    /**
     * Payloads containing fields like "school", "university", "college", "education"
     *
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_EDUCATION = 2014;
     */
    PII_EDUCATION = 2014,
    /**
     * Payloads containing fields like "account", "bank", "credit", "debit", "financial", "finance"
     *
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_FINANCIAL = 2015;
     */
    PII_FINANCIAL = 2015,
    /**
     * Payloads containing fields like "patient", "health", "healthcare", "health care", "medical"
     *
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_HEALTH = 2016;
     */
    PII_HEALTH = 2016,
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_AWS_KEY_ID = 2017;
     */
    PII_AWS_KEY_ID = 2017,
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_RSA_KEY = 2018;
     */
    PII_RSA_KEY = 2018,
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_TITLE = 2019;
     */
    PII_TITLE = 2019,
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_RELIGION = 2020;
     */
    PII_RELIGION = 2020,
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_SLACK_TOKEN = 2021;
     */
    PII_SLACK_TOKEN = 2021,
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_STRIPE_KEY = 2022;
     */
    PII_STRIPE_KEY = 2022,
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_IBAN = 2023;
     */
    PII_IBAN = 2023,
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_SWIFT_BIC = 2024;
     */
    PII_SWIFT_BIC = 2024,
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_BANK_ROUTING_NUMBER = 2025;
     */
    PII_BANK_ROUTING_NUMBER = 2025,
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_CRYPTO_ADDRESS = 2026;
     */
    PII_CRYPTO_ADDRESS = 2026,
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_GITHUB_PAT = 2027;
     */
    PII_GITHUB_PAT = 2027,
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_BRAINTREE_ACCESS_TOKEN = 2028;
     */
    PII_BRAINTREE_ACCESS_TOKEN = 2028,
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_AWS_MWS_AUTH_TOKEN = 2029;
     */
    PII_AWS_MWS_AUTH_TOKEN = 2029,
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_DATABRICKS_PAT = 2030;
     */
    PII_DATABRICKS_PAT = 2030,
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_SENDGRID_KEY = 2031;
     */
    PII_SENDGRID_KEY = 2031,
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_AZURE_SQL_CONN_STRING = 2032;
     */
    PII_AZURE_SQL_CONN_STRING = 2032,
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_JWT = 2033;
     */
    PII_JWT = 2033,
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_DOCKER_SWARM_TOKEN = 2034;
     */
    PII_DOCKER_SWARM_TOKEN = 2034,
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_BEARER_TOKEN = 2035;
     */
    PII_BEARER_TOKEN = 2035,
    /**
     * Uses field/path keyword matching to detect PII, rather than the field's value
     *
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_KEYWORD = 2036;
     */
    PII_KEYWORD = 2036,
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_NUMERIC_EQUAL_TO = 3000;
     */
    NUMERIC_EQUAL_TO = 3000,
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_NUMERIC_GREATER_THAN = 3001;
     */
    NUMERIC_GREATER_THAN = 3001,
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_NUMERIC_GREATER_EQUAL = 3002;
     */
    NUMERIC_GREATER_EQUAL = 3002,
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_NUMERIC_LESS_THAN = 3003;
     */
    NUMERIC_LESS_THAN = 3003,
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_NUMERIC_LESS_EQUAL = 3004;
     */
    NUMERIC_LESS_EQUAL = 3004,
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_NUMERIC_RANGE = 3005;
     */
    NUMERIC_RANGE = 3005,
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_NUMERIC_MIN = 3006;
     */
    NUMERIC_MIN = 3006,
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_NUMERIC_MAX = 3007;
     */
    NUMERIC_MAX = 3007
}
/**
 * DetectiveTypePIIKeywordMode is used by Wasm to determine what method to use
 * when performing keyword matching. Performance == hashmap lookups;
 * accuracy == hashmap lookups and "string contains".
 * protolint:disable:next ENUM_FIELD_NAMES_PREFIX
 *
 * @generated from protobuf enum protos.steps.DetectiveTypePIIKeywordMode
 */
export declare enum DetectiveTypePIIKeywordMode {
    /**
     * default "performance"
     *
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_KEYWORD_MODE_UNSET = 0;
     */
    DETECTIVE_TYPE_PII_KEYWORD_MODE_UNSET = 0,
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_KEYWORD_MODE_PERFORMANCE = 1;
     */
    DETECTIVE_TYPE_PII_KEYWORD_MODE_PERFORMANCE = 1,
    /**
     * @generated from protobuf enum value: DETECTIVE_TYPE_PII_KEYWORD_MODE_ACCURACY = 2;
     */
    DETECTIVE_TYPE_PII_KEYWORD_MODE_ACCURACY = 2
}
declare class DetectiveStep$Type extends MessageType<DetectiveStep> {
    constructor();
    create(value?: PartialMessage<DetectiveStep>): DetectiveStep;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: DetectiveStep): DetectiveStep;
    internalBinaryWrite(message: DetectiveStep, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.steps.DetectiveStep
 */
export declare const DetectiveStep: DetectiveStep$Type;
declare class DetectiveStepResultMatch$Type extends MessageType<DetectiveStepResultMatch> {
    constructor();
    create(value?: PartialMessage<DetectiveStepResultMatch>): DetectiveStepResultMatch;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: DetectiveStepResultMatch): DetectiveStepResultMatch;
    internalBinaryWrite(message: DetectiveStepResultMatch, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.steps.DetectiveStepResultMatch
 */
export declare const DetectiveStepResultMatch: DetectiveStepResultMatch$Type;
declare class DetectiveStepResult$Type extends MessageType<DetectiveStepResult> {
    constructor();
    create(value?: PartialMessage<DetectiveStepResult>): DetectiveStepResult;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: DetectiveStepResult): DetectiveStepResult;
    internalBinaryWrite(message: DetectiveStepResult, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.steps.DetectiveStepResult
 */
export declare const DetectiveStepResult: DetectiveStepResult$Type;
export {};
