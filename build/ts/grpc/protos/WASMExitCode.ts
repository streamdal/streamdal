// Original file: ../../protos/pipeline.proto

export const WASMExitCode = {
  WASM_EXIT_CODE_UNSET: 'WASM_EXIT_CODE_UNSET',
  WASM_EXIT_CODE_SUCCESS: 'WASM_EXIT_CODE_SUCCESS',
  WASM_EXIT_CODE_FAILURE: 'WASM_EXIT_CODE_FAILURE',
  WASM_EXIT_CODE_INTERNAL_ERROR: 'WASM_EXIT_CODE_INTERNAL_ERROR',
} as const;

export type WASMExitCode =
  | 'WASM_EXIT_CODE_UNSET'
  | 0
  | 'WASM_EXIT_CODE_SUCCESS'
  | 1
  | 'WASM_EXIT_CODE_FAILURE'
  | 2
  | 'WASM_EXIT_CODE_INTERNAL_ERROR'
  | 3

export type WASMExitCode__Output = typeof WASMExitCode[keyof typeof WASMExitCode]
