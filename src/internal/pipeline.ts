import { Command } from "@streamdal/snitch-protos/protos/command.js";
import { Audience } from "@streamdal/snitch-protos/protos/common.js";
import {
  Pipeline,
  PipelineStep,
} from "@streamdal/snitch-protos/protos/pipeline.js";

export type InternalPipeline = Pipeline & {
  paused: boolean;
};

export type EnhancedStep = PipelineStep & {
  pipelineId: string;
  pipelineName: string;
};

export const internalPipelines = new Map<Audience, InternalPipeline>();

export const processResponse = (command: Command) => {
  if (!command.audience) {
    console.error("command response has no audience, ignoring");
    return;
  }

  console.info("processing grpc server command...");

  switch (command.command.oneofKind) {
    case "attachPipeline":
      command.command.attachPipeline.pipeline &&
        attachPipeline(
          command.audience,
          command.command.attachPipeline.pipeline
        );
      break;
    case "detachPipeline":
      detachPipeline(
        command.audience,
        command.command.detachPipeline.pipelineId
      );
      break;
    case "pausePipeline":
      togglePausePipeline(
        command.audience,
        command.command.pausePipeline.pipelineId,
        true
      );
      break;
    case "resumePipeline":
      togglePausePipeline(
        command.audience,
        command.command.resumePipeline.pipelineId,
        false
      );
      break;
  }

  console.info("grpc server command processed");
};

export const attachPipeline = (audience: Audience, pipeline: Pipeline) =>
  internalPipelines.set(audience, { ...pipeline, paused: false });

export const detachPipeline = (audience: Audience, pipelineId: string) => {
  const p = internalPipelines.get(audience);
  pipelineId === p?.id && internalPipelines.delete(audience);
};

export const togglePausePipeline = (
  audience: Audience,
  pipelineId: string,
  paused: boolean
) => {
  const p = internalPipelines.get(audience);
  pipelineId === p?.id && internalPipelines.set(audience, { ...p, paused });
};
