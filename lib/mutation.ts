import {
  Audience,
  ResponseCode,
  StandardResponse,
} from "snitch-protos/protos/common.ts";
import { client, meta } from "./grpc.ts";
import { Pipeline } from "snitch-protos/protos/pipeline.ts";
import {
  AttachPipelineRequest,
  DetachPipelineRequest,
} from "snitch-protos/protos/external.ts";

export type PatchedPipelineResponse = StandardResponse & {
  pipelineId?: string;
};
export const upsertPipeline = async (
  pipeline: Pipeline,
): Promise<PatchedPipelineResponse> => {
  if (pipeline.id) {
    const { response: updateResponse } = await client
      .updatePipeline(
        { pipeline },
        meta,
      );
    return updateResponse;
  }

  const { response: createResponse } = await client
    .createPipeline({ pipeline }, meta);

  //
  // Create pipeline returns a non-standard response with no code so
  // we have to handle it specifically
  return {
    ...createResponse,
    id: createResponse.pipelineId,
    code: createResponse.pipelineId
      ? ResponseCode.OK
      : ResponseCode.INTERNAL_SERVER_ERROR,
  };
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
  audience: Audience,
) => {
  try {
    const request: AttachPipelineRequest = { audience, pipelineId };
    const { response } = await client.attachPipeline(
      request,
      meta,
    );
    return response;
  } catch (error) {
    console.error("error attaching pipeline", error);
    return {
      id: "attachRequest",
      code: ResponseCode.INTERNAL_SERVER_ERROR,
      error,
    };
  }
};

export const detachPipeline = async (
  pipelineId: string,
  audience: Audience,
) => {
  try {
    const request: DetachPipelineRequest = { audience, pipelineId };
    const { response } = await client.detachPipeline(
      request,
      meta,
    );
    return response;
  } catch (error) {
    console.error("error attaching pipeline", error);
    return {
      id: "detachRequest",
      code: ResponseCode.INTERNAL_SERVER_ERROR,
      error,
    };
  }
};
