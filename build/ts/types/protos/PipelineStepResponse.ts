// Original file: ../../protos/pipeline.proto

import type { PipelineStepStatus as _protos_PipelineStepStatus, PipelineStepStatus__Output as _protos_PipelineStepStatus__Output } from '../protos/PipelineStepStatus';

export interface PipelineStepResponse {
  'output'?: (Buffer | Uint8Array | string);
  'status'?: (_protos_PipelineStepStatus);
  'statusMessage'?: (string);
}

export interface PipelineStepResponse__Output {
  'output': (Buffer);
  'status': (_protos_PipelineStepStatus__Output);
  'statusMessage': (string);
}
