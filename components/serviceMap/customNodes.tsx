import { Handle, MarkerType, Position } from "reactflow";
import IconGripVertical from "tabler-icons/tsx/grip-vertical.tsx";
import IconDatabase from "tabler-icons/tsx/database.tsx";
import "flowbite";
import "twind";
import { useState } from "preact/hooks";
import { Audience, OperationType } from "snitch-protos/protos/common.ts";
import { NodeMenu, ServiceNodeMenu } from "./nodeMenu.tsx";
import { ProducerIcon } from "../icons/producer.tsx";
import { ConsumerIcon } from "../icons/consumer.tsx";
import { removeWhitespace, titleCase } from "../../lib/utils.ts";
import { Pipeline } from "snitch-protos/protos/pipeline.ts";
import {
  ClientInfo,
  LiveInfo,
  PipelineInfo,
} from "snitch-protos/protos/info.ts";
import { Tooltip } from "../tooltip/tooltip.tsx";

export type AudiencePipeline = Audience & {
  pipeline?: Pipeline;
  clients?: ClientInfo[];
};

export type NodeData = {
  label: string;
  audience: AudiencePipeline;
  groupCount?: number;
};

export type FlowNode = {
  id: string;
  type?: string;
  dragHandle?: string;
  draggable?: boolean;
  position?: {
    x: number;
    y: number;
  };
  sourcePosition?: string;
  targetPosition?: string;
  data: NodeData;
  parentNode?: string;
  extent?: string;
  style?: any;
};

export type GroupCount = {
  producer: number;
  consumer: number;
};
//
// group counts per service are used for vertical offset layout positions
export type NodesMap = {
  nodes: Map<string, FlowNode>;
  groupCount: Map<string, GroupCount>;
};

export type FlowEdge = {
  id: string;
  source: string;
  target: string;
  markerEnd: any;
  style: any;
};

export const xOffset = (serviceCount: number) =>
  serviceCount > 1 ? (serviceCount - 1) * 800 : 0;

export const mapOperation = (
  nodesMap: NodesMap,
  a: Audience,
) => {
  const op = OperationType[a.operationType].toLowerCase();
  const groupCount = nodesMap.groupCount.get(a.serviceName);
  groupCount.producer = groupCount.producer + (op === "producer" ? 1 : 0);
  groupCount.consumer = groupCount.consumer + (op === "consumer" ? 1 : 0);
  nodesMap.groupCount.set(a.serviceName, groupCount);

  nodesMap.nodes.set(`${a.serviceName}-${a.componentName}-${op}`, {
    id: `${a.serviceName}-${a.componentName}-${op}`,
    type: `${op}Group`,
    sourcePosition: "right",
    targetPosition: "left",
    dragHandle: "#dragHandle",
    position: {
      x: (op === "consumer" ? 25 : 350) + xOffset(nodesMap.groupCount.size),
      y: 200,
    },
    data: {
      label: `${titleCase(op)}s`,
      audience: a,
      groupCount: groupCount[op],
    },
  });

  nodesMap.nodes.set(a.operationName, {
    id: a.operationName,
    draggable: false,
    type: op,
    position: {
      x: 10,
      y: 38 + ((groupCount[op] - 1) * 70),
    },
    parentNode: `${a.serviceName}-${a.componentName}-${op}`,
    extent: "parent",
    data: {
      label: a.operationName,
      instances: 0,
      pipeline: {},
      audience: a,
    },
  });
};

