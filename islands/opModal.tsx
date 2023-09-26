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
import { useState } from "preact/hooks";
import { DeleteOperationModal } from "../components/modals/deleteOperationModal.tsx";
import { Peek } from "./peek.tsx";
import { Toggle } from "../components/form/switch.tsx";
import { isNumeric } from "../lib/utils.ts";
import {
  peekingSignal,
  peekSamplingRateSignal,
  peekSamplingSignal,
} from "../lib/peek.ts";
import IconTrash from "tabler-icons/tsx/trash.tsx";

export const OP_MODAL_WIDTH = "308px";

export default function OpModal(
  { serviceMap, grpcUrl, grpcToken }: {
    serviceMap: ServiceMapType;
    grpcUrl: string;
    grpcToken: string;
  },
) {
  const audience = opModal.value?.audience;
  const attachedPipeline = opModal.value?.attachedPipeline;
  const opType = OperationType[audience?.operationType];

  const [peekNavOpen, setPeekNavOpen] = useState(false);

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
        {peekingSignal.value && (
          <Peek
            audience={audience}
            pipeline={attachedPipeline}
            grpcUrl={grpcUrl}
            grpcToken={grpcToken}
          />
        )}
        <div
          class={`fixed z-50 h-screen top-0 right-0 transition-transform ${`translate-x-full right-[${OP_MODAL_WIDTH}]`} flex flex-row justify-end items-start`}
        >
          <div class="w-[308px] shadow-xl h-full">
            <div class="bg-white h-full dark:bg-gray-700">
              {/*<div class="flex h-16 p-4 justify-between items-center border-b border-purple-100">*/}
              {/*  <div class="flex items-center justify-start">*/}
              {/*    <IconUserCircle class="w-12 h-12 mr-4" />*/}
              {/*    <h2 class="text-web font-semibold">User Name</h2>*/}
              {/*  </div>*/}
              {/*  <button class="p-1 rounded hover:bg-purple-100">*/}
              {/*    <svg*/}
              {/*      width="18"*/}
              {/*      height="18"*/}
              {/*      viewBox="0 0 18 18"*/}
              {/*      fill="none"*/}
              {/*      xmlns="http://www.w3.org/2000/svg"*/}
              {/*    >*/}
              {/*      <path*/}
              {/*        fill-rule="evenodd"*/}
              {/*        clip-rule="evenodd"*/}
              {/*        d="M3.53975 11.479C3.75942 11.2593 4.11558 11.2593 4.33525 11.479L8.67992 15.8236C8.75314 15.8969 8.87186 15.8969 8.94508 15.8236L13.2898 11.479C13.5094 11.2593 13.8656 11.2593 14.0852 11.479C14.3049 11.6986 14.3049 12.0548 14.0852 12.2745L9.74058 16.6191C9.22801 17.1317 8.39699 17.1317 7.88442 16.6191L3.53975 12.2745C3.32008 12.0548 3.32008 11.6986 3.53975 11.479Z"*/}
              {/*        fill="#372D56"*/}
              {/*      />*/}
              {/*      <path*/}
              {/*        fill-rule="evenodd"*/}
              {/*        clip-rule="evenodd"*/}
              {/*        d="M3.53975 6.64946C3.75942 6.86913 4.11558 6.86913 4.33525 6.64946L8.67992 2.30479C8.75314 2.23156 8.87186 2.23157 8.94508 2.30479L13.2898 6.64946C13.5094 6.86913 13.8656 6.86913 14.0852 6.64946C14.3049 6.42979 14.3049 6.07363 14.0852 5.85396L9.74058 1.50929C9.22801 0.996729 8.39699 0.996731 7.88442 1.50929L3.53975 5.85396C3.32008 6.07363 3.32008 6.42979 3.53975 6.64946Z"*/}
              {/*        fill="#372D56"*/}
              {/*      />*/}
              {/*    </svg>*/}
              {/*  </button>*/}
              {/*</div>*/}
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
                          {opType === "CONSUMER"
                            ? <ConsumerIcon className={"mx-2"} />
                            : <ProducerIcon className={"mx-2"} />}
                          <div class="flex flex-col">
                            <h3 class="text-lg text-cloud">
                              {audience?.operationName}
                            </h3>
                            {/*<p class="text-xs text-cloud">*/}
                            {/*    {`${clients} attached client${*/}
                            {/*        (clients !== 1) ? "s" : ""*/}
                            {/*    }`}*/}
                            {/*</p>*/}
                          </div>
                        </div>
                      </div>
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
                        data-active-classes="bg-blue-100 dark:bg-gray-800 text-blue-600"
                        class="py-2"
                      >
                        <h3 id="collapse-heading-2">
                          <button
                            type="button"
                            className={`flex items-center w-full px-5 border-y border-purple-100 py-3 font-medium text-left text-web `}
                            data-accordion-target="#collapse-body-2"
                            aria-expanded="true"
                            aria-controls="collapse-body-2"
                            onClick={() => setPeekNavOpen(!peekNavOpen)}
                          >
                            <h3 class="text-sm font-semibold ml-3">
                              Peek
                            </h3>
                          </button>
                        </h3>
                        <div
                          id="collapse-body-2"
                          class={`border-b border-purple-100 pl-7 ${
                            peekNavOpen ? "" : "hidden"
                          }`}
                          aria-labelledby="collapse-heading-2"
                        >
                          <div class="text-cobweb font-medium text-xs my-3">
                            {attachedPipeline
                              ? "View your pipeline data in realtime"
                              : "You must attach a pipeline first"}
                          </div>
                          {attachedPipeline
                            ? (
                              <div class="flex flex-col">
                                <div class="flex flex-row justify-start items-center mb-3">
                                  <Toggle
                                    label="Sampling"
                                    value={peekSamplingSignal.value}
                                    setValue={(value) =>
                                      peekSamplingSignal.value = value}
                                  />
                                  {peekSamplingSignal.value &&
                                    (
                                      <label className="relative inline-flex items-center cursor-pointer ml-2">
                                        <span className="mr-3 text-[12px] font-[500] leading-[20px] text-cobweb">
                                          Sample Setting
                                        </span>

                                        <input
                                          class={`w-[${
                                            (String(
                                              peekSamplingRateSignal.value,
                                            )
                                              .length) * 12
                                          }px] mr-2`}
                                          value={peekSamplingRateSignal.value}
                                          onChange={(e) => {
                                            if (isNumeric(e.target.value)) {
                                              peekSamplingRateSignal.value =
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
                                    attachedPipeline
                                      ? peekingSignal.value = !peekingSignal
                                        .value
                                      : null}
                                  className={`text-white bg-web rounded-md w-[260px] h-[34px] flex justify-center items-center font-medium text-sm mb-4 cursor-${
                                    attachedPipeline ? "pointer" : "not-allowed"
                                  }`}
                                >
                                  {peekingSignal.value
                                    ? "Stop Peeking"
                                    : "Start Peeking"}
                                </button>
                              </div>
                            )
                            : null}
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
                            <p class="text-gray-300 text-xs dark:text-gray-400">
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
                          <p class="p-5 text-gray-300 text-xs dark:text-gray-400">
                            Trends coming soon...
                          </p>
                        </div>
                        <h3 id="collapse-heading-5">
                          <button
                            type="button"
                            className="flex items-center w-full px-5 border-b border-purple-100 py-3 font-medium text-left text-web"
                            data-accordion-target="#collapse-body-5"
                            aria-expanded="true"
                            aria-controls="collapse-body-5"
                          >
                            <h3 class="text-web text-sm font-semibold ml-3">
                              Schema
                            </h3>
                          </button>
                        </h3>
                        <div
                          id="collapse-body-5"
                          class="hidden"
                          aria-labelledby="collapse-heading-5"
                        >
                          <p class="p-5 text-gray-300 text-xs dark:text-gray-400">
                            Schema coming soon...
                          </p>
                        </div>
                      </div>
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
