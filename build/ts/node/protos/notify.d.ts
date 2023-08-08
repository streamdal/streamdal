import { MessageType } from "@protobuf-ts/runtime";
/**
 * @generated from protobuf message protos.NotifyConfig
 */
export interface NotifyConfig {
    /**
     * @generated from protobuf field: string id = 1;
     */
    id: string;
    /**
     * @generated from protobuf field: string name = 2;
     */
    name: string;
    /**
     * @generated from protobuf field: protos.NotifyType type = 3;
     */
    type: NotifyType;
    /**
     * @generated from protobuf field: repeated string pipelines = 4;
     */
    pipelines: string[];
    /**
     * @generated from protobuf oneof: config
     */
    config: {
        oneofKind: "slack";
        /**
         * @generated from protobuf field: protos.NotifySlack slack = 1000;
         */
        slack: NotifySlack;
    } | {
        oneofKind: "email";
        /**
         * @generated from protobuf field: protos.NotifyEmail email = 1001;
         */
        email: NotifyEmail;
    } | {
        oneofKind: "pagerduty";
        /**
         * @generated from protobuf field: protos.NotifyPagerDuty pagerduty = 1002;
         */
        pagerduty: NotifyPagerDuty;
    } | {
        oneofKind: undefined;
    };
}
/**
 * @generated from protobuf message protos.NotifySlack
 */
export interface NotifySlack {
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
 * @generated from protobuf message protos.NotifyEmail
 */
export interface NotifyEmail {
    /**
     * @generated from protobuf field: repeated string recipients = 1;
     */
    recipients: string[];
}
/**
 * @generated from protobuf message protos.NotifyPagerDuty
 */
export interface NotifyPagerDuty {
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
     * @generated from protobuf field: protos.NotifyPagerDuty.Urgency urgency = 4;
     */
    urgency: NotifyPagerDuty_Urgency;
}
/**
 * @generated from protobuf enum protos.NotifyPagerDuty.Urgency
 */
export declare enum NotifyPagerDuty_Urgency {
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
 * @generated from protobuf enum protos.NotifyType
 */
export declare enum NotifyType {
    /**
     * @generated from protobuf enum value: NOTIFY_TYPE_UNSET = 0;
     */
    UNSET = 0,
    /**
     * @generated from protobuf enum value: NOTIFY_TYPE_SLACK = 1;
     */
    SLACK = 1,
    /**
     * @generated from protobuf enum value: NOTIFY_TYPE_EMAIL = 2;
     */
    EMAIL = 2,
    /**
     * @generated from protobuf enum value: NOTIFY_TYPE_PAGERDUTY = 3;
     */
    PAGERDUTY = 3
}
declare class NotifyConfig$Type extends MessageType<NotifyConfig> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.NotifyConfig
 */
export declare const NotifyConfig: NotifyConfig$Type;
declare class NotifySlack$Type extends MessageType<NotifySlack> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.NotifySlack
 */
export declare const NotifySlack: NotifySlack$Type;
declare class NotifyEmail$Type extends MessageType<NotifyEmail> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.NotifyEmail
 */
export declare const NotifyEmail: NotifyEmail$Type;
declare class NotifyPagerDuty$Type extends MessageType<NotifyPagerDuty> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.NotifyPagerDuty
 */
export declare const NotifyPagerDuty: NotifyPagerDuty$Type;
export {};
