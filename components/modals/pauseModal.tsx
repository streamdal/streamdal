import IconPlayerPause from "tabler-icons/tsx/player-pause.tsx";

export const PauseModal = (
  { id, message }: { id: string; message: string },
) => {
  return (
    <div
      id={id}
      aria-modal="true"
      class="fixed top-[10%] left-[30%] z-50 p-4 overflow-x-hidden overflow-y-auto inset-0 max-h-[80vh]"
      role="dialog"
    >
      <div class="relative w-full max-w-md max-h-full">
        <div class="relative bg-white rounded-lg shadow">
          <a href="/">
            <button
              type="button"
              className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center"
              data-modal-hide={id}
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
          <div class="p-6 text-center">
            <IconPlayerPause class="w-12 h-12 mt-3 mx-auto text-eyelid" />
            <h3 class="my-5 text-lg font-normal ">
              {message}
            </h3>
            <a href={"/"}>
              <button className="btn-secondary mr-2">Close</button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
