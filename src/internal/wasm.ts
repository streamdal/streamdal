// eslint-disable-next-line import/no-unresolved
import { PipelineStep } from "@streamdal/protos/protos/sp_pipeline";
import { WASMRequest, WASMResponse } from "@streamdal/protos/protos/sp_wsm";
// eslint-disable-next-line import/no-unresolved
import { WASI } from "wasi";

const [nodeVersionMajor] = process.versions.node.split(".");

const wasi = new WASI({
  ...(Number(nodeVersionMajor) >= 20 ? { version: "preview1" } : {}),
  preopens: {
    "/sandbox": "./",
  },
} as any);

export const readResponse = (pointer: number, buffer: Uint8Array) => {
  let nullHits = 0;
  const data = [];

  for (let i = pointer; i < buffer.length; i++) {
    //
    // Have three nulls in a row, can quit
    if (nullHits === 3) {
      break;
    }

    // Don't have a length, have to see if we hit three sequential terminators
    if (buffer[i] === 166) {
      nullHits++;
      continue;
    }

    // Not a terminator, reset null hits
    nullHits = 0;
    data.push(buffer[i]);
  }

  return new Uint8Array(data);
};

export const runWasm = async ({
  step,
  data,
}: {
  step: PipelineStep;
  data: Uint8Array;
}) => {
  if (!step.WasmBytes || !step.WasmFunction) {
    throw Error(`No wasm function found for step ${step.name}`);
  }

  const wasm = await WebAssembly.compile(step.WasmBytes);
  const importObject = { wasi_snapshot_preview1: wasi.wasiImport };
  const instance: any = await WebAssembly.instantiate(wasm, importObject);
  const { exports } = instance;
  const { memory, alloc, [step.WasmFunction]: f } = exports;

  const request = WASMRequest.create({
    step: {
      name: step.name,
      onSuccess: step.onSuccess,
      onFailure: step.onFailure,
      step: step.step,
    },
    inputPayload: data,
  });

  const requestBytes = WASMRequest.toBinary(request);

  const ptr = alloc(requestBytes.length);
  const mem = new Uint8Array(memory.buffer, ptr, requestBytes.length);
  mem.set(requestBytes);

  const returnPtr = f(ptr, requestBytes.length);

  const completeBufferFromMemory = new Uint8Array(memory.buffer);
  const response = readResponse(returnPtr, completeBufferFromMemory);
  const decodedResponse = WASMResponse.fromBinary(response);
  return decodedResponse;
};
