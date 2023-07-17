// Original file: ../../protos/pipeline.proto

import type { PipelineStep as _protos_PipelineStep, PipelineStep__Output as _protos_PipelineStep__Output } from '../protos/PipelineStep';

export interface WasmRequest {
  'step'?: (_protos_PipelineStep | null);
  'input'?: (Buffer | Uint8Array | string);
}

export interface WasmRequest__Output {
  'step': (_protos_PipelineStep__Output | null);
  'input': (Buffer);
}