export const mapNodes = (
  audiences: AudiencePipeline[],
): NodesMap => {
  const nodesMap = {
    nodes: new Map<string, FlowNode>(),
    groupCount: new Map<string, GroupCount>(),
  };

  audiences.forEach((a: Audience, i: number) => {
    if (!nodesMap.groupCount.has(a.serviceName)) {
      nodesMap.groupCount.set(a.serviceName, { producer: 0, consumer: 0 });
    }

    nodesMap.nodes.set(a.serviceName, {
      id: a.serviceName,
      type: "service",
      dragHandle: "#dragHandle",
      position: { x: 150 + xOffset(nodesMap.groupCount.size), y: 0 },
      data: { label: a.serviceName, audience: a },
    });

    mapOperation(nodesMap, a);

    const groupCount = nodesMap.groupCount.get(a.serviceName);
    const count = Math.max(
      groupCount["producer"] || 1,
      groupCount["consumer"] || 1,
    );

    nodesMap.nodes.set(a.componentName, {
      id: a.componentName,
      type: "component",
      sourcePosition: "right",
      targetPosition: "left",
      dragHandle: "#dragHandle",
      position: {
        x: 215 + xOffset(nodesMap.groupCount.size),
        y: 350 + (count - 1) * 70,
      },
      data: { label: a.componentName, audience: a },
    });
  });

  return nodesMap;
};

//
// For each audience there are a pair of edges, one for each arrow:
// consumers: component -> consumer group -> service
// producers: service -> producer group -> component
export const mapEdgePair = (
  edgesMap: Map<string, FlowEdge>,
  a: Audience,
): Map<string, FlowEdge> => {
  const op = OperationType[a.operationType].toLowerCase();
  edgesMap.set(`${a.componentName}-${op}`, {
    id: `${a.componentName}-${op}`,
    ...op === "consumer"
      ? {
        source: a.componentName,
        target: `${a.serviceName}-${a.componentName}-${op}`,
      }
      : {
        source: `${a.serviceName}-${a.componentName}-${op}`,
        target: a.componentName,
      },
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
  });

  edgesMap.set(`${a.serviceName}-${op}`, {
    id: `${a.serviceName}-${op}`,
    ...op === "consumer"
      ? {
        source: `${a.serviceName}-${a.componentName}-${op}`,
        target: a.serviceName,
      }
      : {
        source: a.serviceName,
        target: `${a.serviceName}-${a.componentName}-${op}`,
      },
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
  });

  return edgesMap;
};

export const mapEdges = (audiences: Audience[]): Map<string, FlowEdge> => {
  const edgesMap = new Map<string, FlowEdge>();
  audiences.forEach((a: Audience) => mapEdgePair(edgesMap, a));
  return edgesMap;
};

export const mapAudiencePipelines = (
  audiences: Audience[],
  pipelines: PipelineInfo[],
  liveInfo: LiveInfo[],
): AudiencePipeline[] =>
  audiences.map((a: Audience) => ({
    ...a,
    pipeline: pipelines.find((p: PipelineInfo) => p.audiences.includes(a))
      ?.pipeline,
    clients: liveInfo?.filter((l: LiveInfo) => l.audiences.includes(a))?.map((
      l: LiveInfo,
    ) => l.client),
  }));

export const ServiceNode = ({ data }: { data: { label: string } }) => {
  return (
    <div>
      <div class="min-h-[80px] w-[320px] flex items-center justify-between bg-white rounded-lg shadow-lg z-10 border-1 border-purple-200 px-2">
        <IconGripVertical
          class="w-6 h-6 text-purple-100"
          id="dragHandle"
        />
        <img
          src={"/images/placeholder-icon.png"}
          className={"h-[40px]"}
        />
        <div>
          <h2 className={"text-lg mr-3 ml-2"}>{data.label}</h2>
          <p class="text-streamdalPurple text-xs font-semibold mt-1">
            4 instances
          </p>
        </div>
        <ServiceNodeMenu />
      </div>
      <span class="sr-only">Notifications</span>

      <div className={"flex justify-evenly w-1/2 mt-2"}>
        <Handle
          type="target"
          id="c"
          position={Position.Bottom}
          style={{ opacity: 0, background: "#FFFFFF", position: "relative" }}
        />
        <Handle
          type="source"
          id="d"
          position={Position.Bottom}
          style={{ opacity: 0, background: "#FFFFFF", position: "relative" }}
        />
      </div>
    </div>
  );
};

