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
import { Audience } from "streamdal-protos/protos/sp_common.ts";
import { Pipeline } from "streamdal-protos/protos/sp_pipeline.ts";
import { FlowEdge, FlowNode, updateNode } from "../lib/nodeMapper.ts";
import { serviceSignal } from "../components/serviceMap/serviceSignal.ts";
import { useEffect, useRef, useState } from "preact/hooks";
import { OP_MODAL_WIDTH } from "./opModal.tsx";
import { EmptyService } from "../components/serviceMap/emptyService.tsx";
import {
  ComponentEdge,
  ServiceEdge,
} from "../components/serviceMap/customEdge.tsx";
import {
  audienceMetricsSocket,
  serverErrorSocket,
  serviceMapSocket,
} from "../lib/sockets.ts";
import {
  OP_MODAL_KEY,
  opModal,
} from "../components/serviceMap/opModalSignal.ts";
import { ServerError } from "../components/error/server.tsx";
import { serverErrorSignal } from "../components/serviceMap/serverErrorSignal.tsx";
import { SuccessType } from "../routes/_middleware.ts";
import { Toast, toastSignal } from "../components/toasts/toast.tsx";
import { showNav } from "./nav.tsx";

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
  { initNodes, initEdges, success }: {
    initNodes: FlowNode[];
    initEdges: FlowEdge[];
    success?: SuccessType;
  },
) {
  const wrapper = useRef(null);

  const [rfInstance, setRfInstance] = useState(null);

  useEffect(() => {
    const serviceSocket = serviceMapSocket("./ws/service-map");
    const audienceSocket = audienceMetricsSocket("./ws/audience-metrics");
    const errorSocket = serverErrorSocket("./ws/server-error");
    return () => {
      serviceSocket?.close();
      audienceSocket?.close();
      errorSocket?.close();
    };
  }, []);

  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);

  const defaultViewport = {
    x: 0,
    y: 150,
    zoom: .85,
  };

  if (success?.message && window?.location?.pathname === "/") {
    toastSignal.value = {
      id: "global",
      type: success.status ? "success" : "error",
      message: success.message,
    };
  }

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
    localStorage.setItem(OP_MODAL_KEY, JSON.stringify(opModal.value));

    if (opUpdateSignal.value) {
      const updated = updateNode(nodes, opUpdateSignal.value);
      setNodes(updated);
    }
  });

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
      class={`w-full h-screen m-0 w-[calc(100vw-${OP_MODAL_WIDTH})]`}
      ref={wrapper}
      onClick={() => showNav.value = false}
    >
      {serverErrorSignal.value
        ? <ServerError message={serverErrorSignal.value} />
        : null}
      <Toast id={"global"} />
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
        {!serverErrorSignal.value && nodes.length === 0 && <EmptyService />}
        <Background
          style={{ height: "100vh" }}
        />
      </ReactFlow>
    </div>
  );
}
