import ReactFlow, { Background, Controls, useEdgesState } from "reactflow";
import {
  Component,
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
  component: Component,
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
  zIndex?: number;
  data: {
    label: string;
  };
};

export default function Flow(props: any) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgeChange] = useEdgesState([]);

  useEffect(() => {
    //todo: add functionality for more than one service and component
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
        type: "component",
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
      ...getOperation(serviceMap[keys[0]].pipelines),
    ]);
  }, []);

  useEffect(() => {
    //edges created based off the node created
    const unique = nodes.reduce((acc: any, node: Node) => {
      if (!acc.length || !acc.find((item: Node) => item.type === node.type)) {
        return [...acc, node];
      } else {
        return acc;
      }
    }, []);
    const newEdges = unique.map((node: Node, i: number) => {
      let targetNode;
      switch (node.type) {
        case ("service"):
          targetNode = nodes.find((node: Node) => node.type === "producer");
          break;
        case ("producer"):
          targetNode = nodes.find((node: Node) => node.type === "component");
          break;
        case ("component"):
          targetNode = nodes.find((node: Node) => node.type === "consumer");
          break;
        case ("consumer"):
          targetNode = nodes.find((node: Node) => node.type === "service");
          break;
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

  const getOperation = (pipeline: any) => {
    //creates producer and consumer nodes
    return pipeline.map((component: any, i: number) => {
      switch (component.audience.operationType) {
        case (1):
          return {
            id: `${2000 + i}`,
            type: "consumer",
            dragHandle: "#dragHandle",
            position: { x: 50 + (i * 4), y: 200 },
            zIndex: 2,
            data: { label: "Consumer", source: "bottom", target: "top" },
          };
        case (2):
          return {
            id: `${1000 + i}`,
            type: "producer",
            dragHandle: "#dragHandle",
            position: { x: 325 + (i * 4), y: 200 },
            zIndex: 2,
            data: { label: "Producer", source: "bottom", target: "top" },
          };
      }
    });
  };

  return (
    <div
      style={{ width: "100%", height: "100vh" }}
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
