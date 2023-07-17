// Original file: ../../protos/internal_api.proto

import type { Audience as _protos_Audience, Audience__Output as _protos_Audience__Output } from '../protos/Audience';
import type { Long } from '@grpc/proto-loader';

export interface HeartbeatRequest {
  'audience'?: (_protos_Audience | null);
  'lastActivityUnixTimestampUtc'?: (number | string | Long);
}

export interface HeartbeatRequest__Output {
  'audience': (_protos_Audience__Output | null);
  'lastActivityUnixTimestampUtc': (string);
}
