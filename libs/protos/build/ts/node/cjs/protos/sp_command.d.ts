import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
import { TailRequest } from "./sp_common";
import { KVInstruction } from "./sp_kv";
import { WasmModule } from "./shared/sp_shared";
import { Pipeline } from "./sp_pipeline";
import { Audience } from "./sp_common";
/**
 * Command is used by streamdal server for sending commands to SDKs
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
        oneofKind: "setPipelines";
        /**
         * Emitted by server when a user makes a pause, resume, delete or update
         * pipeline and set pipelines external grpc API call.
         * NOTE: This was introduced during ordered pipeline updates.
         *
         * @generated from protobuf field: protos.SetPipelinesCommand set_pipelines = 100;
         */
        setPipelines: SetPipelinesCommand;
    } | {
        oneofKind: "keepAlive";
        /**
         * Server sends this periodically to SDKs to keep the connection alive
         *
         * @generated from protobuf field: protos.KeepAliveCommand keep_alive = 101;
         */
        keepAlive: KeepAliveCommand;
    } | {
        oneofKind: "kv";
        /**
         * Server will emit this when a user makes changes to the KV store
         * via the KV HTTP API.
         *
         * @generated from protobuf field: protos.KVCommand kv = 102;
         */
        kv: KVCommand;
    } | {
        oneofKind: "tail";
        /**
         * Emitted by server when a user makes a Tail() call
         * Consumed by all server instances and by SDK
         *
         * @generated from protobuf field: protos.TailCommand tail = 103;
         */
        tail: TailCommand;
    } | {
        oneofKind: "delete";
        /**
         * Emitted by the server when a user deletes an audience or service
         * Consumed by SDK to delete audience from it's internal cache so
         * that the heartbeat does not send the audience back to the server
         *
         * @generated from protobuf field: protos.DeleteAudiencesCommand delete = 104;
         */
        delete: DeleteAudiencesCommand;
    } | {
        oneofKind: undefined;
    };
}
/**
 * @generated from protobuf message protos.SetPipelinesCommand
 */
export interface SetPipelinesCommand {
    /**
     * @generated from protobuf field: repeated protos.Pipeline pipelines = 1;
     */
    pipelines: Pipeline[];
    /**
     * ID = wasm ID
     *
     * @generated from protobuf field: map<string, protos.shared.WasmModule> wasm_modules = 2;
     */
    wasmModules: {
        [key: string]: WasmModule;
    };
}
/**
 * Nothing needed in here, just a ping from server to SDK
 *
 * @generated from protobuf message protos.KeepAliveCommand
 */
export interface KeepAliveCommand {
}
/**
 * Sent by server on Register channel(s) to live SDKs
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
/**
 * @generated from protobuf message protos.DeleteAudiencesCommand
 */
export interface DeleteAudiencesCommand {
    /**
     * @generated from protobuf field: repeated protos.Audience audience = 1;
     */
    audience: Audience[];
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
declare class SetPipelinesCommand$Type extends MessageType<SetPipelinesCommand> {
    constructor();
    create(value?: PartialMessage<SetPipelinesCommand>): SetPipelinesCommand;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: SetPipelinesCommand): SetPipelinesCommand;
    private binaryReadMap2;
    internalBinaryWrite(message: SetPipelinesCommand, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.SetPipelinesCommand
 */
export declare const SetPipelinesCommand: SetPipelinesCommand$Type;
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
declare class DeleteAudiencesCommand$Type extends MessageType<DeleteAudiencesCommand> {
    constructor();
    create(value?: PartialMessage<DeleteAudiencesCommand>): DeleteAudiencesCommand;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: DeleteAudiencesCommand): DeleteAudiencesCommand;
    internalBinaryWrite(message: DeleteAudiencesCommand, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.DeleteAudiencesCommand
 */
export declare const DeleteAudiencesCommand: DeleteAudiencesCommand$Type;
export {};