export const GroupNode = ({ data }: { data: NodeData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const producer = OperationType[data.audience.operationType] ==
    OperationType[OperationType.PRODUCER];

  const handleModalOpen = () => {
    setIsOpen(true);
  };

  const height = 124 + ((data.groupCount - 1) * 68);

  return (
    <div
      class={`rounded-lg shadow-lg border-1 border-purple-200 min-w-[280px] min-h-[${height}px]`}
    >
      <div id="dragHandle" class="flex flex-row items-center mt-2">
        <IconGripVertical class="w-6 h-6 ml-2 text-purple-100 bg-white border border-purple-200" />
        <div class="ml-2">{data.label}</div>
      </div>

      <Handle
        type="source"
        position={producer ? Position.Bottom : Position.Top}
        style={{ opacity: 0 }}
      />
      <Handle
        type="target"
        position={producer ? Position.Top : Position.Bottom}
        style={{ opacity: 0 }}
      />
    </div>
  );
};

export const OperationNode = ({ data }: { data: NodeData }) => {
  const producer = OperationType[data.audience.operationType] ==
    OperationType[OperationType.PRODUCER];
  const toolTipId = removeWhitespace(data.label);

  return (
    <div class="h-[96px]">
      <div
        type="button"
        class="flex items-center justify-betweenw-[250px] h-[64px] bg-white rounded-lg shadow-lg border-1 border-purple-200 pl-1 pr-2"
      >
        <div class="flex flex-row items-center">
          {producer
            ? <ProducerIcon class="w-5 h-5 mx-2" />
            : <ConsumerIcon class="w-5 h-5 mx-2" />}
        </div>
        <div class="w-[170px] whitespace-nowrap text-ellipsis overflow-hidden">
          <a
            href={`/service/${
              encodeURIComponent(data.audience.serviceName)
            }/component/${encodeURIComponent(data.audience.componentName)}/${
              OperationType[data.audience.operationType]
            }/op/${encodeURIComponent(data.audience.operationName)}`}
          >
            <div
              class={"flex flex-col justify-start p-1"}
            >
              <h2
                data-tooltip-target={toolTipId}
                class={"text-[16px] whitespace-nowrap text-ellipsis overflow-hidden"}
              >
                {data.label}
              </h2>
              <Tooltip
                targetId={toolTipId}
                message={"Click to attach, detach and pause pipelines"}
              />
              <h3 class="text-xs text-gray-500">
                {titleCase(OperationType[data.audience.operationType])}
              </h3>
            </div>
          </a>
        </div>
        <NodeMenu audience={data.audience} />
      </div>
      <Handle
        type="source"
        position={Position.Top}
        style={{ opacity: 0 }}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        style={{ opacity: 0 }}
      />
    </div>
  );
};

export const ComponentImage = ({ name }: { name: string }) => {
  if (name.toLowerCase().includes("kafka")) {
    return (
      <img
        src={"/images/kafka-dark.svg"}
        className="w-[30px]"
      />
    );
  }

  if (name.toLowerCase().includes("postgres")) {
    return (
      <img
        src={"/images/postgresql.svg"}
        className="w-[30px]"
      />
    );
  }

  return <IconDatabase class="w-6 h-6" />;
};

export const ComponentNode = ({ data }: { data: { label: string } }) => {
  return (
    <div
      className={"z-0 bg-web rounded-md border-1 border-black h-[145px] w-[145px] shadow-xl flex justify-center" +
        " items-center"}
    >
      <div className={"flex justify-center flex-col items-center"}>
        <ComponentImage name={data.label} />
        <p class={"z-10 mt-2 text-white"}>{data?.label}</p>
      </div>
      <Handle
        type="source"
        position={Position.Left}
        id="a"
        style={{ opacity: 0 }}
      />
      <Handle
        type="target"
        position={Position.Right}
        id="b"
        style={{ opacity: 0 }}
      />
    </div>
  );
};
