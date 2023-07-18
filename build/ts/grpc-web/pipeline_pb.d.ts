import * as jspb from 'google-protobuf'

import * as steps_custom_pb from './steps/custom_pb';
import * as steps_decode_pb from './steps/decode_pb';
import * as steps_detective_pb from './steps/detective_pb';
import * as steps_encode_pb from './steps/encode_pb';
import * as steps_transform_pb from './steps/transform_pb';


export class WASMRequest extends jspb.Message {
  getStep(): PipelineStep | undefined;
  setStep(value?: PipelineStep): WASMRequest;
  hasStep(): boolean;
  clearStep(): WASMRequest;

  getInput(): Uint8Array | string;
  getInput_asU8(): Uint8Array;
  getInput_asB64(): string;
  setInput(value: Uint8Array | string): WASMRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): WASMRequest.AsObject;
  static toObject(includeInstance: boolean, msg: WASMRequest): WASMRequest.AsObject;
  static serializeBinaryToWriter(message: WASMRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): WASMRequest;
  static deserializeBinaryFromReader(message: WASMRequest, reader: jspb.BinaryReader): WASMRequest;
}

export namespace WASMRequest {
  export type AsObject = {
    step?: PipelineStep.AsObject,
    input: Uint8Array | string,
  }
}

export class WASMResponse extends jspb.Message {
  getOutput(): Uint8Array | string;
  getOutput_asU8(): Uint8Array;
  getOutput_asB64(): string;
  setOutput(value: Uint8Array | string): WASMResponse;

  getExitCode(): WASMExitCode;
  setExitCode(value: WASMExitCode): WASMResponse;

  getExitMsg(): string;
  setExitMsg(value: string): WASMResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): WASMResponse.AsObject;
  static toObject(includeInstance: boolean, msg: WASMResponse): WASMResponse.AsObject;
  static serializeBinaryToWriter(message: WASMResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): WASMResponse;
  static deserializeBinaryFromReader(message: WASMResponse, reader: jspb.BinaryReader): WASMResponse;
}

export namespace WASMResponse {
  export type AsObject = {
    output: Uint8Array | string,
    exitCode: WASMExitCode,
    exitMsg: string,
  }
}

export class PipelineStep extends jspb.Message {
  getId(): string;
  setId(value: string): PipelineStep;

  getName(): string;
  setName(value: string): PipelineStep;

  getConditionsList(): Array<PipelineStepCondition>;
  setConditionsList(value: Array<PipelineStepCondition>): PipelineStep;
  clearConditionsList(): PipelineStep;
  addConditions(value: PipelineStepCondition, index?: number): PipelineStep;

  getDetective(): steps_detective_pb.DetectiveStep | undefined;
  setDetective(value?: steps_detective_pb.DetectiveStep): PipelineStep;
  hasDetective(): boolean;
  clearDetective(): PipelineStep;

  getTransform(): steps_transform_pb.TransformStep | undefined;
  setTransform(value?: steps_transform_pb.TransformStep): PipelineStep;
  hasTransform(): boolean;
  clearTransform(): PipelineStep;

  getEncode(): steps_encode_pb.EncodeStep | undefined;
  setEncode(value?: steps_encode_pb.EncodeStep): PipelineStep;
  hasEncode(): boolean;
  clearEncode(): PipelineStep;

  getDecode(): steps_decode_pb.DecodeStep | undefined;
  setDecode(value?: steps_decode_pb.DecodeStep): PipelineStep;
  hasDecode(): boolean;
  clearDecode(): PipelineStep;

  getCustom(): steps_custom_pb.CustomStep | undefined;
  setCustom(value?: steps_custom_pb.CustomStep): PipelineStep;
  hasCustom(): boolean;
  clearCustom(): PipelineStep;

  getWasmId(): string;
  setWasmId(value: string): PipelineStep;

  getWasmBytes(): Uint8Array | string;
  getWasmBytes_asU8(): Uint8Array;
  getWasmBytes_asB64(): string;
  setWasmBytes(value: Uint8Array | string): PipelineStep;

  getWasmFunction(): string;
  setWasmFunction(value: string): PipelineStep;

