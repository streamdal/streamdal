import {
  Command,
  TailCommand,
} from "@streamdal/snitch-protos/protos/sp_command";
import {
  Audience,
  TailRequestType,
} from "@streamdal/snitch-protos/protos/sp_common";
import { GetAttachCommandsByServiceResponse } from "@streamdal/snitch-protos/protos/sp_internal";
import {
  Pipeline,
  PipelineStep,
} from "@streamdal/snitch-protos/protos/sp_pipeline";

import { Configs } from "../snitch.js";
import { audienceKey, internal } from "./register.js";

export type InternalPipeline = Pipeline & {
  paused?: boolean;
};

export type EnhancedStep = PipelineStep & {
  pipelineId: string;
  pipelineName: string;
};

export const initPipelines = async (configs: Configs) => {
  const { response }: { response: GetAttachCommandsByServiceResponse } =
    await configs.grpcClient.getAttachCommandsByService(
      {
        serviceName: configs.serviceName.toLowerCase(),
      },
      { meta: { "auth-token": configs.snitchToken } }
    );

  for (const [k, v] of Object.entries(response.wasmModules)) {
    internal.wasmModules.set(k, v);
  }

  for (const command of response.active) {
    processResponse(command);
  }
  internal.pipelineInitialized = true;
  return;
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

export const buildPipeline = (pipeline: Pipeline) => ({
  ...pipeline,
  steps: pipeline.steps.map((step: PipelineStep) => ({
    ...step,
    ...(step.WasmId
      ? { WasmBytes: internal.wasmModules.get(step.WasmId)?.bytes }
      : {}),
  })),
});

export const attachPipeline = (audience: Audience, pipeline: Pipeline) =>
  pipeline.name !== "Schema Inference" &&
  internal.pipelines.set(audienceKey(audience), {
    ...buildPipeline(pipeline),
    paused: false,
  });

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
  console.debug("enabling tail", request);
  internal.audiences.set(audienceKey(audience), {
    tail: request.type === TailRequestType.START,
    tailRequestId: request.Id,
  });
};
