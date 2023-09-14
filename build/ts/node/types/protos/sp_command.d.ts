import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
import { TailRequest } from "./sp_common";
import { KVInstruction } from "./sp_kv";
import { Pipeline } from "./sp_pipeline";
import { Audience } from "./sp_common";
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
        oneofKind: "tail";
        /**
         * Emitted by snitch-server when a user makes a Tail() call
         * Consumed by all snitch-server instances and by SDKs
         *
         * @generated from protobuf field: protos.TailCommand tail = 106;
         */
        tail: TailCommand;
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
/**
 * @generated from protobuf message protos.TailCommand
 */
export interface TailCommand {
    /**
     * @generated from protobuf field: protos.TailRequest request = 2;
     */
    request?: TailRequest;
}
declare class Command$Type extends MessageType<Command> {
    constructor();
    create(value?: PartialMessage<Command>): Command;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: Command): Command;
    internalBinaryWrite(message: Command, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.Command
 */
export declare const Command: Command$Type;
declare class AttachPipelineCommand$Type extends MessageType<AttachPipelineCommand> {
    constructor();
    create(value?: PartialMessage<AttachPipelineCommand>): AttachPipelineCommand;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: AttachPipelineCommand): AttachPipelineCommand;
    internalBinaryWrite(message: AttachPipelineCommand, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.AttachPipelineCommand
 */
export declare const AttachPipelineCommand: AttachPipelineCommand$Type;
declare class DetachPipelineCommand$Type extends MessageType<DetachPipelineCommand> {
    constructor();
    create(value?: PartialMessage<DetachPipelineCommand>): DetachPipelineCommand;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: DetachPipelineCommand): DetachPipelineCommand;
    internalBinaryWrite(message: DetachPipelineCommand, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.DetachPipelineCommand
 */
export declare const DetachPipelineCommand: DetachPipelineCommand$Type;
declare class PausePipelineCommand$Type extends MessageType<PausePipelineCommand> {
    constructor();
    create(value?: PartialMessage<PausePipelineCommand>): PausePipelineCommand;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: PausePipelineCommand): PausePipelineCommand;
    internalBinaryWrite(message: PausePipelineCommand, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.PausePipelineCommand
 */
export declare const PausePipelineCommand: PausePipelineCommand$Type;
declare class ResumePipelineCommand$Type extends MessageType<ResumePipelineCommand> {
    constructor();
    create(value?: PartialMessage<ResumePipelineCommand>): ResumePipelineCommand;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: ResumePipelineCommand): ResumePipelineCommand;
    internalBinaryWrite(message: ResumePipelineCommand, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.ResumePipelineCommand
 */
export declare const ResumePipelineCommand: ResumePipelineCommand$Type;
declare class KeepAliveCommand$Type extends MessageType<KeepAliveCommand> {
    constructor();
    create(value?: PartialMessage<KeepAliveCommand>): KeepAliveCommand;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: KeepAliveCommand): KeepAliveCommand;
    internalBinaryWrite(message: KeepAliveCommand, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.KeepAliveCommand
 */
export declare const KeepAliveCommand: KeepAliveCommand$Type;
declare class KVCommand$Type extends MessageType<KVCommand> {
    constructor();
    create(value?: PartialMessage<KVCommand>): KVCommand;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: KVCommand): KVCommand;
    internalBinaryWrite(message: KVCommand, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.KVCommand
 */
export declare const KVCommand: KVCommand$Type;
declare class TailCommand$Type extends MessageType<TailCommand> {
    constructor();
    create(value?: PartialMessage<TailCommand>): TailCommand;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: TailCommand): TailCommand;
    internalBinaryWrite(message: TailCommand, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.TailCommand
 */
export declare const TailCommand: TailCommand$Type;
export {};
