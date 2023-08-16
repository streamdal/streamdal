import { client, meta } from "./grpc.ts";
import { GetAllResponse } from "snitch-protos/protos/external.ts";
import { PipelineInfo } from "snitch-protos/protos/info.ts";
import { dummyAudiences, dummyConfig, dummyLive } from "./dummies.ts";
import {
  FlowEdge,
  FlowNode,
  mapEdges,
  mapNodes,
} from "../components/serviceMap/customNodes.tsx";
import { Audience } from "snitch-protos/protos/common.ts";

export type ServiceMapType = GetAllResponse & {
  pipes: PipelineInfo[];
};

export type ConfigType = { [key: string]: string };
export type PipelinesType = { [key: string]: PipelineInfo };

export const getServiceMap = async (): Promise<ServiceMapType> => {
  const { response } = await client.getAll({}, meta);
  return {
    ...response,
    //
    // TODO: remove dummy data
    ...response.audiences.length === 0 ? { audiences: dummyAudiences } : {},
    ...response.live.length === 0 ? { live: dummyLive } : {},
    ...Object.keys(response.config).length === 0 ? { config: dummyConfig } : {},
    pipes: Object.values(response?.pipelines),
  };
};

export type ServiceNodes = {
  serviceMap: ServiceMapType;
  nodes: FlowNode[];
  edges: FlowEdge[];
};

export const getServiceNodes = async (): Promise<ServiceNodes> => {
  const serviceMap = await getServiceMap();
  const edges = Array.from(mapEdges(serviceMap.audiences).values());
  const nodes = Array.from(
    mapNodes(serviceMap).nodes.values(),
  );
  return { serviceMap, nodes, edges };
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
