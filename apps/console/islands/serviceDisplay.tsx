import ReactFlow, {
  Background,
  EdgeTypes,
  useEdgesState,
  useNodesState,
} from "reactflow";
import {
  ComponentNode,
  GroupNode,
  OperationNode,
  ServiceNode,
} from "../components/serviceMap/customNodes.tsx";
import { useSignalEffect } from "@preact/signals";
import { Audience } from "streamdal-protos/protos/sp_common.ts";
import { Pipeline } from "streamdal-protos/protos/sp_pipeline.ts";
import { FlowEdge, FlowNode } from "../lib/nodeMapper.ts";
import { serviceSignal } from "../components/serviceMap/serviceSignal.ts";
import { useRef } from "preact/hooks";
import { OP_MODAL_WIDTH } from "root/lib/const.ts";
import { ServerError } from "../components/error/server.tsx";

import { EmptyService } from "../components/serviceMap/emptyService.tsx";
import {
  ComponentEdge,
  ServiceEdge,
} from "../components/serviceMap/customEdge.tsx";
import {
  OP_MODAL_KEY,
  opModal,
} from "../components/serviceMap/opModalSignal.ts";
import { serverErrorSignal } from "../components/serviceMap/serverErrorSignal.tsx";
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

export default function ServiceDisplay(
  { initNodes, initEdges }: {
    initNodes: FlowNode[];
    initEdges: FlowEdge[];
  },
) {
  const wrapper = useRef<HTMLDivElement | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);

  const defaultViewport = {
    x: 0,
    y: 150,
    zoom: .65,
  };

  useSignalEffect(() => {
    localStorage.setItem(OP_MODAL_KEY, JSON.stringify(opModal.value));
  });

  useSignalEffect(() => {
    if (serviceSignal.value?.streamingUpdate) {
      setNodes(serviceSignal.value.displayNodes);
      setEdges(serviceSignal.value.displayEdges);
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
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        defaultViewport={defaultViewport}
        edgeTypes={edgeTypes}
        onClick={(e: any) => clearModal(e)}
      >
        {serverErrorSignal.value
          ? <ServerError message={serverErrorSignal.value} />
          : nodes.length === 0 &&
              initNodes.length === 0
          ? <EmptyService />
          : null}

        <Background
          style={{ height: "100vh" }}
        />
      </ReactFlow>
    </div>
  );
}
