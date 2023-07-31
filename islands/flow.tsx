import ReactFlow, { Background, Controls, useEdgesState } from "reactflow";
import {
  Audience,
  Consumer,
  Producer,
  Service,
} from "../components/customNodes.tsx";
import {
  MarkerType,
  useNodesState,
} from "https://esm.sh/v128/@reactflow/core@11.7.4/X-YS9AdHlwZXMvcmVhY3Q6cHJlYWN0L2NvbXBhdCxyZWFjdC1kb206cHJlYWN0L2NvbXBhdCxyZWFjdDpwcmVhY3QvY29tcGF0CmUvcHJlYWN0L2NvbXBhdA/denonext/core.mjs";
import "flowbite";
import { useEffect } from "https://esm.sh/preact@10.15.1/hooks";
import { string } from "https://deno.land/x/zod@v3.21.4/types.ts";

const nodeTypes = {
  audience: Audience,
  producer: Producer,
  consumer: Consumer,
  service: Service,
};

export type Node = {
  id: string;
  type: string;
  dragHandle: string;
  position: {
    x: number;
    y: number;
  };
  data: {
    label: string;
  };
};

export default function Flow(props: any) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgeChange] = useEdgesState([]);

  useEffect(() => {
    //this currently doesn't support more than one service or audience
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
        type: "audience",
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
    const newEdges = nodes.map((node: Node, i: number) => {
      let targetNode;
      if (node.type === "service") {
        targetNode = nodes.find((node: Node) => node.type === "producer");
      } else if (node.type === "producer") {
        targetNode = nodes.find((node: Node) => node.type === "audience");
      } else if (node.type === "audience") {
        targetNode = nodes.find((node: Node) => node.type === "consumer");
      } else if (node.type === "consumer") {
        targetNode = nodes.find((node: Node) => node.type === "service");
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
    setEdges(newEdges);
  }, [nodes]);

  const getProducers = (prod: []) => {
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

  const getConsumers = (prod: []) => {
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
