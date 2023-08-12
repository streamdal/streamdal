import { Handle, Position } from "reactflow";
import IconGripVertical from "tabler-icons/tsx/grip-vertical.tsx";
import "flowbite";
import "twind";
import { useState } from "preact/hooks";
import { OperationType } from "snitch-protos/protos/common.ts";
import { NodeMenu, NodeMenuButton, ServiceNodeMenu } from "./nodeMenu.tsx";
import { NodeData } from "../../islands/flow.tsx";
import { ProducerIcon } from "../icons/producer.tsx";
import { ConsumerIcon } from "../icons/consumer.tsx";
import { removeWhitespace, titleCase } from "../../lib/utils.ts";

export const Service = ({ data }: { data: { label: string } }) => {
  return (
    <div>
      <div class="min-h-[80px] w-[320px] flex items-center justify-between bg-white rounded-lg shadow-lg z-10 border-1 border-purple-200 px-2">
        <IconGripVertical
          class="w-6 h-6 text-purple-100 cursor-grab"
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

export const Group = ({ data }: { data: NodeData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const producer = OperationType[data.audience.operationType] ==
    OperationType[OperationType.PRODUCER];

  const handleModalOpen = () => {
    setIsOpen(true);
  };

  return (
    <div
      class={`rounded-lg shadow-lg border-1 border-purple-200 min-w-[280px] ${
        producer ? "min-h-[200px]" : "min-h-[140px]"
      }`}
    >
      {/*<NodeResizeControl minWidth={100} minHeight={50}>*/}
      {/*  <IconResize class="w-6 h-6" />*/}
      {/*</NodeResizeControl>*/}
      <div
        data-popover-target="popover"
        data-popover-trigger="hover"
        type="button"
        onClick={handleModalOpen}
        class="flex flex-row items-center my-2"
      >
        <IconGripVertical
          class="w-6 h-6 ml-2 text-purple-100 cursor-grab bg-white border border-purple-200"
          id="dragHandle"
        />
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

export const Operation = ({ data }: { data: NodeData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const producer = OperationType[data.audience.operationType] ==
    OperationType[OperationType.PRODUCER];

  const handleModalOpen = () => {
    setIsOpen(true);
  };

  return (
    <div className="h-[96px] flex flex-row justify-start items-center">
      <div
        data-popover-target="popover"
        data-popover-trigger="hover"
        type="button"
        onClick={handleModalOpen}
        class="flex items-center justify-betweenw-[250px] h-[64px] bg-white rounded-lg shadow-lg border-1 border-purple-200 pl-1 pr-2"
      >
        <div class="flex flex-row items-center">
          <IconGripVertical
            class="w-6 h-6 text-purple-100 cursor-grab mr-1"
            id="dragHandle"
          />

          {producer
            ? <ProducerIcon class="w-5 h-5 mr-2" />
            : <ConsumerIcon class="w-5 h-5 mr-2" />}
        </div>
        <div class="w-[145px] whitespace-nowrap text-ellipsis overflow-hidden">
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
                class={"text-[16px] whitespace-nowrap text-ellipsis overflow-hidden"}
              >
                {data.label}
              </h2>
              <h3 class="text-xs text-gray-500">
                {titleCase(OperationType[data.audience.operationType])}
              </h3>
            </div>
          </a>
        </div>
        <NodeMenu audience={data.audience} />
      </div>
      <div
        data-popover
        id="popover"
        role="tooltip"
        class="absolute z-10 invisible inline-block w-64 text-sm text-gray-500 transition-opacity duration-300 bg-white border border-gray-200 rounded-lg shadow-sm opacity-0 dark:text-gray-400 dark:border-gray-600 dark:bg-gray-800"
      >
        <div class="px-3 py-2 bg-gray-100 border-b border-gray-200 rounded-t-lg dark:border-gray-600 dark:bg-gray-700">
          <h3 class="font-semibold text-gray-900 dark:text-white">
            Popover no arrow
          </h3>
        </div>
        <div class="px-3 py-2">
          <p>And here's some amazing content. It's very engaging. Right?</p>
        </div>
      </div>
      <span class="sr-only">Notifications</span>
      {/*{data.instances && (*/}
      {/*  <div class="absolute inline-flex items-center justify-evenly w-7 h-7 text-xs text-white bg-purple-500 rounded-full top-1 -right-2 dark:border-gray-900">*/}
      {/*    {data.instances}*/}
      {/*  </div>*/}
      {/*)}*/}
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

export const Component = ({ data }: { data: { label: string } }) => {
  return (
    <div
      className={"z-0 bg-web rounded-md border-1 border-black h-[145px] w-[145px] shadow-xl flex justify-center" +
        " items-center"}
    >
      <div className={"flex justify-center flex-col items-center"}>
        <img src={"/images/kafka-dark.svg"} className="w-[30px]" />
        <p className={"z-10 mt-2 text-white"}>{data?.label}</p>
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
