// Original file: ../../protos/pipeline.proto

import type { PipelineStep as _protos_PipelineStep, PipelineStep__Output as _protos_PipelineStep__Output } from '../protos/PipelineStep';

export interface WASMRequest {
  'step'?: (_protos_PipelineStep | null);
  'input'?: (Buffer | Uint8Array | string);
}

export interface WASMRequest__Output {
  'step': (_protos_PipelineStep__Output | null);
  'input': (Buffer);
}
