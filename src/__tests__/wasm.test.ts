import { Command } from "@streamdal/protos/protos/sp_command";
import { InternalClient } from "@streamdal/protos/protos/sp_internal.client";
import { Pipeline } from "@streamdal/protos/protos/sp_pipeline";
import * as fs from "fs";
import sinon from "sinon";
import { v4 as uuidv4 } from "uuid";
import { describe, expect, it } from "vitest";

import { initPipelines } from "../internal/pipeline.js";
import { processPipeline } from "../internal/process.js";
import { audienceKey, internal } from "../internal/register.js";
import { ExecStatus } from "../streamdal.js";

const testData = {
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
    email: "test@streamdal.com"
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

const testConfigs = {
  registered: true,
  grpcClient: {
    getSetPipelinesCommandsByService: () => ({
      setPipelineCommands: [],
    }),
  } as unknown as InternalClient,
  sessionId: uuidv4(),
  streamdalUrl: "localhost:8082",
  streamdalToken: "1234",
  serviceName: "test-service",
  pipelineTimeout: "100",
  stepTimeout: "10",
  dryRun: false,
  audiences: [],
};

const testAudience = {
  serviceName: "test-service",
  componentName: "kafka",
  operationType: 1,
  operationName: "kafka-consumer",
};

const testPipeline: Pipeline = {
  id: "7a04056d-52ae-467e-ab43-2a82a2c90284",
  name: "test-pipeline",
  steps: [
    {
      name: "test-step",
      dynamic: false,
      step: {
        oneofKind: "detective",
        detective: { args: [], type: 1001, path: "object.field", negate: false },
      },
      WasmId: "testDetectiveWasm",
      WasmFunction: "f",
    },
  ],
  NotificationConfigs: [],
};

const testAttachCommand: Command = {
  command: {
    oneofKind: "setPipelines",
    setPipelines: {
      pipelines: [testPipeline],
    },
  },
  audience: testAudience,
};

const testGetSetPipelinesCommandsByServiceResponse = {
  response: {
    setPipelineCommands : [testAttachCommand],
    wasmModules: { testDetectiveWasm: { id: "test", bytes: new Uint8Array() } },
  },
};


describe("wasm tests", async () => {
  const key = audienceKey(testAudience);
  const wasm = fs.readFileSync("./src/__tests__/wasm/detective.wasm");

  testGetSetPipelinesCommandsByServiceResponse.response.wasmModules.testDetectiveWasm.bytes =
    wasm;

  it("init attach command should load pipeline wasm into internal store", async () => {
    sinon
      .stub(testConfigs.grpcClient, "getSetPipelinesCommandsByService")
      .resolves(testGetSetPipelinesCommandsByServiceResponse as any);

    await initPipelines(testConfigs);

    expect(internal.wasmModules.has("testDetectiveWasm")).toEqual(true);
  });

  it("attached pipeline detective step should execute wasm", async () => {
    internal.pipelines.set(key, new Map([[testPipeline.id, testPipeline]]));
    const result = processPipeline({
      originalData: new TextEncoder().encode(JSON.stringify(testData)),
      audience: testAudience,
      configs: testConfigs,
      pipeline: testPipeline,
    });

    expect(result?.pipelineStatus?.stepStatus?.at(-1)?.status).toEqual(ExecStatus.TRUE);
  });

});
