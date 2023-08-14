import ReactFlow, {
  Background,
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
  const [edges] = useEdgesState(edgesData);
  const [nodes, _, onNodesChange] = useNodesState(nodesData);

  return (
    <div class="w-full h-screen m-0">
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