  getStepCase(): PipelineStep.StepCase;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PipelineStep.AsObject;
  static toObject(includeInstance: boolean, msg: PipelineStep): PipelineStep.AsObject;
  static serializeBinaryToWriter(message: PipelineStep, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PipelineStep;
  static deserializeBinaryFromReader(message: PipelineStep, reader: jspb.BinaryReader): PipelineStep;
}

export namespace PipelineStep {
  export type AsObject = {
    id: string,
    name: string,
    conditionsList: Array<PipelineStepCondition>,
    detective?: steps_detective_pb.DetectiveStep.AsObject,
    transform?: steps_transform_pb.TransformStep.AsObject,
    encode?: steps_encode_pb.EncodeStep.AsObject,
    decode?: steps_decode_pb.DecodeStep.AsObject,
    custom?: steps_custom_pb.CustomStep.AsObject,
    wasmId: string,
    wasmBytes: Uint8Array | string,
    wasmFunction: string,
  }

  export enum StepCase { 
    STEP_NOT_SET = 0,
    DETECTIVE = 1000,
    TRANSFORM = 1001,
    ENCODE = 1002,
    DECODE = 1003,
    CUSTOM = 1004,
  }
}

export class SetPipelineCommand extends jspb.Message {
  getId(): string;
  setId(value: string): SetPipelineCommand;

  getName(): string;
  setName(value: string): SetPipelineCommand;

  getStepsList(): Array<PipelineStep>;
  setStepsList(value: Array<PipelineStep>): SetPipelineCommand;
  clearStepsList(): SetPipelineCommand;
  addSteps(value?: PipelineStep, index?: number): PipelineStep;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SetPipelineCommand.AsObject;
  static toObject(includeInstance: boolean, msg: SetPipelineCommand): SetPipelineCommand.AsObject;
  static serializeBinaryToWriter(message: SetPipelineCommand, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SetPipelineCommand;
  static deserializeBinaryFromReader(message: SetPipelineCommand, reader: jspb.BinaryReader): SetPipelineCommand;
}

export namespace SetPipelineCommand {
  export type AsObject = {
    id: string,
    name: string,
    stepsList: Array<PipelineStep.AsObject>,
  }
}

export class DeletePipelineCommand extends jspb.Message {
  getId(): string;
  setId(value: string): DeletePipelineCommand;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DeletePipelineCommand.AsObject;
  static toObject(includeInstance: boolean, msg: DeletePipelineCommand): DeletePipelineCommand.AsObject;
  static serializeBinaryToWriter(message: DeletePipelineCommand, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DeletePipelineCommand;
  static deserializeBinaryFromReader(message: DeletePipelineCommand, reader: jspb.BinaryReader): DeletePipelineCommand;
}

export namespace DeletePipelineCommand {
  export type AsObject = {
    id: string,
  }
}

export class PausePipelineCommand extends jspb.Message {
  getId(): string;
  setId(value: string): PausePipelineCommand;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PausePipelineCommand.AsObject;
  static toObject(includeInstance: boolean, msg: PausePipelineCommand): PausePipelineCommand.AsObject;
  static serializeBinaryToWriter(message: PausePipelineCommand, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PausePipelineCommand;
  static deserializeBinaryFromReader(message: PausePipelineCommand, reader: jspb.BinaryReader): PausePipelineCommand;
}

export namespace PausePipelineCommand {
  export type AsObject = {
    id: string,
  }
}

export class UnpausePipelineCommand extends jspb.Message {
  getId(): string;
  setId(value: string): UnpausePipelineCommand;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UnpausePipelineCommand.AsObject;
  static toObject(includeInstance: boolean, msg: UnpausePipelineCommand): UnpausePipelineCommand.AsObject;
  static serializeBinaryToWriter(message: UnpausePipelineCommand, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UnpausePipelineCommand;
  static deserializeBinaryFromReader(message: UnpausePipelineCommand, reader: jspb.BinaryReader): UnpausePipelineCommand;
}

export namespace UnpausePipelineCommand {
  export type AsObject = {
    id: string,
  }
}

export enum WASMExitCode { 
  WASM_EXIT_CODE_UNSET = 0,
  WASM_EXIT_CODE_SUCCESS = 1,
  WASM_EXIT_CODE_FAILURE = 2,
  WASM_EXIT_CODE_INTERNAL_ERROR = 3,
}
export enum PipelineStepCondition { 
  CONDITION_UNSET = 0,
  CONDITION_CONTINUE = 1,
  CONDITION_ABORT = 2,
  CONDITION_NOTIFY = 3,
}
