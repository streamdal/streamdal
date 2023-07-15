// Original file: ../../protos/internal_api.proto

import type { Auth as _protos_Auth, Auth__Output as _protos_Auth__Output } from '../protos/Auth';
import type { Audience as _protos_Audience, Audience__Output as _protos_Audience__Output } from '../protos/Audience';
import type { Long } from '@grpc/proto-loader';

export interface HeartbeatRequest {
  'auth'?: (_protos_Auth | null);
  'audience'?: (_protos_Audience | null);
  'lastActivityUnixTimestampUtc'?: (number | string | Long);
  '_id'?: (string);
  '_sdkMetadata'?: ({[key: string]: string});
}

export interface HeartbeatRequest__Output {
  'auth': (_protos_Auth__Output | null);
  'audience': (_protos_Audience__Output | null);
  'lastActivityUnixTimestampUtc': (string);
  '_id': (string);
  '_sdkMetadata': ({[key: string]: string});
}
