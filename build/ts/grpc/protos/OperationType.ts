// Original file: ../../protos/grpc_internal.proto

export const OperationType = {
  OPERATION_TYPE_UNSET: 'OPERATION_TYPE_UNSET',
  OPERATION_TYPE_CONSUMER: 'OPERATION_TYPE_CONSUMER',
  OPERATION_TYPE_PRODUCER: 'OPERATION_TYPE_PRODUCER',
} as const;

export type OperationType =
  | 'OPERATION_TYPE_UNSET'
  | 0
  | 'OPERATION_TYPE_CONSUMER'
  | 1
  | 'OPERATION_TYPE_PRODUCER'
  | 2

export type OperationType__Output = typeof OperationType[keyof typeof OperationType]
