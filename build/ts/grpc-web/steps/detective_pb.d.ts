import * as jspb from 'google-protobuf'



export class DetectiveStep extends jspb.Message {
  getPath(): string;
  setPath(value: string): DetectiveStep;

  getArgsList(): Array<string>;
  setArgsList(value: Array<string>): DetectiveStep;
  clearArgsList(): DetectiveStep;
  addArgs(value: string, index?: number): DetectiveStep;

  getNegate(): boolean;
  setNegate(value: boolean): DetectiveStep;

  getType(): DetectiveType;
  setType(value: DetectiveType): DetectiveStep;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DetectiveStep.AsObject;
  static toObject(includeInstance: boolean, msg: DetectiveStep): DetectiveStep.AsObject;
  static serializeBinaryToWriter(message: DetectiveStep, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DetectiveStep;
  static deserializeBinaryFromReader(message: DetectiveStep, reader: jspb.BinaryReader): DetectiveStep;
}

export namespace DetectiveStep {
  export type AsObject = {
    path: string,
    argsList: Array<string>,
    negate: boolean,
    type: DetectiveType,
  }
}

export enum DetectiveType { 
  DETECTIVE_TYPE_UNKNOWN = 0,
  DETECTIVE_TYPE_IS_EMPTY = 1000,
  DETECTIVE_TYPE_HAS_FIELD = 1001,
  DETECTIVE_TYPE_IS_TYPE = 1002,
  DETECTIVE_TYPE_STRING_CONTAINS_ANY = 1003,
  DETECTIVE_TYPE_STRING_CONTAINS_ALL = 1004,
  DETECTIVE_TYPE_STRING_EQUAL = 1005,
  DETECTIVE_TYPE_IPV4_ADDRESS = 1006,
  DETECTIVE_TYPE_IPV6_ADDRESS = 1007,
  DETECTIVE_TYPE_MAC_ADDRESS = 1008,
  DETECTIVE_TYPE_REGEX = 1009,
  DETECTIVE_TYPE_TIMESTAMP_RFC3339 = 1010,
  DETECTIVE_TYPE_TIMESTAMP_UNIX_NANO = 1011,
  DETECTIVE_TYPE_TIMESTAMP_UNIX = 1012,
  DETECTIVE_TYPE_BOOLEAN_TRUE = 1013,
  DETECTIVE_TYPE_BOOLEAN_FALSE = 1014,
  DETECTIVE_TYPE_UUID = 1015,
  DETECTIVE_TYPE_URL = 1016,
  DETECTIVE_TYPE_HOSTNAME = 1017,
  DETECTIVE_TYPE_STRING_LENGTH_MIN = 1018,
  DETECTIVE_TYPE_STRING_LENGTH_MAX = 1019,
  DETECTIVE_TYPE_STRING_LENGTH_RANGE = 1020,
  DETECTIVE_TYPE_SEMVER = 2021,
  DETECTIVE_TYPE_PII_ANY = 2000,
  DETECTIVE_TYPE_PII_CREDIT_CARD = 2001,
  DETECTIVE_TYPE_PII_SSN = 2002,
  DETECTIVE_TYPE_PII_EMAIL = 2003,
  DETECTIVE_TYPE_PII_PHONE = 2004,
  DETECTIVE_TYPE_PII_DRIVER_LICENSE = 2005,
  DETECTIVE_TYPE_PII_PASSPORT_ID = 2006,
  DETECTIVE_TYPE_PII_VIN_NUMBER = 2007,
  DETECTIVE_TYPE_PII_SERIAL_NUMBER = 2008,
  DETECTIVE_TYPE_PII_LOGIN = 2009,
  DETECTIVE_TYPE_PII_TAXPAYER_ID = 2010,
  DETECTIVE_TYPE_PII_ADDRESS = 2011,
  DETECTIVE_TYPE_PII_SIGNATURE = 2012,
  DETECTIVE_TYPE_PII_GEOLOCATION = 2013,
  DETECTIVE_TYPE_PII_EDUCATION = 2014,
  DETECTIVE_TYPE_PII_FINANCIAL = 2015,
  DETECTIVE_TYPE_PII_HEALTH = 2016,
  DETECTIVE_TYPE_NUMERIC_EQUAL_TO = 3000,
  DETECTIVE_TYPE_NUMERIC_GREATER_THAN = 3001,
  DETECTIVE_TYPE_NUMERIC_GREATER_EQUAL = 3002,
  DETECTIVE_TYPE_NUMERIC_LESS_THAN = 3003,
  DETECTIVE_TYPE_NUMERIC_LESS_EQUAL = 3004,
  DETECTIVE_TYPE_NUMERIC_RANGE = 3005,
  DETECTIVE_TYPE_NUMERIC_MIN = 3006,
  DETECTIVE_TYPE_NUMERIC_MAX = 3007,
}
