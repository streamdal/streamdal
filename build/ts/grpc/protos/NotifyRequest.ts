// Original file: ../../protos/grpc_internal.proto

import type { Auth as _protos_Auth, Auth__Output as _protos_Auth__Output } from '../protos/Auth';
import type { Audience as _protos_Audience, Audience__Output as _protos_Audience__Output } from '../protos/Audience';
import type { Long } from '@grpc/proto-loader';

export interface NotifyRequest {
  'auth'?: (_protos_Auth | null);
  'ruleId'?: (string);
  'ruleName'?: (string);
  'audience'?: (_protos_Audience | null);
  'occurredAtUnixTsUtc'?: (number | string | Long);
  '_id'?: (string);
  '_sdkMetadata'?: ({[key: string]: string});
}

export interface NotifyRequest__Output {
  'auth': (_protos_Auth__Output | null);
  'ruleId': (string);
  'ruleName': (string);
  'audience': (_protos_Audience__Output | null);
  'occurredAtUnixTsUtc': (string);
  '_id': (string);
  '_sdkMetadata': ({[key: string]: string});
}
