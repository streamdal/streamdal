import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
import { SchemaValidationStep } from "./steps/sp_steps_schema_validation.js";
import { ValidJSONStep } from "./steps/sp_steps_valid_json.js";
import { InferSchemaStep } from "./steps/sp_steps_inferschema.js";
import { KVStep } from "./steps/sp_steps_kv.js";
import { HttpRequestStep } from "./steps/sp_steps_httprequest.js";
import { CustomStep } from "./steps/sp_steps_custom.js";
import { DecodeStep } from "./steps/sp_steps_decode.js";
import { EncodeStep } from "./steps/sp_steps_encode.js";
import { TransformStep } from "./steps/sp_steps_transform.js";
import { DetectiveStep } from "./steps/sp_steps_detective.js";
import { NotificationConfig } from "./sp_notify.js";
/**
 * Pipeline is a structure that holds one or more pipeline steps. This structure
 * is intended to be immutable; clients are expected to generate WASMRequest's
 * that contain a pipeline step.
 *
 * @generated from protobuf message protos.Pipeline
 */
export interface Pipeline {
    /**
     * If left blank, the server will generate a unique ID. If one is provided,
     * the server will check if that is ID is already in use when creating a pipeline.
     *
     * @generated from protobuf field: string id = 1;
     */
    id: string;
    /**
     * Friendly name for the pipeline
     *
     * @generated from protobuf field: string name = 2;
     */
    name: string;
    /**
     * One or more steps to execute
     *
     * @generated from protobuf field: repeated protos.PipelineStep steps = 3;
     */
    steps: PipelineStep[];
    /**
     * Notification configs for this pipeline. Only filled out in external API responses
     * This is deprecated and the data has moved to PipelineStep
     *
     * @deprecated
     * @generated from protobuf field: repeated protos.NotificationConfig _notification_configs = 4 [deprecated = true];
     */
    NotificationConfigs: NotificationConfig[];
    /**
     * @generated from protobuf field: protos.PipelineDataFormat data_format = 5;
     */
    dataFormat: PipelineDataFormat;
    /**
     * Indicates whether the pipeline is paused or not. Used internally by server.
     *
     * @generated from protobuf field: optional bool _paused = 1000;
     */
    Paused?: boolean;
    /**
     * @generated from protobuf field: optional string _description = 1001;
     */
    Description?: string;
    /**
     * @generated from protobuf field: optional string _version = 1002;
     */
    Version?: string;
    /**
     * @generated from protobuf field: optional string _url = 1003;
     */
    Url?: string;
    /**
     * @generated from protobuf field: optional int64 _created_at_unix_ts_utc = 1004;
     */
    CreatedAtUnixTsUtc?: string;
    /**
     * @generated from protobuf field: optional int64 _updated_at_unix_ts_utc = 1005;
     */
    UpdatedAtUnixTsUtc?: string;
    /**
     * Used internally by server and k8s operator to determine who manages this resource
     *
     * @generated from protobuf field: optional string _created_by = 1006;
     */
    CreatedBy?: string;
}
/**
 * Conditions define how the SDK should handle a Wasm response in a step.
 * Should it continue executing the pipeline, should it abort, should it notify
 * and on_error.
 * TODO: de-pluralize this name
 *
 * @generated from protobuf message protos.PipelineStepConditions
 */
export interface PipelineStepConditions {
    /**
     * Should we abort execution?
     *
     * @generated from protobuf field: protos.AbortCondition abort = 1;
     */
    abort: AbortCondition;
    /**
     * @deprecated
     * @generated from protobuf field: bool notify = 2 [deprecated = true];
     */
    notify: boolean;
    /**
     * Should we include additional metadata that SDK should pass back to user?
     *
     * @generated from protobuf field: map<string, string> metadata = 3;
     */
    metadata: {
        [key: string]: string;
    };
    /**
     * @generated from protobuf field: protos.PipelineStepNotification notification = 4;
     */
    notification?: PipelineStepNotification;
}
/**
 * @generated from protobuf message protos.PipelineStepNotification
 */
export interface PipelineStepNotification {
    /**
     * The UUIDs of the notification config to use
     * This is kept separate to avoid having to configure slack/email settings
     * every time and also because that config info is sensitive and is encrypted
     *
     * @generated from protobuf field: repeated string notification_config_ids = 1;
     */
    notificationConfigIds: string[];
    /**
     * @generated from protobuf field: protos.PipelineStepNotification.PayloadType payload_type = 2;
     */
    payloadType: PipelineStepNotification_PayloadType;
    /**
     * If type == paths, then we will look here for a list of json paths to include
     * in the notification payload.
     *
     * @generated from protobuf field: repeated string paths = 3;
     */
    paths: string[];
}
/**
 * @generated from protobuf enum protos.PipelineStepNotification.PayloadType
 */
