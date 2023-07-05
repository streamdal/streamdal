// Original file: ../../protos/rules/transform.proto


export interface TransformResponse {
  'data'?: (Buffer | Uint8Array | string);
  'error'?: (string);
}

export interface TransformResponse__Output {
  'data': (Buffer);
  'error': (string);
}
