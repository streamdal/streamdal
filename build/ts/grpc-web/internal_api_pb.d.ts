import * as jspb from 'google-protobuf'

import * as common_pb from './common_pb';
import * as pipeline_pb from './pipeline_pb';


export class HeartbeatRequest extends jspb.Message {
  getAudience(): Audience | undefined;
  setAudience(value?: Audience): HeartbeatRequest;
  hasAudience(): boolean;
  clearAudience(): HeartbeatRequest;

  getLastActivityUnixTimestampUtc(): number;
  setLastActivityUnixTimestampUtc(value: number): HeartbeatRequest;

  getMetadataMap(): jspb.Map<string, string>;
  clearMetadataMap(): HeartbeatRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): HeartbeatRequest.AsObject;
  static toObject(includeInstance: boolean, msg: HeartbeatRequest): HeartbeatRequest.AsObject;
  static serializeBinaryToWriter(message: HeartbeatRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): HeartbeatRequest;
  static deserializeBinaryFromReader(message: HeartbeatRequest, reader: jspb.BinaryReader): HeartbeatRequest;
}

export namespace HeartbeatRequest {
  export type AsObject = {
    audience?: Audience.AsObject,
    lastActivityUnixTimestampUtc: number,
    metadataMap: Array<[string, string]>,
  }
}

export class NotifyRequest extends jspb.Message {
  getRuleId(): string;
  setRuleId(value: string): NotifyRequest;

  getRuleName(): string;
  setRuleName(value: string): NotifyRequest;

  getAudience(): Audience | undefined;
  setAudience(value?: Audience): NotifyRequest;
  hasAudience(): boolean;
  clearAudience(): NotifyRequest;

  getOccurredAtUnixTsUtc(): number;
  setOccurredAtUnixTsUtc(value: number): NotifyRequest;

  getMetadataMap(): jspb.Map<string, string>;
  clearMetadataMap(): NotifyRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): NotifyRequest.AsObject;
  static toObject(includeInstance: boolean, msg: NotifyRequest): NotifyRequest.AsObject;
  static serializeBinaryToWriter(message: NotifyRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): NotifyRequest;
  static deserializeBinaryFromReader(message: NotifyRequest, reader: jspb.BinaryReader): NotifyRequest;
}

export namespace NotifyRequest {
  export type AsObject = {
    ruleId: string,
    ruleName: string,
    audience?: Audience.AsObject,
    occurredAtUnixTsUtc: number,
    metadataMap: Array<[string, string]>,
  }
}

export class MetricsRequest extends jspb.Message {
  getRuleId(): string;
  setRuleId(value: string): MetricsRequest;

  getRuleName(): string;
  setRuleName(value: string): MetricsRequest;

  getAudience(): Audience | undefined;
  setAudience(value?: Audience): MetricsRequest;
  hasAudience(): boolean;
  clearAudience(): MetricsRequest;

  getMetadataMap(): jspb.Map<string, string>;
  clearMetadataMap(): MetricsRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MetricsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: MetricsRequest): MetricsRequest.AsObject;
  static serializeBinaryToWriter(message: MetricsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MetricsRequest;
  static deserializeBinaryFromReader(message: MetricsRequest, reader: jspb.BinaryReader): MetricsRequest;
}

export namespace MetricsRequest {
  export type AsObject = {
    ruleId: string,
    ruleName: string,
    audience?: Audience.AsObject,
    metadataMap: Array<[string, string]>,
  }
}

export class RegisterRequest extends jspb.Message {
  getServiceName(): string;
  setServiceName(value: string): RegisterRequest;

  getDryRun(): boolean;
  setDryRun(value: boolean): RegisterRequest;

  getMetadataMap(): jspb.Map<string, string>;
  clearMetadataMap(): RegisterRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RegisterRequest.AsObject;
  static toObject(includeInstance: boolean, msg: RegisterRequest): RegisterRequest.AsObject;
  static serializeBinaryToWriter(message: RegisterRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RegisterRequest;
  static deserializeBinaryFromReader(message: RegisterRequest, reader: jspb.BinaryReader): RegisterRequest;
}

export namespace RegisterRequest {
  export type AsObject = {
    serviceName: string,
    dryRun: boolean,
    metadataMap: Array<[string, string]>,
  }
}

export class BusEvent extends jspb.Message {
  getRequestId(): string;
  setRequestId(value: string): BusEvent;

  getSource(): string;
  setSource(value: string): BusEvent;

  getCommandResponse(): CommandResponse | undefined;
  setCommandResponse(value?: CommandResponse): BusEvent;
  hasCommandResponse(): boolean;
  clearCommandResponse(): BusEvent;

  getRegisterRequest(): RegisterRequest | undefined;
  setRegisterRequest(value?: RegisterRequest): BusEvent;
  hasRegisterRequest(): boolean;
  clearRegisterRequest(): BusEvent;

