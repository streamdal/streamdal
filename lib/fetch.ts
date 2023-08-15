import { client, meta } from "./grpc.ts";
import { GetAllResponse } from "snitch-protos/protos/external.ts";
import { PipelineInfo } from "snitch-protos/protos/info.ts";
import { dummyAudiences } from "./dummies.ts";
import {
  FlowEdge,
  FlowNode,
  mapAudiencePipelines,
  mapEdges,
  mapNodes,
} from "../components/serviceMap/customNodes.tsx";

export type ServiceMapType = GetAllResponse & {
  pipes: PipelineInfo[];
};

export const getServiceMap = async (): Promise<ServiceMapType> => {
  const { response } = await client.getAll({}, meta);
  return {
    ...response,
    //
    // TODO: remove dummy data
    ...response.audiences.length === 0 ? { audiences: dummyAudiences } : {},
    pipes: Object.values(response?.pipelines),
  };
};

export type ServiceNodes = { nodes: FlowNode[]; edges: FlowEdge[] };

export const getServiceNodes = async (): Promise<ServiceNodes> => {
  const serviveMap = await getServiceMap();
  const edges = Array.from(mapEdges(serviveMap.audiences).values());
  const audiencePipelines = mapAudiencePipelines(
    serviveMap.audiences,
    serviveMap.pipes,
  );
  const nodes = Array.from(
    mapNodes(audiencePipelines).nodes.values(),
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

export const attachPipeline = async (pipeline: string) => {
  const { response } = await client.attachPipeline(
    { pipelineId: pipeline },
    meta,
  );
  return response;
};
