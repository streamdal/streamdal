import { ConsumerIcon } from "../components/icons/consumer.tsx";
import { ProducerIcon } from "../components/icons/producer.tsx";
import IconPlus from "tabler-icons/tsx/plus.tsx";
import IconX from "tabler-icons/tsx/x.tsx";
import IconUnlink from "tabler-icons/tsx/unlink.tsx";

import {
  getAttachedPipeline,
  getAudienceOpRoute,
  titleCase,
} from "../lib/utils.ts";
import { ServiceMapType } from "../lib/fetch.ts";
import { PipelineInfo } from "snitch-protos/protos/info.ts";
import { useEffect, useState } from "preact/hooks";
import { Toast } from "../components/toasts/toast.tsx";
import { opModal } from "../components/serviceMap/opModalSignal.ts";
import { OperationType } from "snitch-protos/protos/common.ts";
import { zfd } from "zod-form-data";
import * as z from "zod/index.ts";

export const attachPipelineSchema = zfd.formData({
  pipelineId: z.string().min(1, { message: "Required" }),
});

export type AttachPipelineType = z.infer<typeof attachPipelineSchema>;

export default function OpModal(
  { serviceMap }: { serviceMap: ServiceMapType },
) {
  if (opModal.value == null) {
    return;
  }

  const [attachedPipeline, setAttachedPipeline] = useState(null);

  useEffect(() => {
    setAttachedPipeline(getAttachedPipeline(
      opModal.value,
      serviceMap.pipelines,
      serviceMap.config,
    ));
  }, [opModal.value]);

  const [attachOpen, setAttachOpen] = useState(false);
  const [success, setSuccess] = useState(null);

  const attachPipeline = async (e: any) => {
    const response = await fetch(
      `${getAudienceOpRoute(audience)}/pipeline/${e.target.value}/attach`,
      {
        method: "POST",
      },
    );

    const { success } = await response.json();
    setSuccess(success);

    if (success.status) {
      setAttachedPipeline(serviceMap.pipelines[e.target.value]?.pipeline);
      setAttachOpen(false);
    }
  };

  const audience = opModal.value;
  const opType = OperationType[audience.operationType];

  const sortPipelines = (pipes: PipelineInfo[]) =>
    pipes?.sort((a, b) => a.pipeline.name.localeCompare(b.pipeline.name));

  const sorted = attachedPipeline?.id
    ? [
      ...[serviceMap.pipes.find((p: PipelineInfo) =>
        p.pipeline.id === attachedPipeline.id
      )],
      ...sortPipelines(serviceMap.pipes.filter((p: PipelineInfo) =>
        p.pipeline.id !== attachedPipeline?.id
      )),
    ]
    : sortPipelines(serviceMap.pipes);

  return (
    <>
      <div class="absolute z-50 top-0 right-0 pt-[100px] pr-[14px] max-h-[600px] overflow-hidden flex flex-row justify-end items-start ">
        {attachOpen && (
          <div class="mt-[100px]">
            <div class="w-[200px] bg-white divide-gray-100 rounded-md shadow-lg border max-h-[400px] overflow-auto">
              <form onSumbit={attachPipeline}>
                <ul
                  class="pt-2 text-sm text-gray-700 divide-y"
                  aria-labelledby="dropdownDefaultButton"
                >
                  {sorted?.map((
                    p: PipelineInfo,
                    i: number,
                  ) => (
                    <div class="flex items-center py-2 px-2 hover:bg-purple-50">
                      <input
                        id={`default-radio-${i}`}
                        type="radio"
                        value={p.pipeline.id}
                        onChange={attachPipeline}
                        checked={p.pipeline.id ===
                          attachedPipeline?.id}
                        name="pipelineId"
                        className={`w-4 h-4 bg-gray-100 checked:bg-purple-500 cursor-pointer`}
                      />
                      <label
                        htmlFor={`default-radio-${i}`}
                        className="ml-2 text-xs font-medium text-gray-900"
                      >
                        {p.pipeline.name}
                      </label>
                    </div>
                  ))}
                  <div class="flex items-center justify-center hover:bg-purple-50 py-2">
                    <a href="/pipelines">
                      <div class={"flex justify-between items-center"}>
                        <p class={"text-xs text-gray-600"}>
                          Create new pipeline
                        </p>
                        <IconPlus class={"w-3 h-3 ml-3"} />
                      </div>
                    </a>
                  </div>
                </ul>
              </form>
            </div>
          </div>
        )}
        <div class="w-[308px] ml-2 overflow-hidden">
          <div class="bg-[#28203F] rounded-lg shadow dark:bg-gray-700">
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
                  <button
                    id="attached-pipeline"
                    className={`text-white border border-gray-600 font-medium rounded-sm w-full flex justify-between text-sm px-2 text-xs py-1 text-center inline-flex items-centerfocus:ring-1 focus:outline-none focus:ring-purple-600 ${
                      attachOpen &&
                      "ring-1 outline-none active:ring-purple-600"
                    }`}
                    type="button"
                    onClick={() => setAttachOpen(!attachOpen)}
                  >
                    {attachedPipeline?.name}
                    <IconUnlink class="w-4 h-4 text-gray-400" />
                  </button>
                )
                : (
                  <button
                    id="attached-pipeline"
                    className="text-[#8E84AD] border border-gray-600 hover:border-[#8E84AD] font-medium rounded-sm w-full flex justify-between text-sm px-2 text-xs py-1 text-center inline-flex items-center focus:ring-1 focus:outline-none focus:ring-purple-600 active:ring-1 active:outline-none active:ring-purple-600"
                    type="button"
                    onClick={() => setAttachOpen(!attachOpen)}
                  >
                    {"Attach a pipeline"}
                    <IconPlus class="w-4 h-4" />
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
      <Toast
        open={success != null}
        setOpen={() => setSuccess(null)}
        type={success?.status === true ? "success" : "error"}
        message={success?.message || ""}
      />
    </>
  );
}
