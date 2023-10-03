import { ConsumerIcon } from "../components/icons/consumer.tsx";
import { ProducerIcon } from "../components/icons/producer.tsx";
import IconPlus from "tabler-icons/tsx/plus.tsx";
import IconUnlink from "tabler-icons/tsx/unlink.tsx";
import IconAdjustmentsHorizontal from "tabler-icons/tsx/adjustments-horizontal.tsx";
import { ServiceMapType } from "../lib/fetch.ts";
import { opModal } from "../components/serviceMap/opModalSignal.ts";
import { OperationType } from "snitch-protos/protos/sp_common.ts";
import IconLink from "tabler-icons/tsx/link.tsx";
import IconPlayerPause from "tabler-icons/tsx/player-pause.tsx";
import { Toast } from "../components/toasts/toast.tsx";
import { Tooltip } from "../components/tooltip/tooltip.tsx";
import { PausePipelineModal } from "../components/modals/pausePipelineModal.tsx";
import { DetachPipelineModal } from "../components/modals/detachPipelineModal.tsx";
import { OddAttachModal } from "../components/modals/oddAttachModal.tsx";
import { EmptyStateBird } from "../components/icons/emptyStateBird.tsx";
import { useEffect, useState } from "preact/hooks";
import { DeleteOperationModal } from "../components/modals/deleteOperationModal.tsx";
import { Tail } from "./tail.tsx";
import { Toggle } from "../components/form/switch.tsx";
import { getAudienceOpRoute, isNumeric } from "../lib/utils.ts";
import {
  tailEnabledSignal,
  tailSamplingRateSignal,
  tailSamplingSignal,
} from "../lib/tail.ts";
import IconTrash from "tabler-icons/tsx/trash.tsx";
import hljs from "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/es/highlight.min.js";
import { useSignalEffect } from "https://esm.sh/v131/@preact/signals@1.1.3/denonext/signals.mjs";
import { opUpdateSignal } from "./serviceMap.tsx";
import { ComponentImage } from "./customNodes.tsx";
export const OP_MODAL_WIDTH = "308px";

