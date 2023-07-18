import * as jspb from 'google-protobuf'



export class DecodeStep extends jspb.Message {
  getId(): string;
  setId(value: string): DecodeStep;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DecodeStep.AsObject;
  static toObject(includeInstance: boolean, msg: DecodeStep): DecodeStep.AsObject;
  static serializeBinaryToWriter(message: DecodeStep, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DecodeStep;
  static deserializeBinaryFromReader(message: DecodeStep, reader: jspb.BinaryReader): DecodeStep;
}

export namespace DecodeStep {
  export type AsObject = {
    id: string,
  }
}

