import { Handle, Position } from "reactflow";
import IconGripVertical from "tabler-icons/tsx/grip-vertical.tsx";
import IconDatabase from "tabler-icons/tsx/database.tsx";
import IconBrandStripe from "tabler-icons/tsx/brand-stripe.tsx";
import IconBrandAws from "tabler-icons/tsx/brand-aws.tsx";
import "twind";
import { Audience, OperationType } from "streamdal-protos/protos/sp_common.ts";
import { ProducerIcon } from "../icons/producer.tsx";
import { ConsumerIcon } from "../icons/consumer.tsx";
import {
  audienceKey,
  componentKey,
  serviceKey,
  setComponentGroup,
  setOperationHoverGroup,
  setServiceGroup,
  titleCase,
} from "../../lib/utils.ts";
import { Tooltip } from "../tooltip/tooltip.tsx";
import { FlowNode, NodeData } from "../../lib/nodeMapper.ts";
import { opModal } from "./opModalSignal.ts";
import IconTrash from "tabler-icons/tsx/trash.tsx";
import { ServiceLanguage } from "../icons/serviceLanguages.tsx";
import { serviceSignal } from "./serviceSignal.ts";
import { LiveInfo } from "streamdal-protos/protos/sp_info.ts";

export const GROUP_WIDTH = 280;
export const GROUP_MARGIN = 45;

export const ServiceNode = ({ data: { audience } }: FlowNode) => {
  const liveServiceInfo = serviceSignal.value?.live.find((live: LiveInfo) =>
    live.client?.ServiceName === audience.serviceName
  );
  const serviceLanguage = liveServiceInfo?.client?.language;
  const highlighted = audience === opModal.value?.audience &&
    opModal.value?.displayType === "service";
  const trashActive = opModal.value?.deleteService;
  const key = `language-icon-${serviceKey(audience)}`;

  const setHover = () => {
    setServiceGroup(
      audience.serviceName,
      serviceSignal.value.audiences,
      true,
    );
  };
  const resetHover = () => {
    setServiceGroup(
      audience.serviceName,
      serviceSignal.value.audiences,
      false,
    );
  };

  return (
    <div>
      <div
        class={`min-h-[80px] w-[320px] group flex items-center justify-between bg-white rounded-lg z-10 p-2 hover:border-purple-600 hover:shadow-lg ${
          highlighted
            ? "border-2 border-purple-600"
            : "border-1 border-purple-200"
        }`}
        onMouseOver={() => setHover()}
        onMouseLeave={() => resetHover()}
        id={`${serviceKey(audience)}-draghandle`}
      >
        <div
          class="flex flex-row items-center"
          onClick={() => {
            opModal.value = {
              audience,
              displayType: "service",
              clients: 0,
            };
          }}
        >
          <div class="w-8">
            <IconGripVertical class="w-6 h-6 text-purple-100" />
          </div>
          <div class="mx-2">
            <div
              className={"rounded-full w-[60px] h-[60px] bg-purple-200 flex justify-center items-center p-1"}
              data-tooltip-target={key}
            >
              <ServiceLanguage language={serviceLanguage} />
            </div>
            <Tooltip
              targetId={key}
              message={serviceLanguage
                ? titleCase(serviceLanguage)
                : "Attach a client to see language"}
            />
          </div>
          <div class="flex flex-col">
            <h2 className={"text-lg"}>{audience.serviceName}</h2>
          </div>
        </div>
        <button
          onClick={() =>
            opModal.value = {
              audience,
              displayType: "service",
              deleteService: true,
              clients: 0,
            }}
          className={"p-2 rounded"}
        >
          <IconTrash
            class={`w-5 h-5 hover:text-streamdalRed invisible z-50 ${
              trashActive ? "text-streamdalRed" : "text-gray-300"
            } group-hover:visible ${highlighted && "visible"}`}
          />
        </button>
      </div>

      <div className={"flex justify-evenly w-1/2 mt"}>
        <Handle
          type="target"
          position={Position.Bottom}
          className="opacity-0 relative"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          className="opacity-0 relative"
        />
      </div>
    </div>
  );
};

export const GroupNode = ({ data: { audience, group } }: FlowNode) => {
  const key = audienceKey(audience);
  const op = OperationType[audience.operationType];
  const producer = op === OperationType[OperationType.PRODUCER];
  const setHover = () => {
    setOperationHoverGroup(audience, true);
  };

  const resetHover = () => {
    setOperationHoverGroup(audience, false);
  };

  return (
    <div
      className={`rounded-lg bg-sunset border border-purple-200 w-[${GROUP_WIDTH}px] pb-4 hover:shadow-lg hover:border-purple-600`}
      onMouseOver={() => setHover()}
      onMouseLeave={() => resetHover()}
    >
      <div id="dragHandle" class="flex flex-row items-center pt-2">
        <IconGripVertical class="w-6 h-6 mx-2 text-purple-100 bg-white border border-purple-200" />
        {producer
          ? <ProducerIcon class="w-5 h-5 mr-2" />
          : <ConsumerIcon class="w-5 h-5 mr-2" />}
        {`${titleCase(op)}s`}
      </div>
      <div class="flex flex-col items-center justify-center mb w-full">
        {group?.map((audience: Audience) => (
          <OperationNode audience={audience} />
        ))}
      </div>
      <Handle
        type="source"
        position={producer ? Position.Bottom : Position.Top}
        className="opacity-0"
      />
      <Handle
        type="target"
        position={producer ? Position.Top : Position.Bottom}
        className="opacity-0"
      />
    </div>
  );
};

