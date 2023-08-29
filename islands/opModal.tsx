import { ConsumerIcon } from "../components/icons/consumer.tsx";
import { ProducerIcon } from "../components/icons/producer.tsx";
import IconPlus from "tabler-icons/tsx/plus.tsx";
import IconX from "tabler-icons/tsx/x.tsx";
import IconUnlink from "tabler-icons/tsx/unlink.tsx";

import { titleCase } from "../lib/utils.ts";
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

export default function OpModal(
  { serviceMap }: { serviceMap: ServiceMapType },
) {
  if (opModal.value == null) {
    return;
  }

  const audience = opModal.value.audience;
  const attachedPipeline = opModal.value.attachedPipeline;
  const opType = OperationType[audience.operationType];

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
      <div class="fixed z-50 h-screen top-0 right-0 flex flex-row justify-end items-start ">
        {opModal.value?.attach && <OddAttachModal serviceMap={serviceMap} />}
        <div class="w-[308px] h-full ml-2 overflow-hidden">
          <div class="bg-[#28203F] h-full shadow dark:bg-gray-700">
            <div class="rounded-t flex justify-between">
              <div class="flex items-start justify-between p-4">
                {opType === "consumer"
                  ? <ConsumerIcon className={"mx-2"} />
                  : <ProducerIcon className={"mx-2"} />}
                <div class="flex flex-col">
                  <h3 class="text-lg text-white dark:text-white">
                    {audience.operationName}
                  </h3>
                  <p class="text-xs text-gray-500">
                    {`${titleCase(opType)}`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="mt-1 mr-1 text-white bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-6 h-6 ml-auto inline-flex justify-center items-center"
                onClick={() => opModal.value = null}
              >
                <IconX class="w-4 h-4" />
              </button>
            </div>
            <div class="px-4 py-1">
              <div class="mb-2 flex justify-between items-center pr-2">
                <h3 class="text-white text-sm">Attached Pipeline</h3>
              </div>
              {!serviceMap?.pipes.length
                ? (
                  <a href={"/pipelines"}>
                    <button class="text-gray-400 border-dashed border-gray-600 font-medium rounded-sm w-full flex justify-center text-sm px-2 text-xs py-1 text-center inline-flex items-center">
                      <IconPlus class="w-4 h-4 mr-1" />
                      Create a new pipeline
                    </button>
                  </a>
                )
                : attachedPipeline
                ? (
                  <div
                    className={`flex justify-between items-center text-white border border-gray-600 font-medium rounded-sm w-full text-sm px-2 text-xs py-1 focus:ring-1 focus:outline-none focus:ring-purple-600 ${
                      opModal.value?.attach &&
                      "ring-1 outline-none active:ring-purple-600"
                    }`}
                  >
                    {attachedPipeline?.name}

                    <div class="flex flex-row items-center">
                      <button
                        data-tooltip-target="pipeline-pause"
                        type="button"
                        onClick={() =>
                          opModal.value = { ...opModal.value, pause: true }}
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
                        onClick={() =>
                          opModal.value = { ...opModal.value, detach: true }}
                      >
                        <IconUnlink class="w-4 h-4 text-gray-400" />
                      </button>
                      <Tooltip
                        targetId="pipeline-unlink"
                        message={"Click to detach pipeline"}
                      />
                    </div>
                  </div>
                )
                : (
                  <button
                    id="attach-pipeline"
                    className="text-[#8E84AD] border border-gray-600 hover:border-[#8E84AD] font-medium rounded-sm w-full flex justify-between text-sm px-2 text-xs py-1 text-center inline-flex items-center focus:ring-1 focus:outline-none focus:ring-purple-600 active:ring-1 active:outline-none active:ring-purple-600"
                    type="button"
                    onClick={() =>
                      opModal.value = { ...opModal.value, attach: true }}
                  >
                    Attach a pipeline
                    <IconLink class="w-4" />
                  </button>
                )}
            </div>
            <div
              id="pipeline-attach-detach"
              data-accordion="open"
              data-active-classes="bg-blue-100 dark:bg-gray-800 text-blue-600 dark:text-white"
              class="py-2"
            >
              <h3 id="collapse-heading-2">
                <button
                  type="button"
                  className="flex items-center w-full px-5 py-3 font-medium text-left text-white focus:ring-2"
                  data-accordion-target="#collapse-body-2"
                  aria-expanded="true"
                  aria-controls="collapse-body-2"
                >
                  <svg
                    data-accordion-icon
                    width="10"
                    height="6"
                    viewBox="0 0 10 6"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-3 h-3 rotate-180 shrink-0"
                  >
                    <path
                      d="M9 1L5 5L1 1"
                      stroke="white"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <h3 class="text-white text-sm font-semibold ml-3">
                    Trends
                  </h3>
                </button>
              </h3>
              <div
                id="collapse-body-2"
                class="hidden"
                aria-labelledby="collapse-heading-2"
              >
                <p class="p-5 text-gray-300 text-xs dark:text-gray-400">
                  Trends coming soon...
                </p>
              </div>
              <h3 id="collapse-heading-3">
                <button
                  type="button"
                  className="flex items-center w-full px-5 py-3 font-medium text-left text-gray-500 focus:ring-2"
                  data-accordion-target="#collapse-body-3"
                  aria-expanded="false"
                  aria-controls="collapse-body-3"
                >
                  <svg
                    data-accordion-icon
                    width="10"
                    height="6"
                    viewBox="0 0 10 6"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-3 h-3 rotate-180 shrink-0"
                  >
                    <path
                      d="M9 1L5 5L1 1"
                      stroke="white"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <h3 class="text-white text-sm font-semibold ml-3">
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
                  <p class="text-gray-300 text-xs dark:text-gray-400">
                    Notifications coming soon...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toast id="pipelineCrud" />
    </>
  );
}
