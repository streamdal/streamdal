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
import {
  useCallback,
  useEffect,
  useState,
} from "https://esm.sh/preact@10.15.1/hooks";
import { PipelineInfo } from "snitch-protos/protos/info.ts";
import { GetServiceMapResponse } from "snitch-protos/protos/external.ts";

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

const flowKey = "flow-storage";

export default function Flow({ data }: { data: GetServiceMapResponse }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgeChange] = useEdgesState([]);
  const [rfInstance, setRfInstance] = useState<any>();

  const example = [
    {
      audience: {
        serviceName: "Test Service Name",
        componentName: "kafka",
        operationType: 1,
      },
    },
    {
      audience: {
        serviceName: "Test Service Name",
        componentName: "kafka",
        operationType: 2,
      },
    },
    {
      audience: {
        serviceName: "Test Service Name",
        componentName: "kafka",
        operationType: 2,
      },
    },
    {
      audience: {
        serviceName: "Test Service Name",
        componentName: "kafka",
        operationType: 1,
      },
    },
    {
      audience: {
        serviceName: "Test Service Name",
        componentName: "kafka",
        operationType: 2,
      },
    },
  ];

  useEffect(() => {
    //todo: add functionality for more than one service and component
    // console.log(localStorage[flowKey]);
    const keys = Object.keys(data.serviceMap);
    const serviceMap = data.serviceMap;
    //toDo: wire up localStorage (sort of working but need to refine)
    // if (localStorage[flowKey]) {
    //     const flow = JSON.parse(localStorage[flowKey]);

    //     if (flow) {
    //       const { x = 0, y = 0, zoom = 1 } = flow.viewport;
    //       setNodes(flow.nodes || []);
    //       setEdges(flow.edges || []);
    //     }
    // } else {
    const nodes = [
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
          label: `${serviceMap[keys[0]].pipelines[0].audience
            ?.componentName}`,
        },
      },
    ];
    // console.log([...nodes, ...getOperation(example)]);

    setNodes([
      ...nodes,
      ...getOperation(serviceMap[keys[0]].pipelines),
      // ...getOperation(example),
    ]);
    // }
  }, []);

  useEffect(() => {
    //edges created based off the nodes created
    const unique = nodes.reduce((acc: [], node: Node) => {
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

  useEffect(() => {
    if (nodes) {
      setStorage();
    }
  }, [edges, nodes]);

  const getOperation = (pipeline: PipelineInfo[]) => {
    //creates producer and consumer nodes based on audience data. Messy and seperated because node groupings based on seperate consumers and producers
    //had to hack in the zIndex as the reactFlow native zIndex wasn't working
    const consumers = pipeline.filter((info) =>
      info.audience?.operationType === 1
    );
    const consumerNodes = consumers.map(
      (component: PipelineInfo, i: number) => {
        const isCovered = i !== 0 ? true : false;
        return {
          id: `${2000 + i}`,
          type: "consumer",
          dragHandle: "#dragHandle",
          position: isCovered
            ? { x: 0 - (i * 4), y: 0 + (i * 4) }
            : { x: 50, y: 200 },
          style: { zIndex: isCovered ? 20 - i : 20 },
          ...(isCovered && { parentNode: "2000" }),
          data: {
            label: component.audience?.operationName,
            source: "bottom",
            target: "top",
            instances: i === 0 && consumers.length,
            pipeline: component,
            flow: true,
          },
        };
      },
    );

    const producers = pipeline.filter((info) =>
      info.audience?.operationType === 2
    );
    const producerNodes = producers.map(
      (component: PipelineInfo, i: number) => {
        const isCovered = i !== 0 ? true : false;
        return {
          id: `${1000 + i}`,
          type: "producer",
          dragHandle: "#dragHandle",
          position: isCovered
            ? { x: 0 - (i * 4), y: 0 + (i * 4) }
            : { x: 325, y: 200 },
          style: { zIndex: isCovered ? 20 - i : 20 },
          ...(i > 0 && { parentNode: "1000" }),
          data: {
            label: component.audience?.operationName,
            source: "bottom",
            target: "top",
            instances: i === 0 && producers.length,
            pipeline: component,
            flow: true,
          },
        };
      },
    );
    return [consumerNodes, producerNodes].flat();
  };

  const setStorage = useCallback(() => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      localStorage.setItem(flowKey, JSON.stringify(flow));
    }
  }, [rfInstance]);

  return (
    <div
      style={{ width: "100%", height: "100vh" }}
      class="mt-[-64px] z-10"
    >
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={edges}
        nodeTypes={nodeTypes}
        onInit={setRfInstance}
        defaultViewport={{
          x: 0,
          y: 150,
          zoom: .85,
        }}
      >
        <Background style={{ height: "100vh" }} />
        <Controls position="top-right" style={{ marginTop: "90px" }} />
      </ReactFlow>
    </div>
  );
}
