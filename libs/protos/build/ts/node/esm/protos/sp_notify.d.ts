import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
/**
 * @generated from protobuf message protos.NotificationConfig
 */
export interface NotificationConfig {
    /**
     * @generated from protobuf field: optional string id = 1;
     */
    id?: string;
    /**
     * @generated from protobuf field: string name = 2;
     */
    name: string;
    /**
     * @generated from protobuf field: protos.NotificationType type = 3;
     */
    type: NotificationType;
    /**
     * @generated from protobuf oneof: config
     */
    config: {
        oneofKind: "slack";
        /**
         * @generated from protobuf field: protos.NotificationSlack slack = 1000;
         */
        slack: NotificationSlack;
    } | {
        oneofKind: "email";
        /**
         * @generated from protobuf field: protos.NotificationEmail email = 1001;
         */
        email: NotificationEmail;
    } | {
        oneofKind: "pagerduty";
        /**
         * @generated from protobuf field: protos.NotificationPagerDuty pagerduty = 1002;
         */
        pagerduty: NotificationPagerDuty;
    } | {
        oneofKind: undefined;
    };
}
/**
 * @generated from protobuf message protos.NotificationSlack
 */
export interface NotificationSlack {
    /**
     * @generated from protobuf field: string bot_token = 1;
     */
    botToken: string;
    /**
     * @generated from protobuf field: string channel = 2;
     */
    channel: string;
}
/**
 * @generated from protobuf message protos.NotificationEmail
 */
export interface NotificationEmail {
    /**
     * @generated from protobuf field: protos.NotificationEmail.Type type = 1;
     */
    type: NotificationEmail_Type;
    /**
     * @generated from protobuf field: repeated string recipients = 2;
     */
    recipients: string[];
    /**
     * @generated from protobuf field: string from_address = 3;
     */
    fromAddress: string;
    /**
     * @generated from protobuf oneof: config
     */
    config: {
        oneofKind: "smtp";
        /**
         * @generated from protobuf field: protos.NotificationEmailSMTP smtp = 1000;
         */
        smtp: NotificationEmailSMTP;
    } | {
        oneofKind: "ses";
        /**
         * @generated from protobuf field: protos.NotificationEmailSES ses = 1001;
         */
        ses: NotificationEmailSES;
    } | {
        oneofKind: undefined;
    };
}
/**
 * @generated from protobuf enum protos.NotificationEmail.Type
 */
export declare enum NotificationEmail_Type {
    /**
     * @generated from protobuf enum value: TYPE_UNSET = 0;
     */
    UNSET = 0,
    /**
     * @generated from protobuf enum value: TYPE_SMTP = 1;
     */
    SMTP = 1,
    /**
     * @generated from protobuf enum value: TYPE_SES = 2;
     */
    SES = 2
}
/**
 * @generated from protobuf message protos.NotificationEmailSMTP
 */
export interface NotificationEmailSMTP {
    /**
     * @generated from protobuf field: string host = 1;
     */
    host: string;
    /**
     * @generated from protobuf field: int32 port = 2;
     */
    port: number;
    /**
     * @generated from protobuf field: string user = 3;
     */
    user: string;
    /**
     * @generated from protobuf field: string password = 4;
     */
    password: string;
    /**
     * @generated from protobuf field: bool use_tls = 5;
     */
    useTls: boolean;
}
/**
 * @generated from protobuf message protos.NotificationEmailSES
 */
export interface NotificationEmailSES {
    /**
     * @generated from protobuf field: string ses_region = 1;
     */
    sesRegion: string;
    /**
     * @generated from protobuf field: string ses_access_key_id = 2;
     */
    sesAccessKeyId: string;
    /**
     * @generated from protobuf field: string ses_secret_access_key = 3;
     */
    sesSecretAccessKey: string;
}
/**
 * @generated from protobuf message protos.NotificationPagerDuty
 */
