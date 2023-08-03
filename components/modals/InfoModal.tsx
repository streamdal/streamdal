import { Consumer } from "../icons/consumer.tsx";
import { Producer } from "../icons/producer.tsx";

export const InfoModal = (props: any) => {
  const item = props.name.params.info;
  return (
    <div>
      <div
        tabIndex={-1}
        class="absolute mt-20 right-10 z-50 w-[308px] h-[560px] p-4 overflow-x-hidden overflow-y-hidden"
      >
        <div class="relative w-full max-w-2xl max-h-full">
          <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <div class="border-b rounded-t dark:border-gray-600 flex justify-between">
              <div class="flex items-start justify-between p-4">
                {props.name.params.info === "consumer"
                  ? <Consumer className={"mx-2"} />
                  : <Producer className={"mx-2"} />}
                <div class="flex flex-col">
                  <h3 class="text-lg text-gray-900 dark:text-white">
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
                  className="mt-1 mr-1 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                  data-modal-hide="defaultModal"
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
                  <span class="sr-only">Close modal</span>
                </button>
              </a>
            </div>
            <div id="accordion-collapse" data-accordion="collapse">
              <h2 id="collapse-heading-1">
                <button
                  type="button"
                  className="flex items-center w-full p-5 font-medium text-left text-gray-500 border focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  data-accordion-target="#collapse-body-1"
                  aria-expanded="false"
                  aria-controls="collapse-body-1"
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
                      stroke="#2B2343"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <h3 class="text-gray-700 text-sm font-semibold ml-3">
                    Rules
                  </h3>
                </button>
              </h2>
              <div
                id="collapse-body-1"
                class="hidden"
                aria-labelledby="collapse-heading-1"
              >
                <div class="p-5 border border-b-0 border-gray-200 dark:border-gray-700 dark:bg-gray-900">
                  <p class="mb-2 text-gray-500 dark:text-gray-400">
                    This is a rule
                  </p>
                  <p class="text-gray-500 dark:text-gray-400">
                    This is another rule
                  </p>
                </div>
              </div>
              <h2 id="collapse-heading-2">
                <button
                  type="button"
                  className="flex items-center w-full p-5 font-medium text-left text-gray-500 border border-b-0 border-gray-200 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
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
                      stroke="#2B2343"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <h3 class="text-gray-700 text-sm font-semibold ml-3">
                    Trends
                  </h3>
                </button>
              </h2>
              <div
                id="collapse-body-2"
                class="hidden"
                aria-labelledby="collapse-heading-2"
              >
                <div class="p-5 border border-b-1 border-gray-200 dark:border-gray-700">
                  <h3 class="text-4xl text-green-500 font-semibold dark:text-gray-400">
                    200GB
                  </h3>
                  <p class="text-gray-500 text-xs dark:text-gray-400">
                    Trend Name
                  </p>
                </div>
                <div class="px-5 py-1 border-x-1 border-gray-200 dark:border-gray-700 flex justify-between">
                  <p class="text-gray-800 text-xs dark:text-gray-400">
                    Trend Name
                  </p>
                  <div class="flex w-2/5 justify-between">
                    <p class="text-gray-600 font-semibold text-sm">200GB</p>
                    <p class="text-green-500 text-sm dark:text-gray-400">
                      +15%
                    </p>
                  </div>
                </div>
                <div class="px-5 py-1 border-x-1 border-gray-200 dark:border-gray-700 flex justify-between">
                  <p class="text-gray-800 text-xs dark:text-gray-400">
                    Trend Name
                  </p>
                  <div class="flex w-2/5 justify-between">
                    <p class="text-gray-600 font-semibold text-sm">200GB</p>
                    <p class="text-green-500 text-sm dark:text-gray-400">
                      +15%
                    </p>
                  </div>
                </div>
                <div class="px-5 py-1 border-x-1 border-gray-200 dark:border-gray-700 flex justify-between">
                  <p class="text-gray-800 text-xs dark:text-gray-400">
                    Trend Name
                  </p>
                  <div class="flex w-2/5 justify-between">
                    <p class="text-gray-600 font-semibold text-sm">200GB</p>
                    <p class="text-green-500 text-sm dark:text-gray-400">
                      +15%
                    </p>
                  </div>
                </div>
                <div class="px-5 py-1 border-x-1 border-gray-200 dark:border-gray-700 flex justify-between">
                  <p class="text-gray-800 text-xs dark:text-gray-400">
                    Trend Name
                  </p>
                  <div class="flex w-2/5 justify-between">
                    <p class="text-gray-600 font-semibold text-sm">200GB</p>
                    <p class="text-green-500 text-sm dark:text-gray-400">
                      +15%
                    </p>
                  </div>
                </div>
              </div>
              <h2 id="collapse-heading-3">
                <button
                  type="button"
                  className="flex items-center w-full p-5 font-medium text-left text-gray-500 border border-gray-200 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
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
                      stroke="#2B2343"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <h3 class="text-gray-700 text-sm font-semibold ml-3">
                    Notifications
                  </h3>
                </button>
              </h2>
              <div
                id="collapse-body-3"
                class="hidden"
                aria-labelledby="collapse-heading-3"
              >
                <div class="p-5 border border-t-0 border-gray-200 dark:border-gray-700">
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
