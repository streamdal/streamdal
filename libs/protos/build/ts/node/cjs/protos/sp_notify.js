"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationPagerDuty = exports.NotificationEmailSES = exports.NotificationEmailSMTP = exports.NotificationEmail = exports.NotificationSlack = exports.NotificationConfig = exports.NotificationType = exports.NotificationPagerDuty_Urgency = exports.NotificationEmail_Type = void 0;
const runtime_1 = require("@protobuf-ts/runtime");
const runtime_2 = require("@protobuf-ts/runtime");
const runtime_3 = require("@protobuf-ts/runtime");
const runtime_4 = require("@protobuf-ts/runtime");
const runtime_5 = require("@protobuf-ts/runtime");
/**
 * @generated from protobuf enum protos.NotificationEmail.Type
 */
var NotificationEmail_Type;
(function (NotificationEmail_Type) {
    /**
     * @generated from protobuf enum value: TYPE_UNSET = 0;
     */
    NotificationEmail_Type[NotificationEmail_Type["UNSET"] = 0] = "UNSET";
    /**
     * @generated from protobuf enum value: TYPE_SMTP = 1;
     */
    NotificationEmail_Type[NotificationEmail_Type["SMTP"] = 1] = "SMTP";
    /**
     * @generated from protobuf enum value: TYPE_SES = 2;
     */
    NotificationEmail_Type[NotificationEmail_Type["SES"] = 2] = "SES";
})(NotificationEmail_Type || (exports.NotificationEmail_Type = NotificationEmail_Type = {}));
/**
 * @generated from protobuf enum protos.NotificationPagerDuty.Urgency
 */
var NotificationPagerDuty_Urgency;
(function (NotificationPagerDuty_Urgency) {
    /**
     * @generated from protobuf enum value: URGENCY_UNSET = 0;
     */
    NotificationPagerDuty_Urgency[NotificationPagerDuty_Urgency["UNSET"] = 0] = "UNSET";
    /**
     * @generated from protobuf enum value: URGENCY_LOW = 1;
     */
    NotificationPagerDuty_Urgency[NotificationPagerDuty_Urgency["LOW"] = 1] = "LOW";
    /**
     * @generated from protobuf enum value: URGENCY_HIGH = 2;
     */
    NotificationPagerDuty_Urgency[NotificationPagerDuty_Urgency["HIGH"] = 2] = "HIGH";
})(NotificationPagerDuty_Urgency || (exports.NotificationPagerDuty_Urgency = NotificationPagerDuty_Urgency = {}));
/**
 * @generated from protobuf enum protos.NotificationType
 */
