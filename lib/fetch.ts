import { client, meta } from "./grpc.ts";
import { GetAllResponse } from "snitch-protos/protos/sp_external.ts";
import {
  ClientInfo,
  LiveInfo,
  PipelineInfo,
} from "snitch-protos/protos/sp_info.ts";
import { Audience } from "snitch-protos/protos/sp_common.ts";
import { FlowEdge, FlowNode, mapEdges, mapNodes } from "./nodeMapper.ts";
import { audienceKey } from "./utils.ts";

export type ServiceMapType = GetAllResponse & {
  pipes: PipelineInfo[];
  liveAudiences: Map<string, ClientInfo[]>;
};

export type ConfigType = { [key: string]: string };
export type PipelinesType = { [key: string]: PipelineInfo };

export const mapLiveAudiences = (live: LiveInfo[]) => {
  const liveAudiences = new Map<string, ClientInfo[]>();

  for (const l of live) {
    for (const a of l.audiences) {
      const key = audienceKey(a);
      liveAudiences.has(key)
        ? liveAudiences.set(key, [
          ...liveAudiences.get(key) as ClientInfo[],
          l.client as ClientInfo,
        ])
        : liveAudiences.set(key, [l.client] as ClientInfo[]);
    }
  }
  return liveAudiences;
};

export const getServiceMap = async (): Promise<ServiceMapType> => {
  const { response } = await client.getAll({}, meta);
  return {
    ...response,
    pipes: Object.values(response?.pipelines),
    liveAudiences: mapLiveAudiences(response.live),
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