  getMetadataMap(): jspb.Map<string, string>;
  clearMetadataMap(): BusEvent;

  getEventCase(): BusEvent.EventCase;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BusEvent.AsObject;
  static toObject(includeInstance: boolean, msg: BusEvent): BusEvent.AsObject;
  static serializeBinaryToWriter(message: BusEvent, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BusEvent;
  static deserializeBinaryFromReader(message: BusEvent, reader: jspb.BinaryReader): BusEvent;
}

export namespace BusEvent {
  export type AsObject = {
    requestId: string,
    source: string,
    commandResponse?: CommandResponse.AsObject,
    registerRequest?: RegisterRequest.AsObject,
    metadataMap: Array<[string, string]>,
  }

  export enum EventCase { 
    EVENT_NOT_SET = 0,
    COMMAND_RESPONSE = 100,
    REGISTER_REQUEST = 101,
  }
}

export class CommandResponse extends jspb.Message {
  getAudience(): Audience | undefined;
  setAudience(value?: Audience): CommandResponse;
  hasAudience(): boolean;
  clearAudience(): CommandResponse;

  getSetPipeline(): pipeline_pb.SetPipelineCommand | undefined;
  setSetPipeline(value?: pipeline_pb.SetPipelineCommand): CommandResponse;
  hasSetPipeline(): boolean;
  clearSetPipeline(): CommandResponse;

  getDeletePipeline(): pipeline_pb.DeletePipelineCommand | undefined;
  setDeletePipeline(value?: pipeline_pb.DeletePipelineCommand): CommandResponse;
  hasDeletePipeline(): boolean;
  clearDeletePipeline(): CommandResponse;

  getPausePipeline(): pipeline_pb.PausePipelineCommand | undefined;
  setPausePipeline(value?: pipeline_pb.PausePipelineCommand): CommandResponse;
  hasPausePipeline(): boolean;
  clearPausePipeline(): CommandResponse;

  getUnpausePipeline(): pipeline_pb.UnpausePipelineCommand | undefined;
  setUnpausePipeline(value?: pipeline_pb.UnpausePipelineCommand): CommandResponse;
  hasUnpausePipeline(): boolean;
  clearUnpausePipeline(): CommandResponse;

  getMetadataMap(): jspb.Map<string, string>;
  clearMetadataMap(): CommandResponse;

  getCommandCase(): CommandResponse.CommandCase;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CommandResponse.AsObject;
  static toObject(includeInstance: boolean, msg: CommandResponse): CommandResponse.AsObject;
  static serializeBinaryToWriter(message: CommandResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CommandResponse;
  static deserializeBinaryFromReader(message: CommandResponse, reader: jspb.BinaryReader): CommandResponse;
}

export namespace CommandResponse {
  export type AsObject = {
    audience?: Audience.AsObject,
    setPipeline?: pipeline_pb.SetPipelineCommand.AsObject,
    deletePipeline?: pipeline_pb.DeletePipelineCommand.AsObject,
    pausePipeline?: pipeline_pb.PausePipelineCommand.AsObject,
    unpausePipeline?: pipeline_pb.UnpausePipelineCommand.AsObject,
    metadataMap: Array<[string, string]>,
  }

  export enum CommandCase { 
    COMMAND_NOT_SET = 0,
    SET_PIPELINE = 100,
    DELETE_PIPELINE = 101,
    PAUSE_PIPELINE = 102,
    UNPAUSE_PIPELINE = 103,
  }
}

export class Audience extends jspb.Message {
  getServiceName(): string;
  setServiceName(value: string): Audience;

  getComponentName(): string;
  setComponentName(value: string): Audience;

  getOperationType(): OperationType;
  setOperationType(value: OperationType): Audience;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Audience.AsObject;
  static toObject(includeInstance: boolean, msg: Audience): Audience.AsObject;
  static serializeBinaryToWriter(message: Audience, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Audience;
  static deserializeBinaryFromReader(message: Audience, reader: jspb.BinaryReader): Audience;
}

export namespace Audience {
  export type AsObject = {
    serviceName: string,
    componentName: string,
    operationType: OperationType,
  }
}

export enum CommandType { 
  SNITCH_COMMAND_TYPE_UNSET = 0,
  SNITCH_COMMAND_TYPE_KEEPALIVE = 1,
  SNITCH_COMMAND_TYPE_SET_PIPELINE = 2,
  SNITCH_COMMAND_TYPE_DELETE_PIPELINE = 3,
  SNITCH_COMMAND_TYPE_PAUSE_PIPELINE = 4,
  SNITCH_COMMAND_TYPE_UNPAUSE_PIPELINE = 5,
}
export enum OperationType { 
  OPERATION_TYPE_UNSET = 0,
  OPERATION_TYPE_CONSUMER = 1,
  OPERATION_TYPE_PRODUCER = 2,
}
