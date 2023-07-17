// Original file: ../../protos/internal_api.proto

import type { Audience as _protos_Audience, Audience__Output as _protos_Audience__Output } from '../protos/Audience';
import type { Long } from '@grpc/proto-loader';

export interface NotifyRequest {
  'ruleId'?: (string);
  'ruleName'?: (string);
  'audience'?: (_protos_Audience | null);
  'occurredAtUnixTsUtc'?: (number | string | Long);
}

export interface NotifyRequest__Output {
  'ruleId': (string);
  'ruleName': (string);
  'audience': (_protos_Audience__Output | null);
  'occurredAtUnixTsUtc': (string);
}
