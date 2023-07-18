import * as jspb from 'google-protobuf'



export class TransformStep extends jspb.Message {
  getPath(): string;
  setPath(value: string): TransformStep;

  getValue(): string;
  setValue(value: string): TransformStep;

  getType(): TransformType;
  setType(value: TransformType): TransformStep;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TransformStep.AsObject;
  static toObject(includeInstance: boolean, msg: TransformStep): TransformStep.AsObject;
  static serializeBinaryToWriter(message: TransformStep, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TransformStep;
  static deserializeBinaryFromReader(message: TransformStep, reader: jspb.BinaryReader): TransformStep;
}

export namespace TransformStep {
  export type AsObject = {
    path: string,
    value: string,
    type: TransformType,
  }
}

export enum TransformType { 
  TRANSFORM_TYPE_UNKNOWN = 0,
  TRANSFORM_TYPE_REPLACE_VALUE = 1,
  TRANSFORM_TYPE_DELETE_FIELD = 2,
  TRANSFORM_TYPE_OBFUSCATE_VALUE = 3,
  TRANSFORM_TYPE_MASK_VALUE = 4,
}
