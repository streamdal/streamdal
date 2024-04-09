import ReactFlow, {
  Background,
  EdgeTypes,
  ReactFlowInstance,
  useEdgesState,
  useNodesState,
} from "reactflow";
import {
  ComponentNode,
  GroupNode,
  OperationNode,
  ServiceNode,
} from "../components/serviceMap/customNodes.tsx";
import { signal, useSignalEffect } from "@preact/signals";
import { Audience } from "streamdal-protos/protos/sp_common.ts";
import { Pipeline } from "streamdal-protos/protos/sp_pipeline.ts";
import { FlowEdge, FlowNode } from "../lib/nodeMapper.ts";
import { serviceSignal } from "../components/serviceMap/serviceSignal.ts";
import { useRef, useState } from "preact/hooks";
import { OP_MODAL_WIDTH } from "root/lib/const.ts";

import { EmptyService } from "../components/serviceMap/emptyService.tsx";
import {
  ComponentEdge,
  ServiceEdge,
} from "../components/serviceMap/customEdge.tsx";
import {
  OP_MODAL_KEY,
  opModal,
} from "../components/serviceMap/opModalSignal.ts";
import { ServerError } from "../components/error/server.tsx";
import { serverErrorSignal } from "../components/serviceMap/serverErrorSignal.tsx";
import { SuccessType } from "../routes/_middleware.ts";
import { Toast, toastSignal } from "../components/toasts/toast.tsx";
import { showNav } from "root/components/nav/signals.ts";

export type OpUpdate = {
  audience: Audience;
  attachedPipelines?: Pipeline[];
};

const nodeTypes = {
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

export default function ServiceMapComponent(
  { initNodes, initEdges, success }: {
    initNodes: FlowNode[];
    initEdges: FlowEdge[];
    success?: SuccessType;
  },
) {
  const wrapper = useRef<HTMLDivElement | null>(null);
  const [rfInstance, setRfInstance] = useState(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);

  const defaultViewport = {
    x: 0,
    y: 150,
    zoom: .85,
  };

  if (success?.message && globalThis?.location?.pathname === "/") {
    toastSignal.value = {
      id: "global",
      type: success.status ? "success" : "error",
      message: success.message,
    };
  }

  const fit = (nodes: FlowNode[], rfInstance: any) => {
    const rect = wrapper?.current?.getBoundingClientRect();
    if (
      rect?.right && rfInstance &&
      nodes.find((n: FlowNode) => n.position.x > rect.right)
    ) {
      //
      // TODO, use useNodesInitialized instead of a timeout hack,
      // which doesn't currently work in our deno fresh setup
      setTimeout(() => rfInstance.fitView(), 100);
    }
  };

  useSignalEffect(() => {
    localStorage.setItem(OP_MODAL_KEY, JSON.stringify(opModal.value));
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

  const clearModal = (e: any) => {
    if (e.target.className === "react-flow__pane react-flow__pane") {
      opModal.value = { clients: 0 };
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
          fit(nodes, reactFlowInstance);
          setRfInstance(reactFlowInstance as any);
        }}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        defaultViewport={defaultViewport}
        edgeTypes={edgeTypes}
        onClick={(e: any) => clearModal(e)}
      >
        {serverErrorSignal.value === "" &&
          (serviceSignal.value.browserInitialized && nodes.length === 0 ||
            !serviceSignal.value.browserInitialized &&
              initNodes.length === 0) &&
          <EmptyService />}

        <Background
          style={{ height: "100vh" }}
        />
      </ReactFlow>
    </div>
  );
}