export default function OpModal(
  { serviceMap, grpcUrl, grpcToken }: {
    serviceMap: ServiceMapType;
    grpcUrl: string;
    grpcToken: string;
  },
) {
  const displayType = opModal.value?.displayType;
  const itemName = () => {
    switch (displayType) {
      case "operation":
        return opModal.value?.audience?.operationName;
      case "service":
        return opModal.value?.audience?.serviceName;
      case "component":
        return opModal.value?.audience.componentName;
    }
  };

  const iconDisplay = () => {
    if (displayType === "operation") {
      return opType === "CONSUMER"
        ? <ConsumerIcon className={"mx-2"} />
        : <ProducerIcon className={"mx-2"} />;
    }
    if (displayType === "component") {
      return (
        <ComponentImage componentName={displayName} className={"w-6 mx-2"} />
      );
    }
    return (
      <img
        src={"/images/placeholder-icon.png"}
        className={"w-7 mx-2"}
      />
    );
  };

  const audience = opModal.value?.audience;
  const attachedPipeline = opModal.value?.attachedPipeline;
  const clients = opModal.value?.clients;
  const opType = OperationType[audience?.operationType];
  const displayName = itemName();

  const [tailNavOpen, setTailNavOpen] = useState(false);
  const [schemaNavOpen, setSchemaNavOpen] = useState(false);

  const getSchema = async () => {
    const response = await fetch(`${getAudienceOpRoute(audience)}/schema`, {
      method: "GET",
    });
    return response.json();
  };

  useEffect(async () => {
    if (opModal.value) {
      const schema = await getSchema();
      opModal.value = {
        ...opModal.value,
        schema: JSON.stringify(schema.schema, null, 2),
      };
    }
  }, [audience, schemaNavOpen]);

  return (
    <>
      {opModal.value?.pause && (
        <PausePipelineModal
          audience={audience}
          pipeline={attachedPipeline}
        />
      )}
      {opModal.value?.detach && (
        <DetachPipelineModal
          audience={audience}
          pipeline={attachedPipeline}
        />
      )}
      {opModal.value?.delete && (
        <DeleteOperationModal
          audience={audience}
          pipeline={attachedPipeline || null}
        />
      )}
      <div class="flex flex-row">
        {tailEnabledSignal.value && (
          <Tail
            audience={audience}
            grpcUrl={grpcUrl}
            grpcToken={grpcToken}
          />
        )}
        <div
          class={`fixed z-50 h-screen top-0 right-0 transition-transform ${`translate-x-full right-[${OP_MODAL_WIDTH}]`} flex flex-row justify-end items-start`}
        >
          <div class="w-[308px] shadow-xl h-full">
            <div class="bg-white h-full">
              {opModal.value == null
                ? (
                  <div class="w-full h-4/5 flex flex-col justify-center items-center">
                    <EmptyStateBird class="mb-2" />
                    <h2 class="text-[#8E84AD]">No Items Selected</h2>
                  </div>
                )
                : (
                  <div
                    class={"flex flex-col justify-between"}
                  >
                    <div>
                      <div class="rounded-t flex justify-between">
                        <div class="z-[20] flex items-center justify-start px-4 w-full h-16 bg-web">
                          {iconDisplay()}
                          <div class="flex flex-col">
                            <h3 class="text-lg text-cloud">
                              {displayName}
                            </h3>
                            {displayType === "operation" && (
                              <p class="text-xs text-cloud">
                                {`${clients?.length || 0} attached client${
                                  (clients?.length !== 1) ? "s" : ""
                                }`}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      {displayType === "operation"
                        ? (
                          <>
                            <div class="px-4 py-4 rounded-md mx-2">
                              <div class="mb-2 flex justify-between items-center pr-2">
                                <h3 class="text-web font-bold text-sm">
                                  Attached Pipelines
                                </h3>
                              </div>
                              {!serviceMap?.pipes.length
                                ? (
                                  <a href={"/pipelines"}>
                                    <button class="text-streamdalPurple border border-purple-600 bg-purple-50 font-semibold rounded-lg w-full flex justify-center text-sm px-2 py-1 text-center inline-flex items-center">
                                      <IconPlus class="w-4 h-4 mr-1" />
                                      Create a new pipeline
                                    </button>
                                  </a>
                                )
                                : attachedPipeline
                                ? (
                                  <div
                                    className={`flex justify-between items-center text-web bg-purple-50 border border-purple-600 font-medium rounded-md w-full text-sm px-2 text-xs py-1 focus:ring-1 focus:outline-none focus:ring-purple-600 ${
                                      opModal.value?.attach &&
                                      "ring-1 outline-none active:ring-purple-600"
                                    }`}
                                  >
                                    {attachedPipeline?.name}

                                    <div class="py-1 flex flex-row items-center">
                                      <button
                                        data-tooltip-target="pipeline-pause"
                                        type="button"
                                        onClick={() =>
                                          opModal.value = {
                                            ...opModal.value,
                                            pause: true,
                                          }}
                                        class="mr-2"
                                      >
                                        <IconPlayerPause class="w-4 h-4 text-gray-400" />
                                      </button>
                                      <Tooltip
                                        targetId="pipeline-pause"
                                        message={"Click to pause pipelines"}
                                      />
                                      <button
                                        data-tooltip-target="pipeline-unlink"
                                        type="button"
                                        class="mr-2"
                                        onClick={() =>
                                          opModal.value = {
                                            ...opModal.value,
                                            detach: true,
                                          }}
                                      >
                                        <IconUnlink class="w-4 h-4 text-gray-400" />
                                      </button>
                                      <Tooltip
                                        targetId="pipeline-unlink"
                                        message={"Click to detach pipeline"}
                                      />
                                      <a
                                        href={"/pipelines"}
                                        className="flex items-center"
                                      >
                                        <button
                                          type="button"
                                          data-tooltip-target="pipeline-edit"
                                        >
                                          <IconAdjustmentsHorizontal class="w-4 h-4 text-gray-400" />
                                        </button>
                                        <Tooltip
                                          targetId="pipeline-edit"
                                          message={"Edit Pipelines"}
                                        />
                                      </a>
                                    </div>
                                  </div>
                                )
                                : (
                                  <button
                                    id="attach-pipeline"
                                    className="text-web font-semibold bg-purple-50 border border-purple-600 hover:border-[#8E84AD] font-medium rounded-md w-full flex justify-between text-sm px-2 text-xs py-1 text-center inline-flex items-center focus:ring-1 focus:outline-none focus:ring-purple-600 active:ring-1 active:outline-none active:ring-purple-600"
                                    type="button"
                                    onClick={() =>
                                      opModal.value = {
                                        ...opModal.value,
                                        attach: true,
                                      }}
                                  >
                                    Attach a pipeline
                                    <IconLink class="w-4" />
                                  </button>
                                )}
                              {(opModal.value?.attach) && (
                                <OddAttachModal serviceMap={serviceMap} />
                              )}
                            </div>
                            <div
                              id="pipeline-attach-detach"
                              data-accordion="open"
                              data-active-classes="bg-blue-100 text-blue-600"
                              class="py-2"
                            >
                              <h3 id="collapse-heading-2">
                                <button
                                  type="button"
                                  className={`flex items-center w-full px-5 border-y border-purple-100 py-3 font-medium text-left text-web `}
                                  data-accordion-target="#collapse-body-2"
                                  aria-expanded="true"
                                  aria-controls="collapse-body-2"
                                  onClick={() => setTailNavOpen(!tailNavOpen)}
                                >
                                  <h3 class="text-sm font-semibold ml-3">
                                    Tail
                                  </h3>
                                </button>
                              </h3>
                              <div
                                id="collapse-body-2"
                                class={`border-b border-purple-100 pl-7 ${
                                  tailNavOpen ? "" : "hidden"
                                }`}
                                aria-labelledby="collapse-heading-2"
                              >
                                <div class="text-cobweb font-medium text-xs my-3">
                                  {clients
                                    ? "View your pipeline data in realtime"
                                    : "You must attach a client first"}
                                </div>
                                {clients && (
                                  <div class="flex flex-col">
                                    <div class="flex flex-row justify-start items-center mb-3">
                                      <Toggle
                                        label="Sampling"
                                        value={tailSamplingSignal.value}
                                        setValue={(value) =>
                                          tailSamplingSignal.value = value}
                                      />
                                      {tailSamplingSignal.value &&
                                        (
                                          <label className="relative inline-flex items-center cursor-pointer ml-2">
                                            <span className="mr-3 text-[12px] font-[500] leading-[20px] text-cobweb">
                                              Sample Setting
                                            </span>

                                            <input
                                              class={`w-[${
                                                (String(
                                                  tailSamplingRateSignal.value,
                                                )
                                                  .length) * 12
                                              }px] mr-2`}
                                              value={tailSamplingRateSignal
                                                .value}
                                              onChange={(e) => {
                                                if (isNumeric(e.target.value)) {
                                                  tailSamplingRateSignal.value =
                                                    e.target.value;
                                                }
                                              }}
                                            />
                                            <span className="mr-3 text-[12px] font-[500] leading-[20px] text-cobweb">
                                              /s
                                            </span>
                                          </label>
                                        )}
                                    </div>
                                    <button
                                      onClick={() =>
                                        tailEnabledSignal.value =
                                          !tailEnabledSignal
                                            .value}
                                      className={`text-white bg-web rounded-md w-[260px] h-[34px] flex justify-center items-center font-medium text-sm mb-4 cursor-pointer`}
                                    >
                                      {tailEnabledSignal.value
                                        ? "Stop Tail"
                                        : "Start Tail"}
                                    </button>
                                  </div>
                                )}
                              </div>
                              <h3 id="collapse-heading-3">
                                <button
                                  type="button"
                                  className="flex items-center border-b border-purple-100 w-full px-5 py-3 font-medium text-left text-gray-500 focus:ring-2"
                                  data-accordion-target="#collapse-body-3"
                                  aria-expanded="true"
                                  aria-controls="collapse-body-3"
                                >
                                  <h3 class="text-web text-sm font-semibold ml-3">
                                    Notifications
                                  </h3>
                                </button>
                              </h3>
                              <div
                                id="collapse-body-3"
                                class="hidden"
                                aria-labelledby="collapse-heading-3"
                              >
                                <div class="p-5">
                                  <p class="text-gray-300 text-xs">
                                    Notifications coming soon...
                                  </p>
                                </div>
                              </div>
                              <h3 id="collapse-heading-4">
                                <button
                                  type="button"
                                  className="flex items-center w-full px-5 border-b border-purple-100 py-3 font-medium text-left text-web focus:ring-2"
                                  data-accordion-target="#collapse-body-4"
                                  aria-expanded="true"
                                  aria-controls="collapse-body-4"
                                >
                                  <h3 class="text-web text-sm font-semibold ml-3">
                                    Trends
                                  </h3>
                                </button>
                              </h3>
                              <div
                                id="collapse-body-4"
                                class="hidden"
                                aria-labelledby="collapse-heading-4"
                              >
                                <p class="p-5 text-gray-300 text-xs">
                                  Trends coming soon...
                                </p>
                              </div>
                              <h3 id="collapse-heading-5">
                                <button
                                  type="button"
                                  className={`flex items-center w-full px-5 ${
                                    !schemaNavOpen && "border-b"
                                  }  border-purple-100 py-3 font-medium text-left text-web`}
                                  data-accordion-target="#collapse-body-5"
                                  aria-expanded="true"
                                  aria-controls="collapse-body-5"
                                  onClick={() =>
                                    setSchemaNavOpen(!schemaNavOpen)}
                                >
                                  <h3
                                    class={"text-web text-sm font-semibold ml-3"}
                                  >
                                    Schema
                                  </h3>
                                </button>
                              </h3>
                              {schemaNavOpen && (
                                <div
                                  id="collapse-body-5"
                                  aria-labelledby="collapse-heading-5"
                                  class={"flex flex-col items-center justify-center p-4"}
                                >
                                  <p class="mb-5 w-full text-left text-gray-500 text-xs">
                                    Displaying JSON
                                  </p>
                                  <div className="w-full rounded flex overflow-x-scroll bg-black text-white py-2 px-4 text-sm flex flex-col justify-start">
                                    <pre>
                                <code>
                                  <div
                                      dangerouslySetInnerHTML={{
                                        __html: `${
                                            hljs.highlight(`${opModal.value.schema}`, {language: 'json'})
                                                .value
                                        }`,
                                      }}
                                      class={"font-sm"}
                                  >
                                  </div>
                                </code>
                                    </pre>
                                  </div>
                                </div>
                              )}
                            </div>
                          </>
                        )
                        : (
                          <>
                            <h3 id="collapse-heading-10">
                              <button
                                type="button"
                                className="flex items-center border-b border-purple-100 w-full py-3 font-medium text-left text-gray-500 focus:ring-2"
                                data-accordion-target="#collapse-body-3"
                                aria-expanded="true"
                                aria-controls="collapse-body-10"
                              >
                                <h3 class="text-web text-sm font-semibold ml-10">
                                  Metrics
                                </h3>
                              </button>
                            </h3>
                            <div
                              id="collapse-body-10"
                              aria-labelledby="collapse-heading-10"
                            >
                              <div class="p-5">
                                <p class="text-gray-300 text-xs">
                                  Metrics coming soon...
                                </p>
                              </div>
                            </div>
                          </>
                        )}
                    </div>
                    <button
                      data-tooltip-target="delete-operation"
                      type="button"
                      onClick={() =>
                        opModal.value = {
                          ...opModal.value,
                          delete: true,
                        }}
                      className="absolute bottom-5 right-[22px] w-[260px] h-[45px] border border-streamdalRed text-streamdalRed rounded flex justify-center items-center"
                    >
                      <IconTrash class="w-6 h-6 text-streamdalRed mr-3" />
                      Delete Item
                    </button>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
      <Toast id="pipelineCrud" />
    </>
  );
}
