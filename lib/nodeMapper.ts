import { Audience, OperationType } from "snitch-protos/protos/common.ts";
import { Pipeline } from "snitch-protos/protos/pipeline.ts";
import { ClientInfo, LiveInfo } from "snitch-protos/protos/info.ts";
import { ServiceMapType } from "./fetch.ts";
import { getAttachedPipeline } from "./utils.ts";
import { MarkerType } from "reactflow";
import { OpUpdate, opUpdateSignal } from "../islands/serviceMap.tsx";

export type NodeData = {
  audience: Audience;
  attachedPipeline?: Pipeline;
  clients?: ClientInfo[];
  groupCount?: number;
};

export type FlowNode = {
  id: string;
  type?: string;
  dragHandle?: string;
  draggable?: boolean;
  position?: {
    x: number;
    y: number;
  };
  sourcePosition?: string;
  targetPosition?: string;
  data: NodeData;
  parentNode?: string;
  extent?: string;
  style?: any;
};

type GroupCountKey = "producer" | "consumer";
export type GroupCount = { [key in GroupCountKey]: number };

//
// group counts per service are used for vertical offset layout positions
export type NodesMap = {
  nodes: Map<string, FlowNode>;
  groupCount: Map<string, GroupCount>;
};

export type FlowEdge = {
  id: string;
  source: string;
  target: string;
  markerEnd: any;
  style: any;
};

export const xOffset = (serviceCount: number) =>
  serviceCount > 1 ? (serviceCount - 1) * 800 : 0;

export const mapOperation = (
  nodesMap: NodesMap,
  a: Audience,
  serviceMap: ServiceMapType,
) => {
  const op = OperationType[a.operationType].toLowerCase() as GroupCountKey;
  const groupCount = nodesMap.groupCount.get(a.serviceName)!;
  groupCount.producer = groupCount.producer + (op === "producer" ? 1 : 0);
  groupCount.consumer = groupCount.consumer + (op === "consumer" ? 1 : 0);
  nodesMap.groupCount.set(a.serviceName, groupCount);

  nodesMap.nodes.set(`${a.serviceName}-${a.componentName}-${op}`, {
    id: `${a.serviceName}-${a.componentName}-${op}`,
    type: `${op}Group`,
    sourcePosition: "right",
    targetPosition: "left",
    dragHandle: "#dragHandle",
    position: {
      x: (op === "consumer" ? 25 : 350) + xOffset(nodesMap.groupCount.size),
      y: 200,
    },
    data: {
      audience: a,
      groupCount: groupCount[op],
    },
  });

  nodesMap.nodes.set(a.operationName, {
    id: `${a.serviceName}-${a.operationName}`,
    draggable: false,
    type: op,
    position: {
      x: 10,
      y: 38 + ((groupCount[op] - 1) * 80),
    },
    parentNode: `${a.serviceName}-${a.componentName}-${op}`,
    extent: "parent",
    data: {
      audience: a,
      clients: serviceMap.live?.filter((l: LiveInfo) =>
        l.audiences?.includes(a)
      )?.map(
        (
          l: LiveInfo,
        ) => l.client,
      ) as ClientInfo[],
      attachedPipeline: getAttachedPipeline(
        a,
        serviceMap.pipelines,
        serviceMap.config,
      ),
    },
  });
};

export const mapNodes = (
  serviceMap: ServiceMapType,
): NodesMap => {
  const nodesMap = {
    nodes: new Map<string, FlowNode>(),
    groupCount: new Map<string, GroupCount>(),
  };

  serviceMap.audiences.forEach((a: Audience) => {
    if (!nodesMap.groupCount.has(a.serviceName)) {
      nodesMap.groupCount.set(a.serviceName, { producer: 0, consumer: 0 });
    }

    nodesMap.nodes.set(a.serviceName, {
      id: a.serviceName,
      type: "service",
      dragHandle: "#dragHandle",
      position: { x: 150 + xOffset(nodesMap.groupCount.size), y: 0 },
      data: { audience: a },
    });

    mapOperation(nodesMap, a, serviceMap);

    //
    // guaranteed to be initialized above
    const groupCount = nodesMap.groupCount.get(a.serviceName)!;
    const count = Math.max(
      groupCount["producer"] || 1,
      groupCount["consumer"] || 1,
    );

    nodesMap.nodes.set(a.componentName, {
      id: a.componentName,
      type: "component",
      sourcePosition: "right",
      targetPosition: "left",
      dragHandle: "#dragHandle",
      position: {
        x: 240 + xOffset(nodesMap.groupCount.size),
        y: 350 + (count - 1) * 76,
      },
      data: { audience: a },
    });
  });

  return nodesMap;
};

//
// For each audience there are a pair of edges, one for each arrow:
// consumers: component -> consumer group -> service
// producers: service -> producer group -> component
export const mapEdgePair = (
  edgesMap: Map<string, FlowEdge>,
  a: Audience,
): Map<string, FlowEdge> => {
  const op = OperationType[a.operationType].toLowerCase();
  edgesMap.set(`${a.componentName}-${op}`, {
    id: `${a.componentName}-${op}`,
    ...op === "consumer"
      ? {
        source: a.componentName,
        target: `${a.serviceName}-${a.componentName}-${op}`,
      }
      : {
        source: `${a.serviceName}-${a.componentName}-${op}`,
        target: a.componentName,
      },
    markerEnd: {
      type: MarkerType.Arrow,
      width: 20,
      height: 20,
      color: "#956CFF",
    },
    style: {
      strokeWidth: 1.5,
      stroke: "#956CFF",
    },
  });

  edgesMap.set(`${a.serviceName}-${op}`, {
    id: `${a.serviceName}-${op}`,
    ...op === "consumer"
      ? {
        source: `${a.serviceName}-${a.componentName}-${op}`,
        target: a.serviceName,
      }
      : {
        source: a.serviceName,
        target: `${a.serviceName}-${a.componentName}-${op}`,
      },
    markerEnd: {
      type: MarkerType.Arrow,
      width: 20,
      height: 20,
      color: "#956CFF",
    },
    style: {
      strokeWidth: 1.5,
      stroke: "#956CFF",
    },
  });

  return edgesMap;
};

export const mapEdges = (audiences: Audience[]): Map<string, FlowEdge> => {
  const edgesMap = new Map<string, FlowEdge>();
  audiences.forEach((a: Audience) => mapEdgePair(edgesMap, a));
  return edgesMap;
};

//
// Because reactflow doesn't work with ssr, some updates are made in
// unrouted modals client-side and those changes need to be reflected
// in the already rendered nodes
export const updateNode = (nodes: FlowNode[], update: OpUpdate) =>
  update
    ? nodes.map((n: FlowNode) =>
      n.id ===
          `${update.audience.serviceName}-${update.audience.operationName}`
        ? {
          ...n,
          data: {
            ...n.data,
            attachedPipeline: update.attachedPipeline,
          },
        }
        : n
    )
    : nodes;
