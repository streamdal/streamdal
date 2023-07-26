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
        oneofKind: "setPipeline";
        /**
         * @generated from protobuf field: protos.SetPipelineCommand set_pipeline = 100;
         */
        setPipeline: SetPipelineCommand;
    } | {
        oneofKind: "deletePipeline";
        /**
         * @generated from protobuf field: protos.DeletePipelineCommand delete_pipeline = 101;
         */
        deletePipeline: DeletePipelineCommand;
    } | {
        oneofKind: "pausePipeline";
        /**
         * @generated from protobuf field: protos.PausePipelineCommand pause_pipeline = 102;
         */
        pausePipeline: PausePipelineCommand;
    } | {
        oneofKind: "unpausePipeline";
        /**
         * @generated from protobuf field: protos.UnpausePipelineCommand unpause_pipeline = 103;
         */
        unpausePipeline: UnpausePipelineCommand;
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
 * Used for both Add and Update
 *
 * @generated from protobuf message protos.SetPipelineCommand
 */
export interface SetPipelineCommand {
    /**
     * @generated from protobuf field: protos.Pipeline pipeline = 1;
     */
    pipeline?: Pipeline;
}
/**
 * @generated from protobuf message protos.DeletePipelineCommand
 */
export interface DeletePipelineCommand {
    /**
     * Unique ID for the pipeline
     *
     * @generated from protobuf field: string id = 1;
     */
    id: string;
}
/**
 * @generated from protobuf message protos.PausePipelineCommand
 */
export interface PausePipelineCommand {
    /**
     * Unique ID for the pipeline
     *
     * @generated from protobuf field: string id = 1;
     */
    id: string;
}
/**
 * @generated from protobuf message protos.UnpausePipelineCommand
 */
export interface UnpausePipelineCommand {
    /**
     * Unique ID for the pipeline
     *
     * @generated from protobuf field: string id = 1;
     */
    id: string;
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
declare class SetPipelineCommand$Type extends MessageType<SetPipelineCommand> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.SetPipelineCommand
 */
export declare const SetPipelineCommand: SetPipelineCommand$Type;
declare class DeletePipelineCommand$Type extends MessageType<DeletePipelineCommand> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.DeletePipelineCommand
 */
export declare const DeletePipelineCommand: DeletePipelineCommand$Type;
declare class PausePipelineCommand$Type extends MessageType<PausePipelineCommand> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.PausePipelineCommand
 */
export declare const PausePipelineCommand: PausePipelineCommand$Type;
declare class UnpausePipelineCommand$Type extends MessageType<UnpausePipelineCommand> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.UnpausePipelineCommand
 */
export declare const UnpausePipelineCommand: UnpausePipelineCommand$Type;
declare class KeepAliveCommand$Type extends MessageType<KeepAliveCommand> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.KeepAliveCommand
 */
export declare const KeepAliveCommand: KeepAliveCommand$Type;
export {};
