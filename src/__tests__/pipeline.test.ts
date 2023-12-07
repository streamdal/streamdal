import { Command } from "@streamdal/protos/protos/sp_command";
import { InternalClient } from "@streamdal/protos/protos/sp_internal.client";
import { Pipeline } from "@streamdal/protos/protos/sp_pipeline";
import sinon from "sinon";
import { v4 as uuidv4 } from "uuid";
import { describe, expect, it } from "vitest";

import { initPipelines, processResponse } from "../internal/pipeline.js";
import { audienceKey, internal } from "../internal/register.js";

const testConfigs = {
  registered: true,
  grpcClient: {
    getAttachCommandsByService: () => ({
      active: [],
      paused: [],
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
      onSuccess: [],
      onFailure: [],
      step: {
        oneofKind: "detective",
        detective: { args: [], type: 1013, path: "object.field" },
      },
    },
  ],
};
const testAttachCommand: Command = {
  command: {
    oneofKind: "attachPipeline",
    attachPipeline: {
      pipeline: testPipeline,
    },
  },
  audience: testAudience,
};

const testDetachCommand: Command = {
  command: {
    oneofKind: "detachPipeline",
    detachPipeline: {
      pipelineId: testPipeline.id,
    },
  },
  audience: testAudience,
};

const testPauseCommand: Command = {
  command: {
    oneofKind: "pausePipeline",
    pausePipeline: {
      pipelineId: testPipeline.id,
    },
  },
  audience: testAudience,
};

const testResumeCommand: Command = {
  command: {
    oneofKind: "resumePipeline",
    resumePipeline: {
      pipelineId: testPipeline.id,
    },
  },
  audience: testAudience,
};

const testAttachCommandByServiceResponse = {
  response: {
    active: [testAttachCommand],
    paused: [],
    wasmModules: { test: { id: "test", bytes: new Uint8Array() } },
  },
};

describe("pipeline tests", () => {
  const key = audienceKey(testAudience);
  it("initPipelines should add a given pipeline to internal store and set pipelineInitialized ", async () => {
    sinon
      .stub(testConfigs.grpcClient, "getAttachCommandsByService")
      .resolves(testAttachCommandByServiceResponse as any);

    await initPipelines(testConfigs);

    expect(internal.pipelines.has(key)).toEqual(true);
    expect(internal.pipelineInitialized).toEqual(true);
  });

  describe("processResponse", () => {
    it("attach command should add pipeline to internal store", async () => {
      await processResponse(testAttachCommand);
      expect(internal.pipelines.has(key)).toEqual(true);

      const pipelines = internal.pipelines.get(key);
      expect(pipelines?.has(testPipeline.id)).toEqual(true);
    });

    it("detach command should remove pipeline from internal store", async () => {
      internal.pipelines.set(key, new Map([[testPipeline.id, testPipeline]]));
      await processResponse(testDetachCommand);

      expect(internal.pipelines.get(key)?.has(testPipeline.id)).toEqual(false);
    });

    it("pause command should flag pipeline as paused in internal store", async () => {
      internal.pipelines.set(
        key,
        new Map([[testPipeline.id, { ...testPipeline, paused: false }]])
      );

      await processResponse(testPauseCommand);

      expect(internal.pipelines.get(key)?.get(testPipeline.id)?.paused).toEqual(
        true
      );
    });

    it("resume command should flag pipeline as not paused in internal store", async () => {
      internal.pipelines.set(
        key,
        new Map([[testPipeline.id, { ...testPipeline, paused: true }]])
      );
      await processResponse(testResumeCommand);

      expect(internal.pipelines.get(key)?.get(testPipeline.id)?.paused).toEqual(
        false
      );
    });
  });
});
