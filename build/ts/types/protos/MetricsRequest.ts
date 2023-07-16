// Original file: ../../protos/internal_api.proto

import type { Audience as _protos_Audience, Audience__Output as _protos_Audience__Output } from '../protos/Audience';

export interface MetricsRequest {
  'ruleId'?: (string);
  'ruleName'?: (string);
  'audience'?: (_protos_Audience | null);
}

export interface MetricsRequest__Output {
  'ruleId': (string);
  'ruleName': (string);
  'audience': (_protos_Audience__Output | null);
}
