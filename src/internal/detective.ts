import { PipelineStepCondition } from "@streamdal/snitch-protos/protos/pipeline.js";
import {
  TransformStep,
  TransformType,
} from "@streamdal/snitch-protos/protos/steps/transform.js";
import {
  WASMRequest,
  WASMResponse,
} from "@streamdal/snitch-protos/protos/wasm.js";
import * as fs from "fs";
// eslint-disable-next-line import/no-unresolved
import { WASI } from "wasi";

import { readResponse } from "./wasm.js";

const wasi = new WASI({
  preopens: {
    "/sandbox": "./",
  },
});

const importObject = { wasi_snapshot_preview1: wasi.wasiImport };

export const examplePayload = {
  boolean_t: true,
  boolean_f: false,
  object: {
    ipv4_address: "127.0.0.1",
    ipv6_address: "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
    mac_address: "00-B0-D0-63-C2-26",
    uuid_dash: "550e8400-e29b-41d4-a716-446655440000",
    uuid_colon: "550e8400:e29b:41d4:a716:446655440000",
    uuid_stripped: "550e8400e29b41d4a716446655440000",
    number_as_string: "1234",
    field: "value",
    empty_string: "",
    null_field: null,
    empty_array: [],
  },
  array: ["value1", "value2"],
  number_int: 100,
  number_float: 100.1,
  timestamp_unix_str: "1614556800",
  timestamp_unix_num: 1614556800,
  timestamp_unix_nano_str: "1614556800000000000",
  timestamp_unix_nano_num: 1614556800000000000,
  timestamp_rfc3339: "2023-06-29T12:34:56Z",
};

export const testDetective = async (data: Uint8Array): Promise<string> => {
  console.info("\n");
  console.info("### start web assembly test");
  const wasm = await WebAssembly.compile(
    fs.readFileSync("./wasm/transform.wasm")
  );
  const instance: any = await WebAssembly.instantiate(wasm, importObject);
  const { exports } = instance;
  const { memory, alloc, f } = exports;

  const request = WASMRequest.create({
    step: {
      name: "some-name",
      onSuccess: [PipelineStepCondition.NOTIFY],
      onFailure: [PipelineStepCondition.NOTIFY],
      WasmId: "some-wasm",
      WasmBytes: new TextEncoder().encode(JSON.stringify("bytes")),
      WasmFunction: "some-func",
      step: {
        oneofKind: "transform",
        transform: TransformStep.create({
          path: "object.ipv4_address",
          value: "batman",
          type: TransformType.MASK_VALUE,
        }),
        // detective: DetectiveStep.create({
        //   path: "object.ipv4_address",
        //   args: undefined,
        //   negate: false,
        //   type: DetectiveType.IPV4_ADDRESS,
        // }),
      },
    },
    input: data,
  });

  console.info("sending the payload to transform/mask step");

  const bytes = WASMRequest.toBinary(request);
  const ptr = alloc(bytes.length);
  const mem = new Uint8Array(memory.buffer, ptr, bytes.length);
  mem.set(bytes);

  const returnPtr = f(ptr, bytes.length);

  const completeBufferFromMemory = new Uint8Array(memory.buffer);
  const content = readResponse(returnPtr, completeBufferFromMemory);

  const resp = WASMResponse.fromBinary(content);
  const output: string = JSON.parse(new TextDecoder().decode(resp.output));
  console.info("### end web assembly test");
  return output;
};
