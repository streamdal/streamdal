import {
  Audience,
  CommandResponse,
} from "@streamdal/snitch-protos/protos/internal_api.js";
import {
  DeletePipelineCommand,
  SetPipelineCommand,
} from "@streamdal/snitch-protos/protos/pipeline.js";

export type PipelineType = SetPipelineCommand & {
  paused: boolean;
};

export const internalPipelines = new Map<Audience, PipelineType[]>();

export const processResponse = (commandResponse: CommandResponse) => {
  if (!commandResponse.audience) {
    console.error("command response has no audience, ignoring");
    return;
  }

  switch (commandResponse.command.oneofKind) {
    case "setPipeline":
      setPipeline(
        commandResponse.audience,
        commandResponse.command.setPipeline
      );
      break;
    case "deletePipeline":
      deletePipeline(
        commandResponse.audience,
        commandResponse.command.deletePipeline
      );
      break;
    case "pausePipeline":
      togglePausePipeline(
        commandResponse.audience,
        commandResponse.command.pausePipeline.id,
        true
      );
      break;
    case "unpausePipeline":
      togglePausePipeline(
        commandResponse.audience,
        commandResponse.command.unpausePipeline.id,
        false
      );
      break;
  }

  console.info("response command processed");
};

export const setPipeline = (
  audience: Audience,
  pipeline: SetPipelineCommand
) => {
  const steps = internalPipelines.get(audience) ?? [];
  const index = steps.findIndex(
    ({ id }: SetPipelineCommand) => id === pipeline.id
  );

  index >= 0
    ? (steps[index] = { ...pipeline, paused: false })
    : steps.push({ ...pipeline, paused: false });

  internalPipelines.set(audience, steps);
};

export const deletePipeline = (
  audience: Audience,
  pipeline: DeletePipelineCommand
) => {
  const steps = internalPipelines.get(audience) ?? [];
  const index = steps.findIndex(
    ({ id }: SetPipelineCommand) => id === pipeline.id
  );

  index >= 0 ? steps.splice(index, 1) : null;

  internalPipelines.set(audience, steps);
};

export const togglePausePipeline = (
  audience: Audience,
  pipelineId: string,
  paused: boolean
) => {
  const steps = internalPipelines.get(audience) ?? [];
  const index = steps.findIndex(
    ({ id }: SetPipelineCommand) => id === pipelineId
  );

  index >= 0 ? (steps[index] = { ...steps[index], paused }) : null;

  internalPipelines.set(audience, steps);
};
