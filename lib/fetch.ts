import { client, meta } from "./grpc.ts";
import { GetAllResponse } from "snitch-protos/protos/sp_external.ts";
import { PipelineInfo } from "snitch-protos/protos/sp_info.ts";
import { Audience } from "snitch-protos/protos/sp_common.ts";

export type ConfigType = { [key: string]: string };
export type PipelinesType = { [key: string]: PipelineInfo };

export const getAll = async (): Promise<GetAllResponse> => {
  const { response } = await client.getAll({}, meta);
  return response;
};

export const getPipelines = async () => {
  const { response } = await client.getPipelines({}, meta);
  return response?.pipelines?.sort((a, b) => a.name.localeCompare(b.name));
};

export const getPipeline = async (pipelineId: string) => {
  const { response } = await client.getPipeline({ pipelineId }, meta);
  return response?.pipeline;
};

export const pausePipeline = async (pipeline: any, audience: Audience) => {
  const { response } = await client.pausePipeline(
    { pipelineId: pipeline, audience: audience },
    meta,
  );
  return response;
};

export const getAttachedPipeline = async (name: string) => {
  const { response } = await client.getAll({}, meta);
  const attachedPipelineName = Object.keys(response.pipelines).find((
    pipeline,
  ) =>
    response.pipelines[pipeline].audiences.find((audience: Audience) =>
      audience.operationName === name
    )
  );
  return attachedPipelineName;
};

export const getNotifications = async () => {
  const { response } = await client.getNotifications({}, meta);

  return response.notifications;
};

export const getSchema = async (audience: Audience) => {
  const { response } = await client.getSchema({ audience }, meta);
  return response;
};
