import { debounce } from "$std/async/debounce.ts";
import ReactFlow, {
  Background,
  ControlButton,
  Controls,
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

import { useSignalEffect } from "@preact/signals";
import { useState } from "preact/hooks";
import { OP_MODAL_WIDTH } from "root/lib/const.ts";
import { Audience } from "streamdal-protos/protos/sp_common.ts";
import { Pipeline } from "streamdal-protos/protos/sp_pipeline.ts";
import { ServerError } from "../components/error/server.tsx";
import { serviceSignal } from "../components/serviceMap/serviceSignal.ts";
import { FlowEdge, FlowNode } from "../lib/nodeMapper.ts";

import { showNav } from "root/components/nav/signals.ts";
import IconX from "tabler-icons/tsx/x.tsx";
import {
  ComponentEdge,
  ServiceEdge,
} from "../components/serviceMap/customEdge.tsx";
import { EmptyService } from "../components/serviceMap/emptyService.tsx";
import {
  OP_MODAL_KEY,
  opModal,
} from "../components/serviceMap/opModalSignal.ts";
import { serverErrorSignal } from "../components/serviceMap/serverErrorSignal.tsx";
const LAYOUT_KEY = "service-display-layout";

const DEFAULT_VIEWPORT = {
  x: 0,
  y: 150,
  zoom: .65,
};

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

const mergeNodes = (
  left: FlowNode[],
  right: FlowNode[],
) =>
  left?.map((i) => ({
    ...i,
    ...right.find(({ id }) => id === i.id),
  }));

const serializeDisplay = debounce(
  (rfInstance: ReactFlowInstance) => {
    localStorage.setItem(LAYOUT_KEY, JSON.stringify(rfInstance.toObject()));
  },
  500,
);

const deserializeDisplay = () => {
  try {
    const layout = localStorage.getItem(LAYOUT_KEY);
    return layout ? JSON.parse(layout) : null;
  } catch (e) {
    console.error("failed to deserialize and parse saved service layout", e);
  }
};

export default function ServiceDisplay(
  { initNodes, initEdges }: {
    initNodes: FlowNode[];
    initEdges: FlowEdge[];
  },
) {
  const savedDisplay = deserializeDisplay();
  const savedNodes = savedDisplay?.nodes || [];
  const viewPort = savedDisplay?.viewPort || DEFAULT_VIEWPORT;
  const [rfInstance, setRfInstance] = useState(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(
    mergeNodes(initNodes, savedNodes),
  );

  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);

  useSignalEffect(() => {
    localStorage.setItem(OP_MODAL_KEY, JSON.stringify(opModal.value));
  });

  useSignalEffect(() => {
    if (serviceSignal.value?.streamingUpdate) {
      setNodes(mergeNodes(serviceSignal.value.displayNodes, savedNodes));
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
      onClick={() => showNav.value = false}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={(change: any) => {
          onNodesChange(change);
          rfInstance && serializeDisplay(rfInstance);
        }}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        defaultViewport={viewPort}
        edgeTypes={edgeTypes}
        onClick={(e: any) => clearModal(e)}
        onInit={setRfInstance}
      >
        {serverErrorSignal.value
          ? <ServerError message={serverErrorSignal.value} />
          : nodes?.length === 0
          ? <EmptyService />
          : null}

        <Background
          style={{ height: "100vh" }}
        />
        <Controls position="bottom-right" style={{ marginBottom: "80px" }}>
          <ControlButton
            onClick={() => {
              localStorage.removeItem(LAYOUT_KEY);
              setNodes(serviceSignal.value.displayNodes);
            }}
            title="reset view"
          >
            <IconX class="max-w-[18px] max-h-[18px] pointer-events-none" />
          </ControlButton>
        </Controls>
      </ReactFlow>
    </div>
  );
}
