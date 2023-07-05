// Original file: ../../protos/rules/transform.proto

export const TransformType = {
  TRANSFORM_TYPE_UNKNOWN: 'TRANSFORM_TYPE_UNKNOWN',
  TRANSFORM_TYPE_REPLACE_VALUE: 'TRANSFORM_TYPE_REPLACE_VALUE',
  TRANSFORM_TYPE_DELETE_FIELD: 'TRANSFORM_TYPE_DELETE_FIELD',
  TRANSFORM_TYPE_OBFUSCATE_VALUE: 'TRANSFORM_TYPE_OBFUSCATE_VALUE',
} as const;

export type TransformType =
  | 'TRANSFORM_TYPE_UNKNOWN'
  | 0
  | 'TRANSFORM_TYPE_REPLACE_VALUE'
  | 1
  | 'TRANSFORM_TYPE_DELETE_FIELD'
  | 2
  | 'TRANSFORM_TYPE_OBFUSCATE_VALUE'
  | 3

export type TransformType__Output = typeof TransformType[keyof typeof TransformType]