export declare enum PipelineStepNotification_PayloadType {
    /**
     * Same functionality as PAYLOAD_TYPE_EXCLUDE
     *
     * @generated from protobuf enum value: PAYLOAD_TYPE_UNSET = 0;
     */
    UNSET = 0,
    /**
     * Default. No payload data included in notification
     *
     * @generated from protobuf enum value: PAYLOAD_TYPE_EXCLUDE = 1;
     */
    EXCLUDE = 1,
    /**
     * Entire payload content included in notification
     *
     * @generated from protobuf enum value: PAYLOAD_TYPE_FULL_PAYLOAD = 2;
     */
    FULL_PAYLOAD = 2,
    /**
     * Only specified paths of payload content included in notification
     * Only works on JSON. Plaintext payloads will be ignored.
     *
     * @generated from protobuf enum value: PAYLOAD_TYPE_SELECT_PATHS = 3;
     */
    SELECT_PATHS = 3
}
/**
 * A pipeline step is a single step in a pipeline.
 *
 * @generated from protobuf message protos.PipelineStep
 */
export interface PipelineStep {
    /**
     * Friendly name for the step
     *
     * @generated from protobuf field: string name = 1;
     */
    name: string;
    /**
     * SDKs should read this when Wasm returns 'true' to determine what to do next.
     *
     * @generated from protobuf field: protos.PipelineStepConditions on_true = 2;
     */
    onTrue?: PipelineStepConditions;
    /**
     * SDKs should read this when Wasm returns 'false' to determine what to do next.
     *
     * @generated from protobuf field: protos.PipelineStepConditions on_false = 3;
     */
    onFalse?: PipelineStepConditions;
    /**
     * Indicates whether to use the results from a previous step as input to this step
     *
     * @generated from protobuf field: bool dynamic = 4;
     */
    dynamic: boolean;
    /**
     * SDKs should read this when Wasm returns 'error' to determine what to do next.
     *
     * @generated from protobuf field: protos.PipelineStepConditions on_error = 5;
     */
    onError?: PipelineStepConditions;
    /**
     * @generated from protobuf oneof: step
     */
    step: {
        oneofKind: "detective";
        /**
         * @generated from protobuf field: protos.steps.DetectiveStep detective = 1000;
         */
        detective: DetectiveStep;
    } | {
        oneofKind: "transform";
        /**
         * @generated from protobuf field: protos.steps.TransformStep transform = 1001;
         */
        transform: TransformStep;
    } | {
        oneofKind: "encode";
        /**
         * @generated from protobuf field: protos.steps.EncodeStep encode = 1002;
         */
        encode: EncodeStep;
    } | {
        oneofKind: "decode";
        /**
         * @generated from protobuf field: protos.steps.DecodeStep decode = 1003;
         */
        decode: DecodeStep;
    } | {
        oneofKind: "custom";
        /**
         * If set, _wasm_id MUST be set
         *
         * @generated from protobuf field: protos.steps.CustomStep custom = 1004;
         */
        custom: CustomStep;
    } | {
        oneofKind: "httpRequest";
        /**
         * @generated from protobuf field: protos.steps.HttpRequestStep http_request = 1005;
         */
        httpRequest: HttpRequestStep;
    } | {
        oneofKind: "kv";
        /**
         * @generated from protobuf field: protos.steps.KVStep kv = 1006;
         */
        kv: KVStep;
    } | {
        oneofKind: "inferSchema";
        /**
         * @generated from protobuf field: protos.steps.InferSchemaStep infer_schema = 1007;
         */
        inferSchema: InferSchemaStep;
    } | {
        oneofKind: "validJson";
        /**
         * @generated from protobuf field: protos.steps.ValidJSONStep valid_json = 1008;
         */
        validJson: ValidJSONStep;
    } | {
        oneofKind: "schemaValidation";
        /**
         * @generated from protobuf field: protos.steps.SchemaValidationStep schema_validation = 1009;
         */
        schemaValidation: SchemaValidationStep;
    } | {
        oneofKind: undefined;
    };
    /**
     * Set by server UNLESS step is CustomStep
     *
     * @generated from protobuf field: optional string _wasm_id = 10000;
     */
    WasmId?: string;
    /**
     * Set by server
     *
     * @generated from protobuf field: optional bytes _wasm_bytes = 10001;
     */
    WasmBytes?: Uint8Array;
    /**
     * Set by server
     *
     * @generated from protobuf field: optional string _wasm_function = 10002;
     */
    WasmFunction?: string;
}
/**
 * PipelineConfigs is stored encoded in redis:streamdal_audience:$audStr; it is
 * also used in external.GetAllResponse:config.
 *
 * @generated from protobuf message protos.PipelineConfigs
 */
