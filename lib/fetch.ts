import { client, meta } from "./grpc.ts";
import { GetAllResponse } from "snitch-protos/protos/sp_external.ts";
import { PipelineInfo } from "snitch-protos/protos/sp_info.ts";
import { Audience } from "snitch-protos/protos/sp_common.ts";
import { FlowEdge, FlowNode, mapEdges, mapNodes } from "./nodeMapper.ts";

export type ServiceMapType = GetAllResponse & {
  pipes: PipelineInfo[];
};

export type ConfigType = { [key: string]: string };
export type PipelinesType = { [key: string]: PipelineInfo };

export const getServiceMap = async (): Promise<ServiceMapType> => {
  const { response } = await client.getAll({}, meta);

  return {
    ...response,
    pipes: Object.values(response?.pipelines),
  };
};

export type ServiceNodes = {
  nodes: FlowNode[];
  edges: FlowEdge[];
};

export const getDisplayNodes = async (
  serviceMap: ServiceMapType,
): Promise<ServiceNodes> => {
  const edges = Array.from(mapEdges(serviceMap.audiences).values());
  const nodes = Array.from(
    mapNodes(serviceMap).nodes.values(),
  );
  return { nodes, edges };
};

export const getPipelines = async () => {
  const { response } = await client.getPipelines({}, meta);
  return response?.pipelines?.sort((a, b) => a.name.localeCompare(b.name));
};

export const getPipeline = async (pipelineId: string) => {
  const { response } = await client.getPipeline({ pipelineId }, meta);
  return response?.pipeline;
};

export const pausePipeline = async (pipeline: any) => {
  const { response } = await client.pausePipeline(
    { pipelineId: pipeline },
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
