// Original file: ../../protos/pipeline.proto

import type { ResponseStatus as _protos_ResponseStatus, ResponseStatus__Output as _protos_ResponseStatus__Output } from '../protos/ResponseStatus';

export interface UnpausePipelineResponse {
  'id'?: (string);
  'status'?: (_protos_ResponseStatus);
  'message'?: (string);
}

export interface UnpausePipelineResponse__Output {
  'id': (string);
  'status': (_protos_ResponseStatus__Output);
  'message': (string);
}
