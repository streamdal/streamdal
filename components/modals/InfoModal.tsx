import {Consumer} from "../icons/consumer.tsx";

export const InfoModal = () => {
    return (
        <div>
            {/*<div*/}
            {/*    className={"absolute w-screen h-full mt-[-60px] mb-[-20px] bg-black opacity-20 z-30"}*/}
            {/*>*/}
            {/*</div>*/}
            <div
                tabIndex="-1"
                class="absolute mt-20 right-10 z-50 w-[308px] h-[560px] p-4 overflow-x-hidden overflow-y-hidden"
            >
                <div class="relative w-full max-w-2xl max-h-full">
                    <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
                        <div class="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600">
                            <Consumer className={"mx-2"}/>
                            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                                Item-Name
                            </h3>
                            <button
                                type="button"
                                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
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
                        </div>
                        <div id="accordion-collapse" data-accordion="collapse">
                            <h2 id="collapse-heading-1">
                                <button type="button"
                                        className="flex items-center justify-between w-full p-5 font-medium text-left text-gray-500 border border-b-0 border-gray-200 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                        data-accordion-target="#collapse-body-1" aria-expanded="true"
                                        aria-controls="collapse-body-1">
                                    <span>Rules</span>
                                    <svg data-accordion-icon width="10" height="6" viewBox="0 0 10 6" fill="none"
                                         xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 rotate-180 shrink-0">
                                        <path d="M9 1L5 5L1 1" stroke="#2B2343" stroke-width="2" stroke-linecap="round"
                                              stroke-linejoin="round"/>
                                    </svg>

                                </button>
                            </h2>
                            <div id="collapse-body-1" class="hidden"
                                 aria-labelledby="collapse-heading-1">
                                <div
                                    class="p-5 border border-b-0 border-gray-200 dark:border-gray-700 dark:bg-gray-900">
                                    <p class="mb-2 text-gray-500 dark:text-gray-400">This is a rule</p>
                                    <p class="text-gray-500 dark:text-gray-400">This is another rule</p>
                                </div>
                            </div>
                            <h2 id="collapse-heading-2">
                                <button type="button"
                                        className="flex items-center justify-between w-full p-5 font-medium text-left text-gray-500 border border-b-0 border-gray-200 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                        data-accordion-target="#collapse-body-2" aria-expanded="false"
                                        aria-controls="collapse-body-2">
                                    <span>Trends</span>
                                    <svg data-accordion-icon width="10" height="6" viewBox="0 0 10 6" fill="none"
                                         xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 rotate-180 shrink-0">
                                        <path d="M9 1L5 5L1 1" stroke="#2B2343" stroke-width="2" stroke-linecap="round"
                                              stroke-linejoin="round"/>
                                    </svg>

                                </button>
                            </h2>
                            <div id="collapse-body-2" class="hidden"
                                 aria-labelledby="collapse-heading-2">
                                <div class="p-5 border border-b-0 border-gray-200 dark:border-gray-700">
                                    <h3 class="text-4xl text-green-500 font-semibold dark:text-gray-400">500GB</h3>
                                    <p class="text-gray-400 text-sm dark:text-gray-400">Trend Name</p>
                                </div>
                            </div>
                            <h2 id="collapse-heading-3">
                                <button type="button"
                                        className="flex items-center justify-between w-full p-5 font-medium text-left text-gray-500 border border-gray-200 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                        data-accordion-target="#collapse-body-3" aria-expanded="false"
                                        aria-controls="collapse-body-3">
                                    <span>Notifications</span>
                                    <svg data-accordion-icon width="10" height="6" viewBox="0 0 10 6" fill="none"
                                         xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 rotate-180 shrink-0">
                                        <path d="M9 1L5 5L1 1" stroke="#2B2343" stroke-width="2" stroke-linecap="round"
                                              stroke-linejoin="round"/>
                                    </svg>

                                </button>
                            </h2>
                            <div id="collapse-body-3" class="hidden"
                                 aria-labelledby="collapse-heading-3">
                                <div class="p-5 border border-t-0 border-gray-200 dark:border-gray-700">
                                    <p class="mb-2 text-gray-500 dark:text-gray-400">Manage Notifications here</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
