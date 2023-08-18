import { MessageType } from "@protobuf-ts/runtime";
import { KVInstruction } from "./kv.js";
import { Pipeline } from "./pipeline.js";
import { Audience } from "./common.js";
/**
 * Command is used by snitch-server for sending commands to SDKs
 *
 * @generated from protobuf message protos.Command
 */
export interface Command {
    /**
     * Who is this command intended for?
     * NOTE: Some commands (such as KeepAliveCommand, KVCommand) do NOT use audience and will ignore it
     *
     * @generated from protobuf field: protos.Audience audience = 1;
     */
    audience?: Audience;
    /**
     * @generated from protobuf oneof: command
     */
    command: {
        oneofKind: "attachPipeline";
        /**
         * @generated from protobuf field: protos.AttachPipelineCommand attach_pipeline = 100;
         */
        attachPipeline: AttachPipelineCommand;
    } | {
        oneofKind: "detachPipeline";
        /**
         * @generated from protobuf field: protos.DetachPipelineCommand detach_pipeline = 101;
         */
        detachPipeline: DetachPipelineCommand;
    } | {
        oneofKind: "pausePipeline";
        /**
         * @generated from protobuf field: protos.PausePipelineCommand pause_pipeline = 102;
         */
        pausePipeline: PausePipelineCommand;
    } | {
        oneofKind: "resumePipeline";
        /**
         * @generated from protobuf field: protos.ResumePipelineCommand resume_pipeline = 103;
         */
        resumePipeline: ResumePipelineCommand;
    } | {
        oneofKind: "keepAlive";
        /**
         * @generated from protobuf field: protos.KeepAliveCommand keep_alive = 104;
         */
        keepAlive: KeepAliveCommand;
    } | {
        oneofKind: "kv";
        /**
         * snitch-server will emit this when a user makes changes to the KV store
         * via the KV HTTP API.
         *
         * @generated from protobuf field: protos.KVCommand kv = 105;
         */
        kv: KVCommand;
    } | {
        oneofKind: undefined;
    };
}
/**
 * @generated from protobuf message protos.AttachPipelineCommand
 */
export interface AttachPipelineCommand {
    /**
     * @generated from protobuf field: protos.Pipeline pipeline = 1;
     */
    pipeline?: Pipeline;
}
/**
 * @generated from protobuf message protos.DetachPipelineCommand
 */
export interface DetachPipelineCommand {
    /**
     * @generated from protobuf field: string pipeline_id = 1;
     */
    pipelineId: string;
}
/**
 * @generated from protobuf message protos.PausePipelineCommand
 */
export interface PausePipelineCommand {
    /**
     * @generated from protobuf field: string pipeline_id = 1;
     */
    pipelineId: string;
}
/**
 * @generated from protobuf message protos.ResumePipelineCommand
 */
export interface ResumePipelineCommand {
    /**
     * @generated from protobuf field: string pipeline_id = 1;
     */
    pipelineId: string;
}
/**
 * Nothing needed in here, just a ping from server to SDK
 *
 * @generated from protobuf message protos.KeepAliveCommand
 */
export interface KeepAliveCommand {
}
/**
 * Sent by snitch-server on Register channel(s) to live SDKs
 *
 * @generated from protobuf message protos.KVCommand
 */
export interface KVCommand {
    /**
     * @generated from protobuf field: repeated protos.KVInstruction instructions = 1;
     */
    instructions: KVInstruction[];
    /**
     * Create & Update specific setting that will cause the Create or Update to
     * work as an upsert.
     *
     * @generated from protobuf field: bool overwrite = 2;
     */
    overwrite: boolean;
}
declare class Command$Type extends MessageType<Command> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.Command
 */
export declare const Command: Command$Type;
declare class AttachPipelineCommand$Type extends MessageType<AttachPipelineCommand> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.AttachPipelineCommand
 */
export declare const AttachPipelineCommand: AttachPipelineCommand$Type;
declare class DetachPipelineCommand$Type extends MessageType<DetachPipelineCommand> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.DetachPipelineCommand
 */
export declare const DetachPipelineCommand: DetachPipelineCommand$Type;
declare class PausePipelineCommand$Type extends MessageType<PausePipelineCommand> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.PausePipelineCommand
 */
export declare const PausePipelineCommand: PausePipelineCommand$Type;
declare class ResumePipelineCommand$Type extends MessageType<ResumePipelineCommand> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.ResumePipelineCommand
 */
export declare const ResumePipelineCommand: ResumePipelineCommand$Type;
declare class KeepAliveCommand$Type extends MessageType<KeepAliveCommand> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.KeepAliveCommand
 */
export declare const KeepAliveCommand: KeepAliveCommand$Type;
declare class KVCommand$Type extends MessageType<KVCommand> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.KVCommand
 */
export declare const KVCommand: KVCommand$Type;
export {};
