// Original file: ../../protos/steps/detective.proto

import type { DetectiveType as _protos_steps_DetectiveType, DetectiveType__Output as _protos_steps_DetectiveType__Output } from '../../protos/steps/DetectiveType';

export interface DetectiveStep {
  'path'?: (string);
  'args'?: (string)[];
  'negate'?: (boolean);
  'type'?: (_protos_steps_DetectiveType);
}

export interface DetectiveStep__Output {
  'path': (string);
  'args': (string)[];
  'negate': (boolean);
  'type': (_protos_steps_DetectiveType__Output);
}
