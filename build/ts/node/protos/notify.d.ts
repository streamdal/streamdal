import { MessageType } from "@protobuf-ts/runtime";
/**
 * @generated from protobuf message protos.NotificationConfig
 */
export interface NotificationConfig {
    /**
     * @generated from protobuf field: string id = 1;
     */
    id: string;
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
     * @generated from protobuf field: optional string bot_token = 1;
     */
    botToken?: string;
    /**
     * @generated from protobuf field: optional string channel = 2;
     */
    channel?: string;
}
/**
 * @generated from protobuf message protos.NotificationEmail
 */
export interface NotificationEmail {
    /**
     * @generated from protobuf field: repeated string recipients = 1;
     */
    recipients: string[];
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
}
/**
 * @generated MessageType for protobuf message protos.NotificationConfig
 */
export declare const NotificationConfig: NotificationConfig$Type;
declare class NotificationSlack$Type extends MessageType<NotificationSlack> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.NotificationSlack
 */
export declare const NotificationSlack: NotificationSlack$Type;
declare class NotificationEmail$Type extends MessageType<NotificationEmail> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.NotificationEmail
 */
export declare const NotificationEmail: NotificationEmail$Type;
declare class NotificationPagerDuty$Type extends MessageType<NotificationPagerDuty> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.NotificationPagerDuty
 */
export declare const NotificationPagerDuty: NotificationPagerDuty$Type;
export {};