export const OperationNode = ({ audience }: { audience: Audience }) => {
  const key = audienceKey(audience);
  const highlight = opModal.value?.audience &&
    key === audienceKey(opModal.value?.audience) &&
    opModal.value?.displayType === "operation";
  const trashActive = opModal.value?.deleteOperation;
  const clients = serviceSignal.value?.liveAudiences.get(key);

  return (
    <div
      type="button"
      class={`flex items-center justify-between w-[260px] min-h-[64px] group bg-white rounded-lg shadow-lg ${
        highlight ? "border-2 border-purple-600" : "border-1 border-purple-200"
      } pl-1 pr-2 mt-2`}
    >
      <div
        class="whitespace-nowrap text-ellipsis overflow-hidden w-full"
        onClick={() =>
          opModal.value = {
            audience: audience,
            displayType: "operation",
            clients: clients?.length || 0,
          }}
      >
        <div
          class={"flex flex-col justify-start p-1 cursor-pointer"}
        >
          <h2
            data-tooltip-target={key}
            class={"text-[16px] whitespace-normal break-words"}
          >
            {audience.operationName}
          </h2>
          <Tooltip
            targetId={key}
            message={"Click to attach and detach pipelines"}
          />
          <h3 class="text-xs text-streamdalPurple font-semibold">
            {`${clients?.length || 0} attached client${
              clients?.length !== 1 ? "s" : ""
            }`}
          </h3>
        </div>
      </div>
      <button
        onClick={() => {
          opModal.value = {
            audience: audience,
            displayType: "operation",
            clients: clients?.length || 0,
            deleteOperation: true,
          };
        }}
        className={"p-2 rounded"}
      >
        <IconTrash
          class={`w-5 h-5 hover:text-streamdalRed invisible z-50 ${
            trashActive ? "text-streamdalRed" : "text-gray-300"
          } group-hover:visible ${highlight && "visible"}`}
        />
      </button>
    </div>
  );
};

export const ComponentImage = (
  { componentName, className }: { componentName: string; className: string },
) => {
  const formattedComponentName = componentName.toLowerCase();
  if (formattedComponentName.includes("kafka")) {
    return (
      <img
        src={"/images/kafka-dark.svg"}
        className={className}
      />
    );
  }

  if (formattedComponentName.includes("postgres")) {
    return (
      <img
        src={"/images/postgresql.svg"}
        className={className}
      />
    );
  }

  if (
    formattedComponentName.includes("database") ||
    formattedComponentName.includes("db")
  ) {
    return <IconDatabase className={`text-white w-14 h-14`} />;
  }

  if (formattedComponentName.includes("stripe")) {
    return <IconBrandStripe class="w-14 h-14 text-white" />;
  }
  if (
    formattedComponentName.includes("ses") &&
    formattedComponentName.includes("aws")
  ) {
    return <IconBrandAws class="w-14 h-14 text-white" />;
  }
  return <IconDatabase className={`text-white w-14 h-14`} />;
};

export const ComponentNode = ({ data: { audience } }: FlowNode) => {
  const highlighted = audience === opModal.value?.audience &&
    opModal.value?.displayType === "component";
  const setHover = () => {
    setComponentGroup(
      audience.componentName,
      serviceSignal.value?.audiences,
      true,
    );
  };
  const resetHover = () => {
    setComponentGroup(
      audience.componentName,
      serviceSignal.value?.audiences,
      false,
    );
  };

  const cKey = componentKey(audience);
  return (
    <div
      onClick={() => {
        opModal.value = {
          audience,
          displayType: "component",
          clients: 0,
        };
      }}
    >
      <div className={"flex w-1/2 justify-between mb"}>
        <Handle
          type="source"
          position={Position.Top}
          className="opacity-0 relative"
        />
        <Handle
          type="target"
          position={Position.Top}
          className="opacity-0 relative"
        />
      </div>
      <div
        id={`${cKey}-dragHandle`}
        class={`z-0 flex justify-center items-center bg-web rounded-md border-4 hover:shadow-xl hover:border-4 hover:border-purple-600 min-h-[145px] w-[145px] ${
          highlighted && "border-4 border-purple-600"
        }`}
        onMouseOver={() => setHover()}
        onMouseLeave={() => resetHover()}
      >
        <div class="flex justify-center flex-col items-center p-2">
          <ComponentImage
            componentName={audience.componentName}
            className={"w-[40px]"}
          />
          <p
            class={"z-10 text-white"}
          >
            {audience.componentName}
          </p>
        </div>
      </div>
    </div>
  );
};
