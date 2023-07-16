// Original file: ../../protos/internal_api.proto

import type { CommandType as _protos_CommandType, CommandType__Output as _protos_CommandType__Output } from '../protos/CommandType';
import type { Audience as _protos_Audience, Audience__Output as _protos_Audience__Output } from '../protos/Audience';
import type { SetPipelineCommand as _protos_SetPipelineCommand, SetPipelineCommand__Output as _protos_SetPipelineCommand__Output } from '../protos/SetPipelineCommand';
import type { DeletePipelineCommand as _protos_DeletePipelineCommand, DeletePipelineCommand__Output as _protos_DeletePipelineCommand__Output } from '../protos/DeletePipelineCommand';
import type { PausePipelineCommand as _protos_PausePipelineCommand, PausePipelineCommand__Output as _protos_PausePipelineCommand__Output } from '../protos/PausePipelineCommand';
import type { UnpausePipelineCommand as _protos_UnpausePipelineCommand, UnpausePipelineCommand__Output as _protos_UnpausePipelineCommand__Output } from '../protos/UnpausePipelineCommand';

export interface CommandResponse {
  'type'?: (_protos_CommandType);
  'audience'?: (_protos_Audience | null);
  'setPipeline'?: (_protos_SetPipelineCommand | null);
  'deletePipeline'?: (_protos_DeletePipelineCommand | null);
  'pausePipeline'?: (_protos_PausePipelineCommand | null);
  'unpausePipeline'?: (_protos_UnpausePipelineCommand | null);
  'command'?: "setPipeline"|"deletePipeline"|"pausePipeline"|"unpausePipeline";
}

export interface CommandResponse__Output {
  'type': (_protos_CommandType__Output);
  'audience': (_protos_Audience__Output | null);
  'setPipeline'?: (_protos_SetPipelineCommand__Output | null);
  'deletePipeline'?: (_protos_DeletePipelineCommand__Output | null);
  'pausePipeline'?: (_protos_PausePipelineCommand__Output | null);
  'unpausePipeline'?: (_protos_UnpausePipelineCommand__Output | null);
  'command': "setPipeline"|"deletePipeline"|"pausePipeline"|"unpausePipeline";
}
