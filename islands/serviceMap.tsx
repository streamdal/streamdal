import ReactFlow, { Background, useEdgesState, useNodesState } from "reactflow";
import "flowbite";
import {
  ComponentNode,
  GroupNode,
  OperationNode,
  ServiceNode,
} from "../components/serviceMap/customNodes.tsx";
import { signal, useSignalEffect } from "@preact/signals";
import { Audience } from "snitch-protos/protos/sp_common.ts";
import { Pipeline } from "snitch-protos/protos/sp_pipeline.ts";
import { FlowEdge, FlowNode, updateNode } from "../lib/nodeMapper.ts";
import { serviceSignal } from "../components/serviceMap/serviceSignal.ts";
import { useEffect } from "preact/hooks";

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

const serialize = async (instance: any) => {
  localStorage.setItem(LAYOUT_KEY, JSON.stringify(instance.toObject()));
};

export const updateNodes = (
  nodes: FlowNode[],
  nodesMap: Map<string, FlowNode>,
) =>
  nodes.filter((n: FlowNode) => nodesMap.has(n.id)).map((n: FlowNode) => ({
    ...nodesMap.get(n.id),
    position: n.position,
  }));

export default function ServiceMapComponent(
  { initNodes, initEdges, blur = false }: {
    initNodes: FlowNode[];
    initEdges: FlowEdge[];
    blur?: boolean;
  },
) {
  useEffect(() => {
    const url = new URL("./ws/service-map", location.href);
    url.protocol = url.protocol.replace("http", "ws");
    const webSocket = new WebSocket(url);

    webSocket.addEventListener("open", (event) => {
      webSocket.send("ping");
    });

    webSocket.addEventListener("message", (event) => {
      if (event.data === "pong") {
        console.debug("got server pong");
        return;
      }

      try {
        const parsedData = JSON.parse(event.data);
        serviceSignal.value = {
          ...parsedData,
          nodesMap: new Map(parsedData.nodesMap),
          edgesMap: new Map(parsedData.edgesMap),
        };
      } catch (e) {
        console.error("error parsing server data", e);
      }
    });
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

  useSignalEffect(() => {
    if (serviceSignal.value) {
      setNodes(updateNodes(nodes, serviceSignal.value.nodesMap));
      setEdges(serviceSignal.value.displayEdges);
    }
  });

  return (
    <div
      class={`w-full h-screen m-0 ${blur ? "filter blur-sm" : ""}`}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        defaultViewport={defaultViewport}
      >
        <Background style={{ height: "100vh" }} />
      </ReactFlow>
    </div>
  );
}
