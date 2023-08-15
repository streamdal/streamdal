import { ConsumerIcon } from "../components/icons/consumer.tsx";
import { ProducerIcon } from "../components/icons/producer.tsx";
import IconPlus from "tabler-icons/tsx/plus.tsx";
import IconX from "tabler-icons/tsx/x.tsx";
import IconUnlink from "tabler-icons/tsx/unlink.tsx";

import { titleCase } from "../lib/utils.ts";
import { ServiceMapType } from "../lib/fetch.ts";
import { PipelineInfo } from "snitch-protos/protos/info.ts";
import { useEffect, useState } from "preact/hooks";
import { Toast } from "../components/toasts/toast.tsx";
import { SuccessType } from "../routes/_middleware.ts";

type Params = {
  service: string;
  component: string;
  operationType: string;
  operationName: string;
};

export default function InfoModal(
  { params, serviceMap, success }: {
    params: Params;
    serviceMap: ServiceMapType;
    success?: SuccessType;
  },
) {
  const associatedPipeline = serviceMap
    ?.pipes.find(
      (p: PipelineInfo) =>
        p.audiences.find((a) => a.operationName === params.operationName),
    );
  const [isOpen, setIsOpen] = useState(false);

  const [linkedPipeline, setLinkedPipeline] = useState(
    associatedPipeline.pipeline,
  );
  const [toastOpen, setToastOpen] = useState(false);
  const attachPipeline = async (e: any) => {
    const attachFormData = new FormData(e.target);
  };
  const handleChange = (id) => {
    const newPipelineName = serviceMap.pipes.find((p: PipelineInfo) =>
      p.pipeline.id === id
    );
    setLinkedPipeline(newPipelineName.pipeline);
  };

  useEffect(() => {
    if (success?.message) {
      setToastOpen(true);
    }
  }, [success]);

  return (
    <>
      <Toast
        open={toastOpen}
        setOpen={setToastOpen}
        type={success?.status === true ? "success" : "error"}
        message={success?.message || ""}
      />

      <div data-modal-target="accordion-collapse">
        <div
          tabIndex={-1}
          class="absolute mt-20 right-10 z-50 w-[650px] px-4 py-2 overflow-y-hidden flex justify-end"
        >
          <div class="relative w-[308px] max-w-2xl max-h-full">
            <div class="relative bg-[#28203F] rounded-lg shadow dark:bg-gray-700">
              <div class="rounded-t flex justify-between">
                <div class="flex items-start justify-between p-4">
                  {params.operationType === "consumer"
                    ? <ConsumerIcon className={"mx-2"} />
                    : <ProducerIcon className={"mx-2"} />}
                  <div class="flex flex-col">
                    <h3 class="text-lg text-white dark:text-white">
                      {titleCase(params.operationName)}
                    </h3>
                    <p class="text-xs text-gray-500">
                      {`${titleCase(params.operationType)}`}
                    </p>
                  </div>
                </div>
                <a href={"/"}>
                  <button
                    type="button"
                    className="mt-1 mr-1 text-white bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                    data-modal-hide="accordion-collapse"
                  >
                    <IconX class="w-6 h-6" />
                  </button>
                </a>
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
                  : linkedPipeline
                  ? (
                    <button
                      id="attached-pipeline"
                      className={`text-white border border-gray-600 font-medium rounded-sm w-full flex justify-between text-sm px-2 text-xs py-1 text-center inline-flex items-centerfocus:ring-1 focus:outline-none focus:ring-purple-600 ${
                        isOpen && "ring-1 outline-none active:ring-purple-600"
                      }`}
                      type="button"
                      onClick={() => setIsOpen(!isOpen)}
                    >
                      {linkedPipeline?.name}
                      <IconUnlink class="w-4 h-4 text-gray-400" />
                    </button>
                  )
                  : (
                    <button
                      id="attached-pipeline"
                      className="text-[#8E84AD] border border-gray-600 hover:border-[#8E84AD] font-medium rounded-sm w-full flex justify-between text-sm px-2 text-xs py-1 text-center inline-flex items-center focus:ring-1 focus:outline-none focus:ring-purple-600 active:ring-1 active:outline-none active:ring-purple-600"
                      type="button"
                      onClick={() => setIsOpen(!isOpen)}
                    >
                      {"Attach a pipeline"}
                      <IconPlus class="w-4 h-4" />
                    </button>
                  )}
                {isOpen && (
                  <div class="z-50 bg-white  absolute right-[325px] divide-gray-100 rounded-md shadow w-[200px] dark:bg-gray-700">
                    <form
                      onSumbit={attachPipeline}
                      method="POST"
                      action={`${[
                        params.operationName,
                      ]}/pipeline/${linkedPipeline?.id}/attach-detach`}
                    >
                      <ul
                        class="py-2 text-sm text-gray-700 dark:text-gray-200 divide-y"
                        aria-labelledby="dropdownDefaultButton"
                      >
                        {serviceMap.pipes.map((
                          p: any,
                          i: number,
                        ) => (
                          <div class="flex items-center py-2 px-2 hover:bg-purple-50">
                            <input
                              id={`default-radio-${i}`}
                              type="radio"
                              value=""
                              onChange={() =>
                                handleChange(
                                  p.pipeline.id,
                                )}
                              checked={p.pipeline.id ===
                                linkedPipeline?.id}
                              name="pipeline-name"
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
                        <div class="flex items-center justify-center py-2 px-2 hover:bg-purple-50">
                          <a href={"/pipelines"}>
                            <button>
                              <div class={"flex justify-between items-center"}>
                                <p class={"text-xs text-gray-600"}>
                                  Create new pipeline
                                </p>
                                <IconPlus class={"w-3 h-3 ml-3"} />
                              </div>
                            </button>
                          </a>
                        </div>
                        <a href={"/pipelines"}>
                          <button
                            class="flex w-full items-center justify-center py-2 px-2 bg-[#F9F7FF] hover:bg-[#FFD260]"
                            type={"submit"}
                          >
                            <p class={"text-xs text-gray-600"}>
                              Save
                            </p>
                          </button>
                        </a>
                      </ul>
                    </form>
                  </div>
                )}
              </div>
              <div
                id="accordion-collapse"
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
      </div>
    </>
  );
}
