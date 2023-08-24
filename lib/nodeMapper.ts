import { Audience, OperationType } from "snitch-protos/protos/sp_common.ts";
import { Pipeline } from "snitch-protos/protos/sp_pipeline.ts";
import { ClientInfo, LiveInfo } from "snitch-protos/protos/sp_info.ts";
import { ServiceMapType } from "./fetch.ts";
import {
  componentKey,
  getAttachedPipeline,
  groupKey,
  operationKey,
  serviceKey,
} from "./utils.ts";
import { MarkerType } from "reactflow";
import { OpUpdate } from "../islands/serviceMap.tsx";

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
// the service map is used for x-axis offset layout positions and
// group counts per service are used for y-axix offset layout positions
export type NodesMap = {
  nodes: Map<string, FlowNode>;
  services: Map<string, GroupCount>;
};

export type FlowEdge = {
  id: string;
  source: string;
  target: string;
  markerEnd: any;
  style: any;
};

export const xOffset = (
  audience: Audience,
  services: Map<string, GroupCount>,
) => Array.from(services.keys()).indexOf(serviceKey(audience)) * 800;

export const mapOperation = (
  nodesMap: NodesMap,
  a: Audience,
  serviceMap: ServiceMapType,
) => {
  const op = OperationType[a.operationType].toLowerCase() as GroupCountKey;
  const groupCount = nodesMap.services.get(serviceKey(a))!;
  groupCount.producer = groupCount.producer + (op === "producer" ? 1 : 0);
  groupCount.consumer = groupCount.consumer + (op === "consumer" ? 1 : 0);
  nodesMap.services.set(serviceKey(a), groupCount);

  nodesMap.nodes.set(groupKey(a), {
    id: groupKey(a),
    type: `${op}Group`,
    sourcePosition: "right",
    targetPosition: "left",
    dragHandle: "#dragHandle",
    position: {
      x: (op === "consumer" ? 25 : 350) + xOffset(a, nodesMap.services),
      y: 200,
    },
    data: {
      audience: a,
      groupCount: groupCount[op],
    },
  });

  nodesMap.nodes.set(operationKey(a), {
    id: operationKey(a),
    draggable: false,
    type: op,
    position: {
      x: 10,
      y: 38 + ((groupCount[op] - 1) * 80),
    },
    parentNode: groupKey(a),
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
    services: new Map<string, GroupCount>(),
  };

  serviceMap.audiences.forEach((a: Audience) => {
    if (!nodesMap.services.has(serviceKey(a))) {
      nodesMap.services.set(serviceKey(a), { producer: 0, consumer: 0 });
    }

    nodesMap.nodes.set(serviceKey(a), {
      id: serviceKey(a),
      type: "service",
      dragHandle: "#dragHandle",
      position: { x: 150 + xOffset(a, nodesMap.services), y: 0 },
      data: { audience: a },
    });

    mapOperation(nodesMap, a, serviceMap);

    //
    // guaranteed to be initialized above
    const groupCount = nodesMap.services.get(serviceKey(a))!;
    const count = Math.max(
      groupCount["producer"] || 1,
      groupCount["consumer"] || 1,
    );

    nodesMap.nodes.set(a.componentName, {
      id: componentKey(a),
      type: "component",
      sourcePosition: "right",
      targetPosition: "left",
      dragHandle: "#dragHandle",
      position: {
        x: 240 + xOffset(a, nodesMap.services),
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
// producers: component <- producer group <- service
export const mapEdgePair = (
  edgesMap: Map<string, FlowEdge>,
  a: Audience,
): Map<string, FlowEdge> => {
  const op = OperationType[a.operationType].toLowerCase();
  edgesMap.set(`${componentKey(a)}-${op}-edge`, {
    id: `${componentKey(a)}-${op}-edge`,
    ...op === "consumer"
      ? {
        source: componentKey(a),
        target: groupKey(a),
      }
      : {
        source: groupKey(a),
        target: componentKey(a),
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

  edgesMap.set(`${serviceKey(a)}-${op}-edge`, {
    id: `${serviceKey(a)}-${op}-edge`,
    ...op === "consumer"
      ? {
        source: groupKey(a),
        target: serviceKey(a),
      }
      : {
        source: serviceKey(a),
        target: groupKey(a),
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
  nodes.map((n: FlowNode) =>
    n.id ===
        operationKey(update.audience)
      ? {
        ...n,
        data: {
          ...n.data,
          attachedPipeline: update.attachedPipeline,
        },
      }
      : n
  );
