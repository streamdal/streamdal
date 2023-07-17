// Original file: ../../protos/grpc_internal.proto

import type { Auth as _protos_Auth, Auth__Output as _protos_Auth__Output } from '../protos/Auth';

export interface RegisterRequest {
  'auth'?: (_protos_Auth | null);
  'serviceName'?: (string);
  'dryRun'?: (boolean);
  '_id'?: (string);
  '_sdkMetadata'?: ({[key: string]: string});
}

export interface RegisterRequest__Output {
  'auth': (_protos_Auth__Output | null);
  'serviceName': (string);
  'dryRun': (boolean);
  '_id': (string);
  '_sdkMetadata': ({[key: string]: string});
}