export interface NotificationPagerDuty {
    /**
     * Auth token
     *
     * @generated from protobuf field: string token = 1;
     */
    token: string;
    /**
     * Must be a valid email for a PagerDuty user
     *
     * @generated from protobuf field: string email = 2;
     */
    email: string;
    /**
     * Must be a valid PagerDuty service
     *
     * @generated from protobuf field: string service_id = 3;
     */
    serviceId: string;
    /**
     * @generated from protobuf field: protos.NotificationPagerDuty.Urgency urgency = 4;
     */
    urgency: NotificationPagerDuty_Urgency;
}
/**
 * @generated from protobuf enum protos.NotificationPagerDuty.Urgency
 */
export declare enum NotificationPagerDuty_Urgency {
    /**
     * @generated from protobuf enum value: URGENCY_UNSET = 0;
     */
    UNSET = 0,
    /**
     * @generated from protobuf enum value: URGENCY_LOW = 1;
     */
    LOW = 1,
    /**
     * @generated from protobuf enum value: URGENCY_HIGH = 2;
     */
    HIGH = 2
}
/**
 * @generated from protobuf enum protos.NotificationType
 */
export declare enum NotificationType {
    /**
     * @generated from protobuf enum value: NOTIFICATION_TYPE_UNSET = 0;
     */
    UNSET = 0,
    /**
     * @generated from protobuf enum value: NOTIFICATION_TYPE_SLACK = 1;
     */
    SLACK = 1,
    /**
     * @generated from protobuf enum value: NOTIFICATION_TYPE_EMAIL = 2;
     */
    EMAIL = 2,
    /**
     * @generated from protobuf enum value: NOTIFICATION_TYPE_PAGERDUTY = 3;
     */
    PAGERDUTY = 3
}
declare class NotificationConfig$Type extends MessageType<NotificationConfig> {
    constructor();
    create(value?: PartialMessage<NotificationConfig>): NotificationConfig;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: NotificationConfig): NotificationConfig;
    internalBinaryWrite(message: NotificationConfig, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.NotificationConfig
 */
export declare const NotificationConfig: NotificationConfig$Type;
declare class NotificationSlack$Type extends MessageType<NotificationSlack> {
    constructor();
    create(value?: PartialMessage<NotificationSlack>): NotificationSlack;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: NotificationSlack): NotificationSlack;
    internalBinaryWrite(message: NotificationSlack, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.NotificationSlack
 */
export declare const NotificationSlack: NotificationSlack$Type;
declare class NotificationEmail$Type extends MessageType<NotificationEmail> {
    constructor();
    create(value?: PartialMessage<NotificationEmail>): NotificationEmail;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: NotificationEmail): NotificationEmail;
    internalBinaryWrite(message: NotificationEmail, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.NotificationEmail
 */
export declare const NotificationEmail: NotificationEmail$Type;
declare class NotificationEmailSMTP$Type extends MessageType<NotificationEmailSMTP> {
    constructor();
    create(value?: PartialMessage<NotificationEmailSMTP>): NotificationEmailSMTP;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: NotificationEmailSMTP): NotificationEmailSMTP;
    internalBinaryWrite(message: NotificationEmailSMTP, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.NotificationEmailSMTP
 */
export declare const NotificationEmailSMTP: NotificationEmailSMTP$Type;
declare class NotificationEmailSES$Type extends MessageType<NotificationEmailSES> {
    constructor();
    create(value?: PartialMessage<NotificationEmailSES>): NotificationEmailSES;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: NotificationEmailSES): NotificationEmailSES;
    internalBinaryWrite(message: NotificationEmailSES, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.NotificationEmailSES
 */
export declare const NotificationEmailSES: NotificationEmailSES$Type;
declare class NotificationPagerDuty$Type extends MessageType<NotificationPagerDuty> {
    constructor();
    create(value?: PartialMessage<NotificationPagerDuty>): NotificationPagerDuty;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: NotificationPagerDuty): NotificationPagerDuty;
    internalBinaryWrite(message: NotificationPagerDuty, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.NotificationPagerDuty
 */
export declare const NotificationPagerDuty: NotificationPagerDuty$Type;
export {};
