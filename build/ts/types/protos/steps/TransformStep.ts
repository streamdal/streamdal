// Original file: ../../protos/steps/transform.proto

import type { TransformType as _protos_steps_TransformType, TransformType__Output as _protos_steps_TransformType__Output } from '../../protos/steps/TransformType';

export interface TransformStep {
  'path'?: (string);
  'value'?: (string);
  'type'?: (_protos_steps_TransformType);
}

export interface TransformStep__Output {
  'path': (string);
  'value': (string);
  'type': (_protos_steps_TransformType__Output);
}