export interface PipelineConfigs {
    /**
     * @generated from protobuf field: repeated protos.PipelineConfig configs = 1;
     */
    configs: PipelineConfig[];
    /**
     * !!!!!!!! IMPORTANT !!!!!!!!!!
     *
     * For internal use only in server. We need this because marshalling/encoding
     * an empty protobuf results in nil. If someone does a SetPipelines() with
     * empty pipeline IDs - we will set this, so that the encoded protobuf gets
     * written as the actual object and not nil.
     *
     *
     * @generated from protobuf field: optional bool _is_empty = 1000;
     */
    IsEmpty?: boolean;
    /**
     * Used internally by server and k8s operator to determine who manages this resource/mapping
     *
     * @generated from protobuf field: optional string _created_by = 1001;
     */
    CreatedBy?: string;
}
/**
 * PipelineConfig is structure used in protos.PipelineConfigs
 *
 * @generated from protobuf message protos.PipelineConfig
 */
export interface PipelineConfig {
    /**
     * @generated from protobuf field: string id = 1;
     */
    id: string;
    /**
     * @generated from protobuf field: bool paused = 2;
     */
    paused: boolean;
    /**
     * @generated from protobuf field: int64 created_at_unix_ts_utc = 3;
     */
    createdAtUnixTsUtc: string;
}
/**
 * @generated from protobuf enum protos.PipelineDataFormat
 */
export declare enum PipelineDataFormat {
    /**
     * @generated from protobuf enum value: PIPELINE_DATA_FORMAT_UNSET = 0;
     */
    UNSET = 0,
    /**
     * @generated from protobuf enum value: PIPELINE_DATA_FORMAT_JSON = 1;
     */
    JSON = 1,
    /**
     * @generated from protobuf enum value: PIPELINE_DATA_FORMAT_PLAINTEXT = 2;
     */
    PLAINTEXT = 2
}
/**
 * Defines the ways in which a pipeline can be aborted
 *
 * @generated from protobuf enum protos.AbortCondition
 */
export declare enum AbortCondition {
    /**
     * @generated from protobuf enum value: ABORT_CONDITION_UNSET = 0;
     */
    UNSET = 0,
    /**
     * @generated from protobuf enum value: ABORT_CONDITION_ABORT_CURRENT = 1;
     */
    ABORT_CURRENT = 1,
    /**
     * @generated from protobuf enum value: ABORT_CONDITION_ABORT_ALL = 2;
     */
    ABORT_ALL = 2
}
declare class Pipeline$Type extends MessageType<Pipeline> {
    constructor();
    create(value?: PartialMessage<Pipeline>): Pipeline;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: Pipeline): Pipeline;
    internalBinaryWrite(message: Pipeline, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.Pipeline
 */
export declare const Pipeline: Pipeline$Type;
declare class PipelineStepConditions$Type extends MessageType<PipelineStepConditions> {
    constructor();
    create(value?: PartialMessage<PipelineStepConditions>): PipelineStepConditions;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: PipelineStepConditions): PipelineStepConditions;
    private binaryReadMap3;
    internalBinaryWrite(message: PipelineStepConditions, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.PipelineStepConditions
 */
export declare const PipelineStepConditions: PipelineStepConditions$Type;
declare class PipelineStepNotification$Type extends MessageType<PipelineStepNotification> {
    constructor();
    create(value?: PartialMessage<PipelineStepNotification>): PipelineStepNotification;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: PipelineStepNotification): PipelineStepNotification;
    internalBinaryWrite(message: PipelineStepNotification, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.PipelineStepNotification
 */
export declare const PipelineStepNotification: PipelineStepNotification$Type;
declare class PipelineStep$Type extends MessageType<PipelineStep> {
    constructor();
    create(value?: PartialMessage<PipelineStep>): PipelineStep;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: PipelineStep): PipelineStep;
    internalBinaryWrite(message: PipelineStep, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.PipelineStep
 */
export declare const PipelineStep: PipelineStep$Type;
declare class PipelineConfigs$Type extends MessageType<PipelineConfigs> {
    constructor();
    create(value?: PartialMessage<PipelineConfigs>): PipelineConfigs;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: PipelineConfigs): PipelineConfigs;
    internalBinaryWrite(message: PipelineConfigs, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.PipelineConfigs
 */
export declare const PipelineConfigs: PipelineConfigs$Type;
declare class PipelineConfig$Type extends MessageType<PipelineConfig> {
    constructor();
    create(value?: PartialMessage<PipelineConfig>): PipelineConfig;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: PipelineConfig): PipelineConfig;
    internalBinaryWrite(message: PipelineConfig, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.PipelineConfig
 */
export declare const PipelineConfig: PipelineConfig$Type;
export {};
