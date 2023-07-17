// Original file: ../../protos/pipeline.proto

import type { PipelineStep as _protos_PipelineStep, PipelineStep__Output as _protos_PipelineStep__Output } from '../protos/PipelineStep';

export interface SetPipelineCommand {
  'id'?: (string);
  'name'?: (string);
  'steps'?: (_protos_PipelineStep)[];
}

export interface SetPipelineCommand__Output {
  'id': (string);
  'name': (string);
  'steps': (_protos_PipelineStep__Output)[];
}
