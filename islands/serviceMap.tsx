import ReactFlow, {
  Background,
  ControlButton,
  Controls,
  useEdgesState,
  useNodesState,
} from "reactflow";
import {
  ComponentNode,
  FlowEdge,
  FlowNode,
  GroupNode,
  OperationNode,
  ServiceNode,
} from "../components/serviceMap/customNodes.tsx";
import "flowbite";
import { EmptyService } from "../components/serviceMap/emptyService.tsx";
import { useCallback, useState } from "preact/hooks";
import IconArrowBackUp from "tabler-icons/tsx/arrow-back-up.tsx";

const LAYOUT_KEY = "service-map-layout";
const MODAL_ROUTES = ["pipeline"];

export const nodeTypes = {
  service: ServiceNode,
  component: ComponentNode,
  consumerGroup: GroupNode,
  producerGroup: GroupNode,
  producer: OperationNode,
  consumer: OperationNode,
};

export default function ServiceMap(
  { nodesData, edgesData }: { nodesData: FlowNode[]; edgesData: FlowEdge[] },
) {
  const savedFlow = JSON.parse(localStorage.getItem(LAYOUT_KEY));
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    savedFlow?.edges?.length > 0 ? savedFlow.edges : edgesData,
  );
  const [nodes, setNodes, onNodesChange] = useNodesState(
    savedFlow?.nodes?.length > 0 ? savedFlow.nodes : nodesData,
  );
  const [rfInstance, setRfInstance] = useState(null);
  const defaultViewport = savedFlow?.viewport ? savedFlow.viewport : {
    x: 0,
    y: 150,
    zoom: .85,
  };

  const onChange = useCallback(() => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      localStorage.setItem(LAYOUT_KEY, JSON.stringify(flow));
    }
  }, [rfInstance]);

  const blur = MODAL_ROUTES.some((r: string) =>
    window.location?.href?.includes(r)
  );

  return (
    <div
      class={`w-full h-screen m-0 ${blur ? "filter blur-md" : ""}`}
    >
      {nodesData.length === 0 ? <EmptyService /> : null}
      <ReactFlow
        nodes={nodes}
        onNodesChange={(nodesChange) => {
          onChange();
          onNodesChange(nodesChange);
        }}
        edges={edges}
        onInit={setRfInstance}
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
