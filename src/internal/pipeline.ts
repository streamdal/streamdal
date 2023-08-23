import { Command } from "@streamdal/snitch-protos/protos/command.js";
import { Audience } from "@streamdal/snitch-protos/protos/common.js";
import {
  Pipeline,
  PipelineStep,
} from "@streamdal/snitch-protos/protos/pipeline.js";

import { Configs } from "../snitch.js";
import { internal } from "./register.js";

export type InternalPipeline = Pipeline & {
  paused: boolean;
};

export type EnhancedStep = PipelineStep & {
  pipelineId: string;
  pipelineName: string;
};

export const initPipelines = async (configs: Configs) => {
  const { response } = await configs.grpcClient.getAttachCommandsByService(
    {
      serviceName: configs.serviceName,
    },
    { meta: { "auth-token": configs.snitchToken } }
  );

  for (const command of response.active) {
    processResponse(command);
  }
  internal.pipelineInitialized = true;
  return;
};

export const processResponse = (response: Command) => {
  if (!response.audience) {
    // console.debug("command response has no audience, ignoring");
    return;
  }

  // console.debug("processing grpc server response command...", response);

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
  }

  // console.debug("grpc server command processed");
};

export const attachPipeline = (audience: Audience, pipeline: Pipeline) =>
  internal.pipelines.set(JSON.stringify(audience), {
    ...pipeline,
    paused: false,
  });

export const detachPipeline = (audience: Audience, pipelineId: string) => {
  const p = internal.pipelines.get(JSON.stringify(audience));
  pipelineId === p?.id && internal.pipelines.delete(JSON.stringify(audience));
};

export const togglePausePipeline = (
  audience: Audience,
  pipelineId: string,
  paused: boolean
) => {
  const p = internal.pipelines.get(JSON.stringify(audience));
  pipelineId === p?.id &&
    internal.pipelines.set(JSON.stringify(audience), { ...p, paused });
};
