import { Command, TailCommand } from "@streamdal/protos/protos/sp_command";
import { Audience, TailRequestType } from "@streamdal/protos/protos/sp_common";
import { GetAttachCommandsByServiceResponse } from "@streamdal/protos/protos/sp_internal";
import { Pipeline, PipelineStep } from "@streamdal/protos/protos/sp_pipeline";

import { Configs } from "../streamdal.js";
import { audienceKey, internal, TailStatus } from "./register.js";
import { instantiateWasm } from "./wasm.js";

export type InternalPipeline = Pipeline & {
  paused?: boolean;
};

export const initPipelines = async (configs: Configs) => {
  try {
    if (internal.pipelineInitialized) {
      return;
    }

    console.debug("initializing pipelines");
    const { response }: { response: GetAttachCommandsByServiceResponse } =
      await configs.grpcClient.getAttachCommandsByService(
        {
          serviceName: configs.serviceName.toLowerCase(),
        },
        { meta: { "auth-token": configs.streamdalToken } }
      );

    for await (const [k, v] of Object.entries(response.wasmModules)) {
      await instantiateWasm(k, v.bytes);
    }

    for await (const command of response.active) {
      await processResponse(command);
    }
    internal.pipelineInitialized = true;
  } catch (e) {
    console.error("Error initializing pipelines", e);
  }
};

export const processResponse = async (response: Command) => {
  if (!response.audience) {
    response.command.oneofKind !== "keepAlive" &&
      console.debug("command response has no audience, ignoring");
    return;
  }

  switch (response.command.oneofKind) {
    case "attachPipeline":
      response.command.attachPipeline.pipeline &&
        (await attachPipeline(
          response.audience,
          response.command.attachPipeline.pipeline
        ));
      break;
    case "detachPipeline":
      detachPipeline(
        response.audience,
        response.command.detachPipeline.pipelineId
      );
      break;
    case "pausePipeline":
      togglePausePipeline(
        response.audience,
        response.command.pausePipeline.pipelineId,
        true
      );
      break;
    case "resumePipeline":
      togglePausePipeline(
        response.audience,
        response.command.resumePipeline.pipelineId,
        false
      );
      break;
    case "tail":
      tailPipeline(response.audience, response.command.tail);
      break;
  }
};

export const buildPipeline = async (pipeline: Pipeline): Promise<Pipeline> => {
  return {
    ...pipeline,
    steps: await Promise.all(
      pipeline.steps.map(async (step: PipelineStep) => {
        await instantiateWasm(step.WasmId, step.WasmBytes);
        return {
          ...step,
          WasmBytes: undefined,
        };
      })
    ),
  };
};

export const attachPipeline = async (
  audience: Audience,
  pipeline: Pipeline
) => {
  const key = audienceKey(audience);
  const existing = internal.pipelines.get(key);
  const built = await buildPipeline(pipeline);
  internal.pipelines.set(
    key,
    existing
      ? existing.set(pipeline.id, built)
      : new Map([[pipeline.id, built]])
  );
};

export const detachPipeline = (audience: Audience, pipelineId: string) =>
  internal.pipelines.get(audienceKey(audience))?.delete(pipelineId);

export const togglePausePipeline = (
  audience: Audience,
  pipelineId: string,
  paused: boolean
) => {
  const key = audienceKey(audience);
  const existing = internal.pipelines.get(key);
  const p = existing?.get(pipelineId);
  existing &&
    p &&
    internal.pipelines.set(key, existing.set(p.id, { ...p, paused }));
};

export const tailPipeline = (audience: Audience, { request }: TailCommand) => {
  console.debug("received a tail command for audience", audience);
  if (!request) {
    console.debug("no tail reqeuest details specified, skipping");
    return;
  }

  switch (request.type) {
    case TailRequestType.START: {
      console.debug(
        "received a START tail: adding entry to audiences for tail id",
        audience
      );
      // Create inner map if it doesn't exist
      if (!internal.audiences.has(audienceKey(audience))) {
        internal.audiences.set(audienceKey(audience), {
          audience,
          tails: new Map<string, TailStatus>(),
        });
      }
      // Add entry (@JH, OK if overwritten?)
      request.id &&
        internal.audiences.get(audienceKey(audience))?.tails.set(request.id, {
          tail: request.type === TailRequestType.START,
          tailRequestId: request.id,
        });
      break;
    }
    case TailRequestType.STOP: {
      console.debug(
        "received a STOP tail: removing entry from audiences for tail id",
        request.id
      );
      request.id &&
        internal.audiences.get(audienceKey(audience))?.tails.delete(request.id);
      break;
    }
    default:
      console.error("unknown tail request type ", request.type);
      break;
  }
};
