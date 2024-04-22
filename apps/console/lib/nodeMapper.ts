import { Audience, OperationType } from "streamdal-protos/protos/sp_common.ts";
import { componentKey, groupKey, serviceKey } from "./utils.ts";
import { ServiceMapper } from "./serviceMapper.ts";
import {
  GROUP_MARGIN,
  GROUP_WIDTH,
} from "../components/serviceMap/customNodes.tsx";
import { CoordinateExtent, MarkerType, Position } from "reactflow";

export type NodeData = {
  audience: Audience;
  group?: Audience[];
};

export type FlowNode = {
  id: string;
  type?: string;
  dragHandle?: string;
  draggable?: boolean;
  position: {
    x: number;
    y: number;
  };
  sourcePosition?: Position;
  targetPosition?: Position;
  data: NodeData;
  parentNode?: string;
  extent?: "parent" | CoordinateExtent;
  style?: any;
};

export type FlowEdge = {
  id: string;
  source: string;
  target: string;
  markerEnd: any;
  type: string;
  style: any;
  data: any;
  animated?: boolean;
};

//
// This is heart of our homegrown layouts:
// * operationGroups max determines component node y axis offsets
// * group counts per service determine service node x axis offsets
// * group counts per component determine component node x axis offsets
export type NodesMap = {
  nodes: Map<string, FlowNode>;
  //
  // number is operation groups per component
  components: Map<string, number>;
  //
  // number is operation groups per service
  services: Map<string, number>;
  operationGroups: Map<string, number>;
};

//
// Start from the hard offset of all the previous group widths,
// then roughly center it in it's own group cluster
export const offset = (
  key: string,
  item: Map<string, number>,
) => {
  let offset = 25;
  for (const [k, v] of item) {
    if (k === key) {
      return offset +
        ((item.get(key) || 1) * (GROUP_WIDTH + GROUP_MARGIN) / 2);
    }
    offset += v * GROUP_WIDTH + GROUP_MARGIN;
  }
  return offset;
};

export const componentOffset = (
  key: string,
  item: Map<string, number>,
) => {
  let offset = 25;
  const keys = Array.from(item.keys());
  for (const [k] of item) {
    if (k === key) {
      return offset +
        ((keys.indexOf(k) + 1) * (GROUP_WIDTH + GROUP_MARGIN) / 2);
    }
    offset += GROUP_WIDTH + GROUP_MARGIN;
  }
  return offset;
};

export const mapOperation = (
  nodesMap: NodesMap,
  a: Audience,
) => {
  const gKey = groupKey(a);
  nodesMap.operationGroups.set(
    gKey,
    (nodesMap.operationGroups.get(gKey) || 0) + 1,
  );
  const op = OperationType[a.operationType].toLowerCase();
  const node = nodesMap.nodes.get(gKey);

  if (node) {
    nodesMap.nodes.set(gKey, {
      ...node,
      data: {
        ...node.data,
        group: [...node.data.group ? node.data.group : [], ...[a]],
      },
    });
  } else {
    const sKey = serviceKey(a);
    const cKey = componentKey(a);
    nodesMap.services.set(sKey, (nodesMap.services.get(sKey) || 0) + 1);
    nodesMap.components.set(cKey, (nodesMap.components.get(cKey) || 0) + 1);
    nodesMap.nodes.set(gKey, {
      id: gKey,
      type: `${op}Group`,
      dragHandle: "#dragHandle",
      position: {
        x: 25 +
          (nodesMap.operationGroups.size - 1) * (GROUP_WIDTH + GROUP_MARGIN),
        y: 300,
      },
      data: {
        audience: a,
        group: [a],
      },
    });
  }
};

export const mapNodes = (
  serviceMap: ServiceMapper,
): Map<string, FlowNode> => {
  const nodesMap: NodesMap = {
    nodes: new Map<string, FlowNode>(),
    components: new Map(),
    services: new Map(),
    operationGroups: new Map(),
  };

  serviceMap.audiences.sort((a, b) =>
    a.serviceName.localeCompare(b.serviceName) ||
    a.operationType - b.operationType
  ).forEach(
    (a: Audience) => {
      const sKey = serviceKey(a);
      const cKey = componentKey(a);

      nodesMap.nodes.set(sKey, {
        id: sKey,
        type: "service",
        dragHandle: `#${sKey}-draghandle`,
        draggable: true,
        position: {
          x: 25 + offset(
            sKey,
            nodesMap.services,
          ),
          y: 0,
        },
        data: { audience: a },
      });

      mapOperation(nodesMap, a);

      const max = Math.max(...Array.from(nodesMap.operationGroups.values()));

      nodesMap.nodes.set(cKey, {
        id: cKey,
        type: "component",
        dragHandle: `#${cKey}-dragHandle`,
        position: {
          x: componentOffset(cKey, nodesMap.components),
          y: 550 + (max - 1) * 76,
        },
        data: { audience: a },
      });
    },
  );

  return nodesMap.nodes;
};

//
// For each audience there are a pair of edges, one for each arrow:
// consumers: component -> consumer group -> service
// producers: component <- producer group <- service
export const mapEdgePair = (
  edgesMap: Map<string, FlowEdge>,
  a: Audience,
  audiences: Audience[],
): Map<string, FlowEdge> => {
  const op = OperationType[a.operationType].toLowerCase();
  edgesMap.set(`${componentKey(a)}-${groupKey(a)}-edge`, {
    id: `${componentKey(a)}-${groupKey(a)}-edge`,
    ...op === "consumer"
      ? {
        source: componentKey(a),
        target: groupKey(a),
      }
      : {
        source: groupKey(a),
        target: componentKey(a),
      },
    animated: true,
    markerEnd: {
      type: MarkerType.Arrow,
      width: 15,
      height: 15,
      strokeWidth: 2,
      color: "#d2c1ff",
    },
    type: "default",
    style: {
      strokeWidth: 2,
      stroke: "#d2c1ff",
    },
    data: { audiences, a },
  });

  edgesMap.set(`${serviceKey(a)}-${groupKey(a)}-edge`, {
    id: `${serviceKey(a)}-${groupKey(a)}-edge`,
    ...op === "consumer"
      ? {
        source: groupKey(a),
        target: serviceKey(a),
      }
      : {
        source: serviceKey(a),
        target: groupKey(a),
      },
    animated: true,
    markerEnd: {
      type: MarkerType.Arrow,
      width: 25,
      height: 25,
      strokeWidth: 2,
      color: "#d2c1ff",
    },
    type: "serviceEdge",
    style: {
      strokeWidth: 2,
      stroke: "#d2c1ff",
    },
    data: { audiences, a },
  });
  return edgesMap;
};

export const mapEdges = (audiences: Audience[]): Map<string, FlowEdge> => {
  const edgesMap = new Map<string, FlowEdge>();
  audiences.forEach((a: Audience) => mapEdgePair(edgesMap, a, audiences));
  return edgesMap;
};
