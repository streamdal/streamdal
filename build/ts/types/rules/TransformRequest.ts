// Original file: ../../protos/rules/transform.proto

import type { TransformType as _rules_TransformType, TransformType__Output as _rules_TransformType__Output } from '../rules/TransformType';

export interface TransformRequest {
  'data'?: (Buffer | Uint8Array | string);
  'path'?: (string);
  'value'?: (string);
  'type'?: (_rules_TransformType);
}

export interface TransformRequest__Output {
  'data': (Buffer);
  'path': (string);
  'value': (string);
  'type': (_rules_TransformType__Output);
}
