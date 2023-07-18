// Original file: ../../protos/internal_api.proto

import type { CommandResponse as _protos_CommandResponse, CommandResponse__Output as _protos_CommandResponse__Output } from '../protos/CommandResponse';
import type { RegisterRequest as _protos_RegisterRequest, RegisterRequest__Output as _protos_RegisterRequest__Output } from '../protos/RegisterRequest';

export interface BusEvent {
  'requestId'?: (string);
  'source'?: (string);
  'commandResponse'?: (_protos_CommandResponse | null);
  'registerRequest'?: (_protos_RegisterRequest | null);
  '_metadata'?: ({[key: string]: string});
  'event'?: "commandResponse"|"registerRequest";
}

export interface BusEvent__Output {
  'requestId': (string);
  'source': (string);
  'commandResponse'?: (_protos_CommandResponse__Output | null);
  'registerRequest'?: (_protos_RegisterRequest__Output | null);
  '_metadata': ({[key: string]: string});
  'event': "commandResponse"|"registerRequest";
}