var NotificationType;
(function (NotificationType) {
    /**
     * @generated from protobuf enum value: NOTIFICATION_TYPE_UNSET = 0;
     */
    NotificationType[NotificationType["UNSET"] = 0] = "UNSET";
    /**
     * @generated from protobuf enum value: NOTIFICATION_TYPE_SLACK = 1;
     */
    NotificationType[NotificationType["SLACK"] = 1] = "SLACK";
    /**
     * @generated from protobuf enum value: NOTIFICATION_TYPE_EMAIL = 2;
     */
    NotificationType[NotificationType["EMAIL"] = 2] = "EMAIL";
    /**
     * @generated from protobuf enum value: NOTIFICATION_TYPE_PAGERDUTY = 3;
     */
    NotificationType[NotificationType["PAGERDUTY"] = 3] = "PAGERDUTY";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
// @generated message type with reflection information, may provide speed optimized methods
class NotificationConfig$Type extends runtime_5.MessageType {
    constructor() {
        super("protos.NotificationConfig", [
            { no: 1, name: "id", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "name", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 3, name: "type", kind: "enum", T: () => ["protos.NotificationType", NotificationType, "NOTIFICATION_TYPE_"] },
            { no: 1000, name: "slack", kind: "message", oneof: "config", T: () => exports.NotificationSlack },
            { no: 1001, name: "email", kind: "message", oneof: "config", T: () => exports.NotificationEmail },
            { no: 1002, name: "pagerduty", kind: "message", oneof: "config", T: () => exports.NotificationPagerDuty },
            { no: 10000, name: "_created_by", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value) {
        const message = { name: "", type: 0, config: { oneofKind: undefined } };
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
                case /* optional string id */ 1:
                    message.id = reader.string();
                    break;
                case /* string name */ 2:
                    message.name = reader.string();
                    break;
                case /* protos.NotificationType type */ 3:
                    message.type = reader.int32();
                    break;
                case /* protos.NotificationSlack slack */ 1000:
                    message.config = {
                        oneofKind: "slack",
                        slack: exports.NotificationSlack.internalBinaryRead(reader, reader.uint32(), options, message.config.slack)
                    };
                    break;
                case /* protos.NotificationEmail email */ 1001:
                    message.config = {
                        oneofKind: "email",
                        email: exports.NotificationEmail.internalBinaryRead(reader, reader.uint32(), options, message.config.email)
                    };
                    break;
                case /* protos.NotificationPagerDuty pagerduty */ 1002:
                    message.config = {
                        oneofKind: "pagerduty",
                        pagerduty: exports.NotificationPagerDuty.internalBinaryRead(reader, reader.uint32(), options, message.config.pagerduty)
                    };
                    break;
                case /* optional string _created_by */ 10000:
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
        /* optional string id = 1; */
        if (message.id !== undefined)
            writer.tag(1, runtime_1.WireType.LengthDelimited).string(message.id);
        /* string name = 2; */
        if (message.name !== "")
            writer.tag(2, runtime_1.WireType.LengthDelimited).string(message.name);
        /* protos.NotificationType type = 3; */
        if (message.type !== 0)
            writer.tag(3, runtime_1.WireType.Varint).int32(message.type);
        /* protos.NotificationSlack slack = 1000; */
        if (message.config.oneofKind === "slack")
            exports.NotificationSlack.internalBinaryWrite(message.config.slack, writer.tag(1000, runtime_1.WireType.LengthDelimited).fork(), options).join();
        /* protos.NotificationEmail email = 1001; */
        if (message.config.oneofKind === "email")
            exports.NotificationEmail.internalBinaryWrite(message.config.email, writer.tag(1001, runtime_1.WireType.LengthDelimited).fork(), options).join();
        /* protos.NotificationPagerDuty pagerduty = 1002; */
        if (message.config.oneofKind === "pagerduty")
            exports.NotificationPagerDuty.internalBinaryWrite(message.config.pagerduty, writer.tag(1002, runtime_1.WireType.LengthDelimited).fork(), options).join();
        /* optional string _created_by = 10000; */
        if (message.CreatedBy !== undefined)
            writer.tag(10000, runtime_1.WireType.LengthDelimited).string(message.CreatedBy);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.NotificationConfig
 */
exports.NotificationConfig = new NotificationConfig$Type();
// @generated message type with reflection information, may provide speed optimized methods
class NotificationSlack$Type extends runtime_5.MessageType {
    constructor() {
        super("protos.NotificationSlack", [
            { no: 1, name: "bot_token", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "channel", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value) {
        const message = { botToken: "", channel: "" };
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
                case /* string bot_token */ 1:
                    message.botToken = reader.string();
                    break;
                case /* string channel */ 2:
                    message.channel = reader.string();
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
        /* string bot_token = 1; */
        if (message.botToken !== "")
            writer.tag(1, runtime_1.WireType.LengthDelimited).string(message.botToken);
        /* string channel = 2; */
        if (message.channel !== "")
            writer.tag(2, runtime_1.WireType.LengthDelimited).string(message.channel);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.NotificationSlack
 */
exports.NotificationSlack = new NotificationSlack$Type();
// @generated message type with reflection information, may provide speed optimized methods
class NotificationEmail$Type extends runtime_5.MessageType {
    constructor() {
        super("protos.NotificationEmail", [
            { no: 1, name: "type", kind: "enum", T: () => ["protos.NotificationEmail.Type", NotificationEmail_Type, "TYPE_"] },
            { no: 2, name: "recipients", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
            { no: 3, name: "from_address", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 1000, name: "smtp", kind: "message", oneof: "config", T: () => exports.NotificationEmailSMTP },
            { no: 1001, name: "ses", kind: "message", oneof: "config", T: () => exports.NotificationEmailSES }
        ]);
    }
    create(value) {
        const message = { type: 0, recipients: [], fromAddress: "", config: { oneofKind: undefined } };
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
                case /* protos.NotificationEmail.Type type */ 1:
                    message.type = reader.int32();
                    break;
                case /* repeated string recipients */ 2:
                    message.recipients.push(reader.string());
                    break;
                case /* string from_address */ 3:
                    message.fromAddress = reader.string();
                    break;
                case /* protos.NotificationEmailSMTP smtp */ 1000:
                    message.config = {
                        oneofKind: "smtp",
                        smtp: exports.NotificationEmailSMTP.internalBinaryRead(reader, reader.uint32(), options, message.config.smtp)
                    };
                    break;
                case /* protos.NotificationEmailSES ses */ 1001:
                    message.config = {
                        oneofKind: "ses",
                        ses: exports.NotificationEmailSES.internalBinaryRead(reader, reader.uint32(), options, message.config.ses)
                    };
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
        /* protos.NotificationEmail.Type type = 1; */
        if (message.type !== 0)
            writer.tag(1, runtime_1.WireType.Varint).int32(message.type);
        /* repeated string recipients = 2; */
        for (let i = 0; i < message.recipients.length; i++)
            writer.tag(2, runtime_1.WireType.LengthDelimited).string(message.recipients[i]);
        /* string from_address = 3; */
        if (message.fromAddress !== "")
            writer.tag(3, runtime_1.WireType.LengthDelimited).string(message.fromAddress);
        /* protos.NotificationEmailSMTP smtp = 1000; */
        if (message.config.oneofKind === "smtp")
            exports.NotificationEmailSMTP.internalBinaryWrite(message.config.smtp, writer.tag(1000, runtime_1.WireType.LengthDelimited).fork(), options).join();
        /* protos.NotificationEmailSES ses = 1001; */
        if (message.config.oneofKind === "ses")
            exports.NotificationEmailSES.internalBinaryWrite(message.config.ses, writer.tag(1001, runtime_1.WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.NotificationEmail
 */
exports.NotificationEmail = new NotificationEmail$Type();
// @generated message type with reflection information, may provide speed optimized methods
class NotificationEmailSMTP$Type extends runtime_5.MessageType {
    constructor() {
        super("protos.NotificationEmailSMTP", [
            { no: 1, name: "host", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "port", kind: "scalar", T: 5 /*ScalarType.INT32*/ },
            { no: 3, name: "user", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 4, name: "password", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 5, name: "use_tls", kind: "scalar", T: 8 /*ScalarType.BOOL*/ }
        ]);
    }
    create(value) {
        const message = { host: "", port: 0, user: "", password: "", useTls: false };
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
                case /* string host */ 1:
                    message.host = reader.string();
                    break;
                case /* int32 port */ 2:
                    message.port = reader.int32();
                    break;
                case /* string user */ 3:
                    message.user = reader.string();
                    break;
                case /* string password */ 4:
                    message.password = reader.string();
                    break;
                case /* bool use_tls */ 5:
                    message.useTls = reader.bool();
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
        /* string host = 1; */
        if (message.host !== "")
            writer.tag(1, runtime_1.WireType.LengthDelimited).string(message.host);
        /* int32 port = 2; */
        if (message.port !== 0)
            writer.tag(2, runtime_1.WireType.Varint).int32(message.port);
        /* string user = 3; */
        if (message.user !== "")
            writer.tag(3, runtime_1.WireType.LengthDelimited).string(message.user);
        /* string password = 4; */
        if (message.password !== "")
            writer.tag(4, runtime_1.WireType.LengthDelimited).string(message.password);
        /* bool use_tls = 5; */
        if (message.useTls !== false)
            writer.tag(5, runtime_1.WireType.Varint).bool(message.useTls);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.NotificationEmailSMTP
 */
exports.NotificationEmailSMTP = new NotificationEmailSMTP$Type();
// @generated message type with reflection information, may provide speed optimized methods
class NotificationEmailSES$Type extends runtime_5.MessageType {
    constructor() {
        super("protos.NotificationEmailSES", [
            { no: 1, name: "ses_region", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "ses_access_key_id", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 3, name: "ses_secret_access_key", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value) {
        const message = { sesRegion: "", sesAccessKeyId: "", sesSecretAccessKey: "" };
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
                case /* string ses_region */ 1:
                    message.sesRegion = reader.string();
                    break;
                case /* string ses_access_key_id */ 2:
                    message.sesAccessKeyId = reader.string();
                    break;
                case /* string ses_secret_access_key */ 3:
                    message.sesSecretAccessKey = reader.string();
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
        /* string ses_region = 1; */
        if (message.sesRegion !== "")
            writer.tag(1, runtime_1.WireType.LengthDelimited).string(message.sesRegion);
        /* string ses_access_key_id = 2; */
        if (message.sesAccessKeyId !== "")
            writer.tag(2, runtime_1.WireType.LengthDelimited).string(message.sesAccessKeyId);
        /* string ses_secret_access_key = 3; */
        if (message.sesSecretAccessKey !== "")
            writer.tag(3, runtime_1.WireType.LengthDelimited).string(message.sesSecretAccessKey);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.NotificationEmailSES
 */
exports.NotificationEmailSES = new NotificationEmailSES$Type();
// @generated message type with reflection information, may provide speed optimized methods
class NotificationPagerDuty$Type extends runtime_5.MessageType {
    constructor() {
        super("protos.NotificationPagerDuty", [
            { no: 1, name: "token", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "email", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 3, name: "service_id", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 4, name: "urgency", kind: "enum", T: () => ["protos.NotificationPagerDuty.Urgency", NotificationPagerDuty_Urgency, "URGENCY_"] }
        ]);
    }
    create(value) {
        const message = { token: "", email: "", serviceId: "", urgency: 0 };
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
                case /* string token */ 1:
                    message.token = reader.string();
                    break;
                case /* string email */ 2:
                    message.email = reader.string();
                    break;
                case /* string service_id */ 3:
                    message.serviceId = reader.string();
                    break;
                case /* protos.NotificationPagerDuty.Urgency urgency */ 4:
                    message.urgency = reader.int32();
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
        /* string token = 1; */
        if (message.token !== "")
            writer.tag(1, runtime_1.WireType.LengthDelimited).string(message.token);
        /* string email = 2; */
        if (message.email !== "")
            writer.tag(2, runtime_1.WireType.LengthDelimited).string(message.email);
        /* string service_id = 3; */
        if (message.serviceId !== "")
            writer.tag(3, runtime_1.WireType.LengthDelimited).string(message.serviceId);
        /* protos.NotificationPagerDuty.Urgency urgency = 4; */
        if (message.urgency !== 0)
            writer.tag(4, runtime_1.WireType.Varint).int32(message.urgency);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.NotificationPagerDuty
 */
exports.NotificationPagerDuty = new NotificationPagerDuty$Type();
