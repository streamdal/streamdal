// Original file: ../../protos/common.proto

import type { ResponseCode as _protos_ResponseCode, ResponseCode__Output as _protos_ResponseCode__Output } from '../protos/ResponseCode';

export interface StandardResponse {
  'id'?: (string);
  'code'?: (_protos_ResponseCode);
  'message'?: (string);
  '_metadata'?: ({[key: string]: string});
}

export interface StandardResponse__Output {
  'id': (string);
  'code': (_protos_ResponseCode__Output);
  'message': (string);
  '_metadata': ({[key: string]: string});
}
