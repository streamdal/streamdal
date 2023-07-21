import ReactFlow, { Background, Controls } from "reactflow";
import { Participants, Platform, Service } from "../components/customNodes.tsx";
import {
  MarkerType,
  useNodesState,
  useViewport,
} from "https://esm.sh/v128/@reactflow/core@11.7.4/X-YS9AdHlwZXMvcmVhY3Q6cHJlYWN0L2NvbXBhdCxyZWFjdC1kb206cHJlYWN0L2NvbXBhdCxyZWFjdDpwcmVhY3QvY29tcGF0CmUvcHJlYWN0L2NvbXBhdA/denonext/core.mjs";
import {
  useEffect,
  useState,
} from "https://esm.sh/stable/preact@10.15.1/denonext/hooks.js";

const initialNodes = [
  {
    id: "1",
    type: "service",
    dragHandle: "#dragHandle",
    position: { x: 150, y: 0 },
    data: { label: "Service" },
  },
  {
    id: "2",
    type: "participants",
    dragHandle: "#dragHandle",
    position: { x: 50, y: 200 },
    zIndex: 2,
    data: { label: "Consumer", source: "top", target: "bottom" },
  },
  {
    id: "3",
    type: "participants",
    dragHandle: "#dragHandle",
    position: { x: 325, y: 200 },
    zIndex: 2,
    data: { label: "Producer", source: "bottom", target: "top" },
  },
  {
    id: "4",
    type: "platform",
    sourcePosition: "right",
    targetPosition: "left",
    position: { x: 215, y: 350 },
  },
];
const initialEdges = [
  {
    id: "e1-2",
    source: "2",
    target: "1",
    targetHandle: "c",
    sourceHandle: "a",
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
  },
  {
    id: "e1-3",
    source: "1",
    target: "3",
    sourceHandle: "d",
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
  },
  {
    id: "e4-2",
    source: "4",
    targetHandle: "a",
    target: "2",
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
  },
  {
    id: "e3-4",
    source: "3",
    targetHandle: "b",
    target: "4",
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
  },
];

const nodeTypes = {
  platform: Platform,
  service: Service,
  participants: Participants,
};
export default function Flow() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  // console.log("fuck", window.innerWidth / 2, window.innerHeight / 4);
  const [width, setWidth] = useState<number>(window.innerWidth / 2);
  const [height, setHeight] = useState<number>(window.innerHeight / 2);

  const [defaultViewport, setDefaultViewport] = useState<any>({});

  useEffect(() => {
    setDefaultViewport({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      zoom: 1,
    });
    console.log(defaultViewport);
  }, [width, height]);

  return (
    <div
      style={{ width: "100%", height: "100vh", zIndex: 0 }}
      class="m-0 z-10"
    >
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={initialEdges}
        nodeTypes={nodeTypes}
        defaultViewport={{
          x: window.innerWidth / 3.5,
          y: window.innerHeight / 10,
          zoom: 1,
        }}
      >
        <Background style={{ height: "100vh" }} />
        <Controls position="top-right" style={{ marginTop: "30px" }} />
      </ReactFlow>
    </div>
  );
}
