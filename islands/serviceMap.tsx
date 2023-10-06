import ReactFlow, {
  Background,
  EdgeTypes,
  ReactFlowInstance,
  useEdgesState,
  useNodesState,
} from "reactflow";
import "flowbite";
import {
  ComponentNode,
  GroupNode,
  OperationNode,
  ServiceNode,
} from "./customNodes.tsx";
import { signal, useSignalEffect } from "@preact/signals";
import { Audience } from "snitch-protos/protos/sp_common.ts";
import { Pipeline } from "snitch-protos/protos/sp_pipeline.ts";
import { FlowEdge, FlowNode, updateNode } from "../lib/nodeMapper.ts";
import { serviceSignal } from "../components/serviceMap/serviceSignal.ts";
import { useEffect, useRef, useState } from "preact/hooks";
import { OP_MODAL_WIDTH } from "./opModal.tsx";
import { EmptyService } from "../components/serviceMap/emptyService.tsx";
import {
  ComponentEdge,
  ServiceEdge,
} from "../components/serviceMap/customEdge.tsx";
import { opModal } from "../components/serviceMap/opModalSignal.ts";
import { audienceMetricsSocket, serviceMapSocket } from "../lib/sockets.ts";

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

const edgeTypes: EdgeTypes = {
  serviceEdge: ServiceEdge,
  componentEdge: ComponentEdge,
};

const serialize = async (instance: any) => {
  localStorage.setItem(LAYOUT_KEY, JSON.stringify(instance.toObject()));
};

//
// Todo updates in the ui need some work
export const updateNodes = (
  nodes: FlowNode[],
  nodesMap: Map<string, FlowNode>,
) => {
  if (nodes?.length === 0) {
    return Array.from(serviceSignal.value.nodesMap.values());
  }

  const newNodes = nodes.filter((n: FlowNode) => nodesMap.has(n.id)).map((
    n: FlowNode,
  ) => {
    const node = {
      ...nodesMap.get(n.id),
      position: n.position,
    };
    //
    // remove updated node so only new nodes remain for adding afterwards
    nodesMap.delete(n.id);
    return node;
  });
  return [...newNodes, ...Array.from(nodesMap.values())];
};

export const updateEdges = (
  edges: FlowEdge[],
  edgesMap: Map<string, FlowEdge>,
) => {
  if (edges?.length === 0) {
    return Array.from(serviceSignal.value.edgesMap.values());
  }

  const newEdges = edges.filter((e: FlowEdge) => edgesMap.has(e.id)).map((
    e: FlowEdge,
  ) => {
    const edge = edgesMap.get(e.id);
    edgesMap.delete(e.id);
    return edge;
  });
  return [...newEdges, ...Array.from(edgesMap.values())];
};

export default function ServiceMapComponent(
  { initNodes, initEdges, grpcUrl, grpcToken, blur = false }: {
    initNodes: FlowNode[];
    initEdges: FlowEdge[];
    grpcUrl: string;
    grpcToken: string;
    blur?: boolean;
  },
) {
  const wrapper = useRef(null);
  const [rfInstance, setRfInstance] = useState(null);

  useEffect(() => {
    const serviceSocket = serviceMapSocket("./ws/service-map");
    const audienceSocket = audienceMetricsSocket("./ws/audience-metrics");
    return () => {
      serviceSocket?.close();
      audienceSocket?.close();
    };
  }, []);

  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);

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

  const fit = (nodes: FlowNode[], rfInstance) => {
    const { right } = wrapper?.current?.getBoundingClientRect();
    if (
      right && rfInstance && nodes.find((n: FlowNode) => n.position.x > right)
    ) {
      //
      // TODO, use useNodesInitialized instead of a timeout hack,
      // which doesn't currently work in our deno fresh setup
      setTimeout(() => rfInstance.fitView(), 100);
    }
  };

  useSignalEffect(() => {
    if (serviceSignal.value) {
      const nodes: FlowNode[] = Array.from(
        serviceSignal.value.nodesMap.values(),
      );
      setNodes(Array.from(serviceSignal.value.nodesMap.values()));
      serviceSignal.value.edgesMap &&
        setEdges(Array.from(serviceSignal.value.edgesMap.values()));

      fit(nodes, rfInstance);
    }
  });

  const clearModal = (e) => {
    if (e.target.className === "react-flow__pane react-flow__pane") {
      opModal.value = null;
    }
  };

  return (
    <div
      class={`w-full h-screen m-0 ${
        blur ? "filter blur-sm" : ""
      } w-[calc(100vw-${OP_MODAL_WIDTH})]`}
      ref={wrapper}
    >
      <ReactFlow
        onInit={(reactFlowInstance: ReactFlowInstance) => {
          setRfInstance(reactFlowInstance, fit(nodes, reactFlowInstance));
        }}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        defaultViewport={defaultViewport}
        edgeTypes={edgeTypes}
        onClick={(e) => clearModal(e)}
      >
        {nodes.length === 0 && <EmptyService />}
        <Background
          style={{ height: "100vh" }}
        />
      </ReactFlow>
    </div>
  );
}
