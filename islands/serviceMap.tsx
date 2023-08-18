import ReactFlow, {
  Background,
  ControlButton,
  Controls,
  useEdgesState,
  useNodesState,
} from "reactflow";
import "flowbite";
import IconArrowBackUp from "tabler-icons/tsx/arrow-back-up.tsx";
import {
  ComponentNode,
  GroupNode,
  OperationNode,
  ServiceNode,
} from "../components/serviceMap/customNodes.tsx";
import { signal, useSignalEffect } from "@preact/signals";
import { ServiceNodes } from "../lib/fetch.ts";
import { Audience } from "snitch-protos/protos/common.ts";
import { Pipeline } from "snitch-protos/protos/pipeline.ts";
import { FlowEdge, FlowNode, updateNode } from "../lib/nodeMapper.ts";
import { useEffect, useState } from "preact/hooks";

const LAYOUT_KEY = "service-map-layout";

export const serviceSignal = signal<ServiceNodes | null>(
  null,
);

export type OpUpdate = {
  audience: Audience;
  attachedPipeline?: Pipeline;
};

export const opUpdateSignal = signal<OpUpdate | null>(null);

export const nodeTypes = {
  service: ServiceNode,
  component: ComponentNode,
  consumerGroup: GroupNode,
  producerGroup: GroupNode,
  producer: OperationNode,
  consumer: OperationNode,
};

const serialize = async (instance: any) => {
  localStorage.setItem(LAYOUT_KEY, JSON.stringify(instance.toObject()));
};

export default function ServiceMap(
  { nodesData, edgesData, blur = false }: {
    nodesData: FlowNode[];
    edgesData: FlowEdge[];
    blur?: boolean;
  },
) {
  const savedFlow = JSON.parse(localStorage.getItem(LAYOUT_KEY));
  const [instance, setInstance] = useState(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(
    savedFlow?.nodes?.length > 0 ? savedFlow.nodes : nodesData,
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    savedFlow?.edges?.length > 0 ? savedFlow.edges : edgesData,
  );

  const defaultViewport = savedFlow?.viewport ? savedFlow.viewport : {
    x: 0,
    y: 150,
    zoom: .85,
  };

  useEffect(async () => {
    if (instance) {
      serialize(instance);
    }
  }, nodes);

  useSignalEffect(() => {
    if (opUpdateSignal.value) {
      const updated = updateNode(nodes, opUpdateSignal.value);
      setNodes(updated);
    }
  });

  return (
    <div
      class={`w-full h-screen m-0 ${blur ? "filter blur-sm" : ""}`}
    >
      <ReactFlow
        onInit={setInstance}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        defaultViewport={defaultViewport}
      >
        <Background style={{ height: "100vh" }} />
        <Controls position="top-right" style={{ marginTop: "60px" }}>
          <ControlButton
            onClick={() => {
              setNodes(nodesData), setEdges(edges);
              localStorage.setItem(LAYOUT_KEY, null);
            }}
            title="reset view"
          >
            <IconArrowBackUp class="w-5 h-5" />
          </ControlButton>
        </Controls>
      </ReactFlow>
    </div>
  );
}
