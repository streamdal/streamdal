import { PipelineStep } from "@streamdal/protos/protos/sp_pipeline";
import { WASMRequest, WASMResponse } from "@streamdal/protos/protos/sp_wsm";
// eslint-disable-next-line import/no-unresolved
import { WASI } from "wasi";

import { internal } from "./register.js";

const [nodeVersionMajor] = process.versions.node.split(".");

const wasi = new WASI({
  ...(Number(nodeVersionMajor) >= 20 ? { version: "preview1" } : {}),
  preopens: {
    "/sandbox": "./",
  },
} as any);

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
  const importObject = { wasi_snapshot_preview1: wasi.wasiImport };
  internal.wasmModules.set(
    wasmId,
    await WebAssembly.instantiate(wasm, importObject)
  );
};

export const readResponse = (pointer: bigint, buffer: Uint8Array): any => {
  //
  // Shift right by 32 bits to get the start value
  const start = Number(pointer >> BigInt(32));

  //
  // Bitwise AND operation with 0xFFFFFFFF to get the length
  const length = Number(pointer & BigInt(0xffffffff));
  return buffer.slice(start, start + length);
};

export const runWasm = ({
  step,
  data,
}: {
  step: PipelineStep;
  data: Uint8Array;
}) => {
  const request = WASMRequest.create({
    step: {
      name: step.name,
      onSuccess: step.onSuccess,
      onFailure: step.onFailure,
      step: step.step,
    },
    inputPayload: data,
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
