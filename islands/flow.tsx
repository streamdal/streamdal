import ReactFlow, {
  Background,
  Controls,
  MarkerType,
  useEdgesState,
  useNodesState,
} from "reactflow";
import {
  Component,
  Group,
  Operation,
  Service,
} from "../components/serviceMap/customNodes.tsx";
import "flowbite";
import { Audience, OperationType } from "snitch-protos/protos/common.ts";
import type { ServiceMap } from "../routes/index.tsx";
import { titleCase } from "../lib/utils.ts";
import { PipelineInfo } from "snitch-protos/protos/info.ts";
import { Pipeline } from "snitch-protos/protos/pipeline.ts";

const nodeTypes = {
  service: Service,
  component: Component,
  consumerGroup: Group,
  producerGroup: Group,
  producer: Operation,
  consumer: Operation,
};

export type AudiencePipeline = Audience & { pipeline?: Pipeline };

export type NodeData = {
  label: string;
  audience: AudiencePipeline;
};

export type Node = {
  id: string;
  type?: string;
  dragHandle: string;
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

export type Edge = {
  id: string;
  source: string;
  target: string;
  markerEnd: any;
  style: any;
};

export const mapOperation = (
  nodesMap: Map<string, Node>,
  a: Audience,
) => {
  const op = OperationType[a.operationType].toLowerCase();
  nodesMap.set(`${a.serviceName}-${a.componentName}-${op}`, {
    id: `${a.serviceName}-${a.componentName}-${op}`,
    type: `${op}Group`,
    sourcePosition: "right",
    targetPosition: "left",
    dragHandle: "#dragHandle",
    position: { x: op === "consumer" ? 25 : 350, y: 200 },
    data: {
      label: `${titleCase(op)} group`,
      audience: a,
    },
  });

  nodesMap.set(a.operationName, {
    id: a.operationName,
    type: op,
    dragHandle: "#dragHandle",
    position: { x: 15, y: a.operationName.includes("two") ? 96 : 24 },
    parentNode: `${a.serviceName}-${a.componentName}-${op}`,
    extent: "parent",
    data: {
      label: a.operationName,
      instances: 0,
      pipeline: {},
      audience: a,
    },
  });
};

export const mapNodes = (
  audiences: AudiencePipeline[],
): Map<string, Node> => {
  const nodesMap = new Map<string, Node>();

  audiences.forEach((a: Audience, i: number) => {
    nodesMap.set(a.serviceName, {
      id: a.serviceName,
      type: "service",
      dragHandle: "#dragHandle",
      position: { x: 150, y: 0 },
      data: { label: a.serviceName, audience: a },
    });

    nodesMap.set(a.componentName, {
      id: a.componentName,
      type: "component",
      sourcePosition: "right",
      targetPosition: "left",
      dragHandle: "#dragHandle",
      position: { x: 215, y: 440 },
      data: { label: a.componentName, audience: a },
    });

    mapOperation(nodesMap, a);
  });

  return nodesMap;
};

//
// For each audience there are a pair of edges, one for each arrow:
// consumers: component -> consumer group -> service
// producers: service -> producer group -> component
export const mapEdgePair = (
  edgesMap: Map<string, Edge>,
  a: Audience,
): Map<string, Edge> => {
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

export const mapEdges = (audiences: Audience[]): Map<string, Edge> => {
  const edgesMap = new Map<string, Edge>();
  audiences.forEach((a: Audience) => mapEdgePair(edgesMap, a));
  return edgesMap;
};

export const mapAudiencePipelines = (
  audiences: Audience[],
  pipelines: PipelineInfo[],
): AudiencePipeline[] =>
  audiences.map((a: Audience) => ({
    ...a,
    pipeline: pipelines.find((p: PipelineInfo) => p.audiences.includes(a))
      ?.pipeline,
  }));

export default function Flow({ audiences, pipes }: ServiceMap) {
  const [edges, setEdges] = useEdgesState(
    Array.from(mapEdges(audiences).values()),
  );
  const [nodes, setNodes, onNodesChange] = useNodesState(
    Array.from(
      mapNodes(mapAudiencePipelines(audiences, pipes)).values(),
    ),
  );

  return (
    <div
      style={{ width: "100%", height: "100vh" }}
      class="m-0"
    >
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={edges}
        nodeTypes={nodeTypes}
        defaultViewport={{
          x: 0,
          y: 150,
          zoom: .85,
        }}
      >
        <Background style={{ height: "100vh" }} />
        <Controls position="top-right" style={{ marginTop: "30px" }} />
      </ReactFlow>
    </div>
  );
}
