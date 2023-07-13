// Original file: ../../protos/pipeline.proto

export const PipelineStepStatus = {
  PIPELINE_STEP_STATUS_UNSET: 'PIPELINE_STEP_STATUS_UNSET',
  PIPELINE_STEP_STATUS_SUCCESS: 'PIPELINE_STEP_STATUS_SUCCESS',
  PIPELINE_STEP_STATUS_FAILURE: 'PIPELINE_STEP_STATUS_FAILURE',
  PIPELINE_STEP_STATUS_ERROR: 'PIPELINE_STEP_STATUS_ERROR',
} as const;

export type PipelineStepStatus =
  | 'PIPELINE_STEP_STATUS_UNSET'
  | 0
  | 'PIPELINE_STEP_STATUS_SUCCESS'
  | 1
  | 'PIPELINE_STEP_STATUS_FAILURE'
  | 2
  | 'PIPELINE_STEP_STATUS_ERROR'
  | 3

export type PipelineStepStatus__Output = typeof PipelineStepStatus[keyof typeof PipelineStepStatus]
