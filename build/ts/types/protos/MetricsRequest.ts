// Original file: ../../protos/internal_api.proto

import type { Auth as _protos_Auth, Auth__Output as _protos_Auth__Output } from '../protos/Auth';
import type { Audience as _protos_Audience, Audience__Output as _protos_Audience__Output } from '../protos/Audience';

export interface MetricsRequest {
  'auth'?: (_protos_Auth | null);
  'ruleId'?: (string);
  'ruleName'?: (string);
  'audience'?: (_protos_Audience | null);
  '_id'?: (string);
  '_sdkMetadata'?: ({[key: string]: string});
}

export interface MetricsRequest__Output {
  'auth': (_protos_Auth__Output | null);
  'ruleId': (string);
  'ruleName': (string);
  'audience': (_protos_Audience__Output | null);
  '_id': (string);
  '_sdkMetadata': ({[key: string]: string});
}
