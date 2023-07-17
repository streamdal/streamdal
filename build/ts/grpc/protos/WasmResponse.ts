// Original file: ../../protos/pipeline.proto

import type { WASMExitCode as _protos_WASMExitCode, WASMExitCode__Output as _protos_WASMExitCode__Output } from '../protos/WASMExitCode';

export interface WasmResponse {
  'output'?: (Buffer | Uint8Array | string);
  'exitCode'?: (_protos_WASMExitCode);
  'exitMsg'?: (string);
}

export interface WasmResponse__Output {
  'output': (Buffer);
  'exitCode': (_protos_WASMExitCode__Output);
  'exitMsg': (string);
}
