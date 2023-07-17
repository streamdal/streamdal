// Original file: ../../protos/pipeline.proto

export const PipelineStepCondition = {
  CONDITION_UNSET: 'CONDITION_UNSET',
  CONDITION_CONTINUE: 'CONDITION_CONTINUE',
  CONDITION_ABORT: 'CONDITION_ABORT',
  CONDITION_NOTIFY: 'CONDITION_NOTIFY',
} as const;

export type PipelineStepCondition =
  | 'CONDITION_UNSET'
  | 0
  | 'CONDITION_CONTINUE'
  | 1
  | 'CONDITION_ABORT'
  | 2
  | 'CONDITION_NOTIFY'
  | 3

export type PipelineStepCondition__Output = typeof PipelineStepCondition[keyof typeof PipelineStepCondition]
