import ReactFlow, { Background, useEdgesState, useNodesState } from "reactflow";
import "flowbite";
import {
  ComponentNode,
  GroupNode,
  OperationNode,
  ServiceNode,
} from "../components/serviceMap/customNodes.tsx";
import { signal, useSignalEffect } from "@preact/signals";
import { Audience } from "snitch-protos/protos/sp_common.ts";
import { Pipeline } from "snitch-protos/protos/sp_pipeline.ts";
import { updateNode } from "../lib/nodeMapper.ts";
import { GrpcConfigs, streamServiceMap } from "../lib/client/stream.ts";
import { serviceDisplaySignal } from "../components/serviceMap/serviceSignal.ts";

const LAYOUT_KEY = "service-map-layout";

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
  { grpcConfigs, blur = false }: {
    grpcConfigs: GrpcConfigs;
    blur?: boolean;
  },
) {
  void streamServiceMap(grpcConfigs);

  const [nodes, setNodes, onNodesChange] = useNodesState();
  const [edges, setEdges, onEdgesChange] = useEdgesState();

  const defaultViewport = {
    x: 0,
    y: 150,
    zoom: .85,
  };

  useSignalEffect(() => {
    if (opUpdateSignal.value) {
      const updated = updateNode(nodes, opUpdateSignal.value);
      setNodes(updated);
    }
  });

  useSignalEffect(() => {
    if (serviceDisplaySignal?.value) {
      console.log(
        "shit client service display signal",
        serviceDisplaySignal?.value,
      );
      setNodes(serviceDisplaySignal.value.displayNodes);
      setEdges(serviceDisplaySignal.value.displayEdges);
    }
  });

  return (
    <div
      class={`w-full h-screen m-0 ${blur ? "filter blur-sm" : ""}`}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        defaultViewport={defaultViewport}
      >
        <Background style={{ height: "100vh" }} />
      </ReactFlow>
    </div>
  );
}
