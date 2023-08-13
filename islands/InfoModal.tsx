import { ConsumerIcon } from "../components/icons/consumer.tsx";
import { ProducerIcon } from "../components/icons/producer.tsx";
import IconPlus from "https://deno.land/x/tabler_icons_tsx@0.0.3/tsx/plus.tsx";
import IconX from "https://deno.land/x/tabler_icons_tsx@0.0.3/tsx/x.tsx";

import { titleCase } from "../lib/utils.ts";
import { ServiceMapType } from "../lib/fetch.ts";
import { PipelineInfo } from "snitch-protos/protos/info.ts";

type Params = {
  service: string;
  component: string;
  operationType: string;
  operationName: string;
};

export default function InfoModal(
  { params, serviceMap }: {
    params: Params;
    serviceMap: ServiceMapType;
  },
) {
  const associatedPipeline = serviceMap
    ?.pipes.find(
      (p: PipelineInfo) =>
        p.audiences.find((a) => a.operationName === params.operationName),
    );
  const attachedPipeline = associatedPipeline?.pipeline;

  //todo: pass down envars to browser/move call to route handler
  // const attachNewPipeline = (id: string) => {
  //   attachPipeline(id);
  // };

  return (
    <div data-modal-target="accordion-collapse">
      <div
        tabIndex={-1}
        class="absolute mt-20 right-10 z-50 w-[308px] px-4 py-2 overflow-x-hidden overflow-y-hidden"
      >
        <div class="relative w-full max-w-2xl max-h-full">
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
                  {/* janky uppercase stuff */}
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
                <a href={"/pipelines"}>
                  <button
                    type="button"
                    data-tooltip-target="add-pipeline-tooltip"
                    data-tooltip-placement="top"
                    className="mt-1 mr-1 text-white bg-transparent hover:bg-gray-500 hover:text-white-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                    data-modal-hide="accordion-collapse"
                  >
                    <IconPlus class="w-5 h-5 text-white" />
                  </button>
                  <div
                    id="add-pipeline-tooltip"
                    role="tooltip"
                    class="absolute z-10 invisible inline-block px-2 py-1 text-xs font-medium text-white transition-opacity duration-300 bg-gray-500 rounded-xs shadow-sm opacity-0 tooltip dark:bg-gray-700"
                  >
                    Add new pipeline
                    <div class="tooltip-arrow" data-popper-arrow></div>
                  </div>
                </a>
              </div>
              <button
                id="attached-pipeline"
                data-dropdown-toggle="attached-pipeline-dropdown"
                class="text-white border border-gray-600 font-medium rounded-sm w-full flex justify-between text-sm px-2 text-xs py-1 text-center inline-flex items-center"
                type="button"
              >
                {attachedPipeline?.name}
                <svg
                  class="w-2.5 h-2.5 ml-2.5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 10 6"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="m1 1 4 4 4-4"
                  />
                </svg>
              </button>
              <div
                id="attached-pipeline-dropdown"
                class="z-10 hidden bg-white divide-y divide-gray-100 rounded-sm shadow w-[250px] w-full dark:bg-gray-700"
              >
                <ul
                  class="py-2 text-sm text-gray-700 dark:text-gray-200"
                  aria-labelledby="dropdownDefaultButton"
                >
                  {serviceMap?.pipes.map(({ pipeline }: PipelineInfo) => (
                    <li>
                      <button
                        data-tooltip-target={pipeline.id !==
                            attachedPipeline?.id
                          ? "tooltip-default"
                          : null}
                        data-tooltip-placement="top"
                        type="button"
                        class={`px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white flex justify-start text-left w-full ${
                          pipeline.id === attachedPipeline?.id && "font-bold"
                        }`}
                        //todo pass down envars to browser
                        // onClick={() => {
                        //   pipeline.id !== attachedPipeline?.id
                        //     ? attachNewPipeline(pipeline.id)
                        //     : undefined;
                        // }}
                      >
                        {pipeline.name}
                      </button>
                      <div
                        id="tooltip-default"
                        role="tooltip"
                        class="absolute z-10 invisible inline-block px-2 py-1 text-xs font-medium text-white transition-opacity duration-300 bg-gray-500 rounded-xs shadow-sm opacity-0 tooltip dark:bg-gray-700"
                      >
                        Attach pipeline
                        <div class="tooltip-arrow" data-popper-arrow></div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
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
                  <h3 class="text-white text-sm font-semibold ml-3">Trends</h3>
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
                {
                  /* <div class="p-5">
                  <h3 class="text-4xl text-green-500 font-semibold dark:text-gray-400">
                    200GB
                  </h3>
                  <p class="text-gray-300 text-xs dark:text-gray-400">
                    Trend Name
                  </p>
                </div>
                <div class="px-5 py-1 flex justify-between">
                  <p class="text-white text-xs dark:text-gray-400">
                    Trend Name
                  </p>
                  <div class="flex w-2/5 justify-between">
                    <p class="text-white font-semibold text-sm">200GB</p>
                    <p class="text-green-500 text-sm dark:text-gray-400">
                      +15%
                    </p>
                  </div>
                </div>
                <div class="px-5 flex justify-between">
                  <p class="text-white text-xs dark:text-gray-400">
                    Trend Name
                  </p>
                  <div class="flex w-2/5 justify-between">
                    <p class="text-white font-semibold text-sm">200GB</p>
                    <p class="text-green-500 text-sm dark:text-gray-400">
                      +15%
                    </p>
                  </div>
                </div>
                <div class="px-5 py-1 flex justify-between">
                  <p class="text-white text-xs dark:text-gray-400">
                    Trend Name
                  </p>
                  <div class="flex w-2/5 justify-between">
                    <p class="text-white font-semibold text-sm">200GB</p>
                    <p class="text-green-500 text-sm dark:text-gray-400">
                      +15%
                    </p>
                  </div>
                </div>
                <div class="px-5 py-1 flex justify-between">
                  <p class="text-white text-xs dark:text-gray-400">
                    Trend Name
                  </p>
                  <div class="flex w-2/5 justify-between">
                    <p class="text-white font-semibold text-sm">200GB</p>
                    <p class="text-green-500 text-sm dark:text-gray-400">
                      +15%
                    </p>
                  </div>
                </div> */
                }
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
  );
}
