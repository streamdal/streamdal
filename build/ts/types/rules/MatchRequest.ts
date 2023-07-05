// Original file: ../../protos/rules/matcher.proto

import type { MatchType as _rules_MatchType, MatchType__Output as _rules_MatchType__Output } from '../rules/MatchType';

export interface MatchRequest {
  'data'?: (Buffer | Uint8Array | string);
  'path'?: (string);
  'args'?: (string)[];
  'negate'?: (boolean);
  'type'?: (_rules_MatchType);
}

export interface MatchRequest__Output {
  'data': (Buffer);
  'path': (string);
  'args': (string)[];
  'negate': (boolean);
  'type': (_rules_MatchType__Output);
}
