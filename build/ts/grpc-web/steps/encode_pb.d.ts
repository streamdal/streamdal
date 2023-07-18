import * as jspb from 'google-protobuf'



export class EncodeStep extends jspb.Message {
  getId(): string;
  setId(value: string): EncodeStep;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): EncodeStep.AsObject;
  static toObject(includeInstance: boolean, msg: EncodeStep): EncodeStep.AsObject;
  static serializeBinaryToWriter(message: EncodeStep, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): EncodeStep;
  static deserializeBinaryFromReader(message: EncodeStep, reader: jspb.BinaryReader): EncodeStep;
}

export namespace EncodeStep {
  export type AsObject = {
    id: string,
  }
}

