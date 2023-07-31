import ReactFlow, { Background, Controls, useEdgesState } from "reactflow";
import {
  Consumer,
  Platform,
  Producer,
  Service,
} from "../components/customNodes.tsx";
import {
  MarkerType,
  useNodesState,
} from "https://esm.sh/v128/@reactflow/core@11.7.4/X-YS9AdHlwZXMvcmVhY3Q6cHJlYWN0L2NvbXBhdCxyZWFjdC1kb206cHJlYWN0L2NvbXBhdCxyZWFjdDpwcmVhY3QvY29tcGF0CmUvcHJlYWN0L2NvbXBhdA/denonext/core.mjs";
import "flowbite";
import { useEffect } from "https://esm.sh/preact@10.15.1/hooks";


const nodeTypes = {
  platform: Platform,
  producer: Producer,
  consumer: Consumer,
  service: Service,
};

export default function Flow(props: any) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgeChange] = useEdgesState([]);

  useEffect(() => {
    const keys = Object.keys(props.props.serviceMap);
    const serviceMap = props.props.serviceMap;
    let nodes = [
      {
        id: "1",
        type: "service",
        dragHandle: "#dragHandle",
        position: { x: 150, y: 0 },
        data: { label: `${serviceMap[keys[0]].name}` },
      },
      {
        id: "10",
        type: "platform",
        sourcePosition: "right",
        targetPosition: "left",
        position: { x: 215, y: 350 },
        data: {
          label: `${serviceMap[keys[0]].pipelines[0].audience.componentName}`,
        },
      },
    ];
    setNodes([
      ...nodes,
      getProducers(serviceMap[keys[0]].producers),
      getConsumers(serviceMap[keys[0]].consumers),
    ]);
  }, []);

  useEffect(() => {
    const newEdges = nodes.map((node: any, i: any) => {
      let targetNode;
      if (node.type === "service") {
        targetNode = nodes.find((node) => node.type === "producer");
      } else if (node.type === "producer") {
        targetNode = nodes.find((node) => node.type === "platform");
      } else if (node.type === "platform") {
        targetNode = nodes.find((node) => node.type === "consumer");
      } else {
        targetNode = nodes.find((node) => node.type === "service");
      }
      return {
        id: i,
        source: node.id,
        target: `${targetNode?.id}`,
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
      };
    });
    setEdges(newEdges)
  }, [nodes]);

  const getProducers = (prod: any) => {
    if (prod.length === 0) {
      return {
        id: "1000",
        type: "producer",
        dragHandle: "#dragHandle",
        position: { x: 325, y: 200 },
        zIndex: 2,
        data: { label: "Producer", source: "bottom", target: "top" },
      };
    } else {
      return {
        id: "1000",
        type: "producer",
        dragHandle: "#dragHandle",
        position: { x: 325, y: 200 },
        zIndex: 2,
        data: { label: "Producer", source: "bottom", target: "top" },
      };
    }
  };

  const getConsumers = (prod: any) => {
    if (prod.length === 0) {
      return {
        id: "2000",
        type: "consumer",
        dragHandle: "#dragHandle",
        position: { x: 50, y: 200 },
        zIndex: 2,
        data: { label: "Consumer", source: "bottom", target: "top" },
      };
    } else {
      return {
        id: "2000",
        type: "consumer",
        dragHandle: "#dragHandle",
        position: { x: 50, y: 200 },
        zIndex: 2,
        data: { label: "Consumer", source: "bottom", target: "top" },
      };
    }
  };

  return (
    <div
      style={{ width: "100%", height: "100vh", zIndex: 0 }}
      class="m-0 z-10"
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
