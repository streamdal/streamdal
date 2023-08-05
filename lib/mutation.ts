import { StandardResponse } from "snitch-protos/protos/common.ts";
import { client, meta } from "./grpc.ts";
import { Pipeline } from "snitch-protos/protos/pipeline.ts";

export const upsertPipeline = async (
  pipeline: Pipeline,
): Promise<StandardResponse> => {
  const { _, response }: { _; response: StandardResponse } = pipeline.id
    ? await client
      .updatePipeline(
        { pipeline },
        meta,
      )
    : await client
      .updatePipeline(
        { pipeline },
        meta,
      );

  return response;
};
