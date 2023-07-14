// Original file: ../../protos/grpc_internal.proto

import type { OperationType as _protos_OperationType, OperationType__Output as _protos_OperationType__Output } from '../protos/OperationType';

export interface Audience {
  'serviceName'?: (string);
  'componentName'?: (string);
  'operationType'?: (_protos_OperationType);
}

export interface Audience__Output {
  'serviceName': (string);
  'componentName': (string);
  'operationType': (_protos_OperationType__Output);
}
