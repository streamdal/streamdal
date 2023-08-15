import { StandardResponse } from "snitch-protos/protos/common.ts";
import { client, meta } from "./grpc.ts";
import { Pipeline } from "snitch-protos/protos/pipeline.ts";

export const upsertPipeline = async (
  pipeline: Pipeline,
): Promise<StandardResponse & { pipelineId: string }> => {
  let pipelineId = pipeline.id ? pipeline.id : crypto.randomUUID();

  const { response }: { response: StandardResponse } = pipeline.id
    ? await client
      .updatePipeline(
        { pipeline },
        meta,
      )
    : await client
      .createPipeline(
        { pipeline: { ...pipeline, id: pipelineId } },
        meta,
      );

  //
  // XXX/TODO: stop doing this once createPipeline respects
  // provided id
  if (!pipeline.id) {
    const start = response?.message.indexOf("'");
    pipelineId = response?.message?.substring(
      start + 1,
      response?.message.indexOf("'", start + 1),
    );
  }

  return { ...response, pipelineId: pipelineId };
};

export const deletePipeline = async (
  pipelineId: string,
): Promise<StandardResponse> => {
  const { response }: { response: StandardResponse } = await client
    .deletePipeline(
      { pipelineId },
      meta,
    );

  return response;
};

export const attachPipeline = async (
  pipelineId: string,
) => {
  const { response } = await client.attachPipeline({ pipelineId }, meta);
  return response;
};

export const detachPipeline = async (
  pipelineId: string,
) => {
  const { response } = await client.deletePipeline({ pipelineId }, meta);
  return response;
};
