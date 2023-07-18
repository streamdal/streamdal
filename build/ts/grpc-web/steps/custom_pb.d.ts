import * as jspb from 'google-protobuf'



export class CustomStep extends jspb.Message {
  getId(): string;
  setId(value: string): CustomStep;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CustomStep.AsObject;
  static toObject(includeInstance: boolean, msg: CustomStep): CustomStep.AsObject;
  static serializeBinaryToWriter(message: CustomStep, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CustomStep;
  static deserializeBinaryFromReader(message: CustomStep, reader: jspb.BinaryReader): CustomStep;
}

export namespace CustomStep {
  export type AsObject = {
    id: string,
  }
}

