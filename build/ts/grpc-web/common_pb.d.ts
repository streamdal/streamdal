import * as jspb from 'google-protobuf'



export class StandardResponse extends jspb.Message {
  getId(): string;
  setId(value: string): StandardResponse;

  getCode(): ResponseCode;
  setCode(value: ResponseCode): StandardResponse;

  getMessage(): string;
  setMessage(value: string): StandardResponse;

  getMetadataMap(): jspb.Map<string, string>;
  clearMetadataMap(): StandardResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StandardResponse.AsObject;
  static toObject(includeInstance: boolean, msg: StandardResponse): StandardResponse.AsObject;
  static serializeBinaryToWriter(message: StandardResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StandardResponse;
  static deserializeBinaryFromReader(message: StandardResponse, reader: jspb.BinaryReader): StandardResponse;
}

export namespace StandardResponse {
  export type AsObject = {
    id: string,
    code: ResponseCode,
    message: string,
    metadataMap: Array<[string, string]>,
  }
}

export enum ResponseCode { 
  RESPONSE_CODE_UNSET = 0,
  RESPONSE_CODE_OK = 1,
  RESPONSE_CODE_BAD_REQUEST = 2,
  RESPONSE_CODE_NOT_FOUND = 3,
  RESPONSE_CODE_INTERNAL_SERVER_ERROR = 4,
  RESPONSE_CODE_GENERIC_ERROR = 5,
}
