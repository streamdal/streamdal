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

export type EnhancedStep = PipelineStep & {
  pipelineId: string;
  pipelineName: string;
};

export const initPipelines = async (configs: Configs) => {
  try {
    console.debug("initializing pipelines");
    const { response }: { response: GetAttachCommandsByServiceResponse } =
      await configs.grpcClient.getAttachCommandsByService(
        {
          serviceName: configs.serviceName.toLowerCase(),
        },
        { meta: { "auth-token": configs.streamdalToken } }
      );

    for (const [k, v] of Object.entries(response.wasmModules)) {
      void instantiateWasm(k, v.bytes);
    }

    for (const command of response.active) {
      processResponse(command);
    }
    internal.pipelineInitialized = true;
  } catch (e) {
    console.error("Error initializing pipelines", e);
  }
};

export const processResponse = (response: Command) => {
  if (!response.audience) {
    response.command.oneofKind !== "keepAlive" &&
      console.debug("command response has no audience, ignoring");
    return;
  }

  switch (response.command.oneofKind) {
    case "attachPipeline":
      response.command.attachPipeline.pipeline &&
        attachPipeline(
          response.audience,
          response.command.attachPipeline.pipeline
        );
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

export const buildPipeline = (pipeline: Pipeline): Pipeline => {
  return {
    ...pipeline,
    steps: pipeline.steps.map((step: PipelineStep) => {
      void instantiateWasm(step.WasmId, step.WasmBytes);
      return {
        ...step,
        WasmBytes: undefined,
      };
    }),
  };
};

export const attachPipeline = (audience: Audience, pipeline: Pipeline) => {
  internal.pipelines.set(audienceKey(audience), {
    ...buildPipeline(pipeline),
    paused: false,
  });
};

export const detachPipeline = (audience: Audience, pipelineId: string) => {
  const key = audienceKey(audience);
  const p = internal.pipelines.get(key);
  pipelineId === p?.id && internal.pipelines.delete(key);
};

export const togglePausePipeline = (
  audience: Audience,
  pipelineId: string,
  paused: boolean
) => {
  const key = audienceKey(audience);
  const p = internal.pipelines.get(key);
  pipelineId === p?.id && internal.pipelines.set(key, { ...p, paused });
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
      request.Id &&
        internal.audiences.get(audienceKey(audience))?.tails.set(request.Id, {
          tail: request.type === TailRequestType.START,
          tailRequestId: request.Id,
        });
      break;
    }
    case TailRequestType.STOP: {
      console.debug(
        "received a STOP tail: removing entry from audiences for tail id",
        request.Id
      );
      request.Id &&
        internal.audiences.get(audienceKey(audience))?.tails.delete(request.Id);
      break;
    }
    default:
      console.error("unknown tail request type ", request.type);
      break;
  }
};
