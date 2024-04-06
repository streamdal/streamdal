import { WasmModule } from "@streamdal/protos/protos/shared/sp_shared";
import { PipelineStep } from "@streamdal/protos/protos/sp_pipeline";
import {
  InterStepResult,
  WASMExitCode,
  WASMRequest,
  WASMResponse,
} from "@streamdal/protos/protos/sp_wsm";
// eslint-disable-next-line import/no-unresolved
import { WASI } from "wasi";

import { kvExists } from "./kv.js";
import { MAX_PAYLOAD_SIZE } from "./process.js";
import { internal } from "./register.js";

const [nodeVersionMajor] = process.versions.node.split(".");

const wasi = new WASI({
  ...(Number(nodeVersionMajor) >= 20 ? { version: "preview1" } : {}),
  preopens: {
    "/sandbox": "./",
  },
} as any);

//
// We bypass wasm for some things in node (async) but we still
// need to have a host function mapped so wasm instantiation
// doesn't blow up.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const hostFunctionNOOP = (_: any, __: number, ____: number): bigint =>
  BigInt(0);

export const setWASM = async (wasmModules: Record<string, WasmModule>) => {
  for await (const [k, v] of Object.entries(wasmModules)) {
    await instantiateWasm(k, v.bytes);
  }
};

export const instantiateWasm = async (
  wasmId?: string,
  wasmBytes?: Uint8Array
) => {
  if (!wasmId || !wasmBytes || wasmBytes.length === 0) {
    console.debug("Wasm info missing, skipping instantiation, .");
    return;
  }

  if (internal.wasmModules.has(wasmId)) {
    console.debug("Wasm exists, skipping instantiation");
    return;
  }

  const wasm = await WebAssembly.compile(wasmBytes);
  const instantiated = await WebAssembly.instantiate(wasm, {
    wasi_snapshot_preview1: wasi.wasiImport,
    env: {
      kvExists: (pointer: number, length: number): bigint =>
        kvExists(instantiated.exports, pointer, length),
      httpRequest: (pointer: number, length: number): bigint =>
        hostFunctionNOOP(instantiated.exports, pointer, length),
    },
  });
  internal.wasmModules.set(wasmId, instantiated);
};

const readResponse = (pointer: bigint, buffer: Uint8Array): any => {
  //
  // Shift right by 32 bits to get the start value
  const start = Number(pointer >> BigInt(32));

  //
  // Bitwise AND operation with 0xFFFFFFFF to get the length
  const length = Number(pointer & BigInt(0xffffffff));
  return buffer.slice(start, start + length);
};

export const writeResponse = (pointer: number, length: number): bigint => {
  //
  // Left shift the pointer value by 32 bits
  const start = BigInt(pointer) << BigInt(32);

  //
  // Combine the shifted start and length using bitwise OR
  return start | BigInt(length);
};

export const runWasm = ({
  step,
  originalData,
  interStepResult,
}: {
  step: PipelineStep;
  originalData: Uint8Array;
  interStepResult?: InterStepResult;
}) => {
  if (originalData.length > MAX_PAYLOAD_SIZE) {
    return {
      outputStep: null,
      outputPayload: new Uint8Array(),
      exitCode: WASMExitCode.WASM_EXIT_CODE_ERROR,
      exitMsg: "Payload exceeds maximum size",
      interStepResult: undefined,
    };
  }

  const request = WASMRequest.create({
    step: {
      name: step.name,
      step: step.step,
      dynamic: step.dynamic,
    },
    inputPayload: originalData,
    interStepResult,
  });

  const { exports } = internal.wasmModules.get(step.WasmId!);
  const { memory, alloc, [step.WasmFunction!]: f } = exports;

  const requestBytes = WASMRequest.toBinary(request);

  const ptr = alloc(requestBytes.length);
  const mem = new Uint8Array(memory.buffer, ptr, requestBytes.length);
  mem.set(requestBytes);

  const returnPtr = BigInt(f(ptr, requestBytes.length));
  const response = readResponse(returnPtr, new Uint8Array(memory.buffer));
  return WASMResponse.fromBinary(response);
};
