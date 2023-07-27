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
    case "setPipeline":
      command.command.setPipeline.pipeline &&
        setPipeline(command.audience, command.command.setPipeline.pipeline);
      break;
    case "deletePipeline":
      deletePipeline(command.audience, command.command.deletePipeline.id);
      break;
    case "pausePipeline":
      togglePausePipeline(
        command.audience,
        command.command.pausePipeline.id,
        true
      );
      break;
    case "unpausePipeline":
      togglePausePipeline(
        command.audience,
        command.command.unpausePipeline.id,
        false
      );
      break;
  }

  console.info("grpc server command processed");
};

export const setPipeline = (audience: Audience, pipeline: Pipeline) =>
  internalPipelines.set(audience, { ...pipeline, paused: false });

export const deletePipeline = (audience: Audience, pipelineId: string) => {
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
