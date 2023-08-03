import { Consumer } from "../icons/consumer.tsx";
import { Producer } from "../icons/producer.tsx";

export const InfoModal = (props: any) => {
  const item = props.name.params.info;
  console.log(
    "where are you:",
    props.name.data.serviceMap["Test Service Name"].pipelines,
  );
  const pipelines = props.name.data.serviceMap["Test Service Name"].pipelines;
  return (
    <div>
      <div
        tabIndex={-1}
        class="absolute mt-20 right-10 z-50 w-[308px] px-4 py-2 overflow-x-hidden overflow-y-hidden"
      >
        <div class="relative w-full max-w-2xl max-h-full">
          <div class="relative bg-[#28203F] rounded-lg shadow dark:bg-gray-700">
            <div class="rounded-t flex justify-between">
              <div class="flex items-start justify-between p-4">
                {props.name.params.info === "consumer"
                  ? <Consumer className={"mx-2"} />
                  : <Producer className={"mx-2"} />}
                <div class="flex flex-col">
                  <h3 class="text-lg text-white dark:text-white">
                    Item-Name
                  </h3>
                  {/* This is a placeholder--won't use this janky chained string iterators on actual modal */}
                  <p class="text-xs text-gray-500">
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </p>
                </div>
              </div>
              <a href={"/flow"}>
                <button
                  type="button"
                  className="mt-1 mr-1 text-white bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                  data-modal-hide="accordion-collapse"
                >
                  <svg
                    className="w-3 h-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                </button>
              </a>
            </div>
            <div class="px-4 py-1">
              <div class="mb-2 flex justify-between items-center pr-2">
                <h3 class="text-white text-sm">Attached Pipeline</h3>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  class="cursor-pointer"
                >
                  <path
                    d="M7.78557 1.01015C7.78557 0.615663 7.46578 0.295867 7.07129 0.295867C6.6768 0.295866 6.357 0.615663 6.357 1.01015L6.357 6.35679L1.01039 6.35679C0.615904 6.35679 0.296108 6.67659 0.296107 7.07108C0.296107 7.46557 0.615904 7.78536 1.01039 7.78536L6.357 7.78536L6.357 13.132C6.357 13.5265 6.6768 13.8463 7.07129 13.8463C7.46578 13.8463 7.78557 13.5265 7.78557 13.132L7.78557 7.78536L13.1322 7.78536C13.5267 7.78536 13.8465 7.46557 13.8465 7.07108C13.8465 6.67659 13.5267 6.35679 13.1322 6.35679L7.78557 6.35679L7.78557 1.01015Z"
                    fill="white"
                  />
                </svg>
              </div>
              <button
                id="attached-pipeline"
                data-dropdown-toggle="attached-pipeline-dropdown"
                class="text-white font-medium rounded-sm w-full flex justify-between text-sm px-2 text-xs py-1 text-center inline-flex items-center"
                type="button"
              >
                {pipelines[0].pipeline.name}
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
                  {pipelines.map((pipeline: any) => (
                    <li>
                      <a class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">{pipeline.pipeline.name}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div
              id="accordion-collapse"
              data-accordion="collapse"
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
                <div class="p-5">
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
                </div>
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
                  <p class="mb-2 text-gray-500 dark:text-gray-400">
                    Manage Notifications here
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
