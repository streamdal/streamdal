import { MessageType } from "@protobuf-ts/runtime";
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
export {};
