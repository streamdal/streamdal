import { Toast, toastSignal } from "../toasts/toast.tsx";
import { NotificationDetail } from "../../islands/notifications.tsx";
import { SuccessType } from "../../routes/_middleware.ts";

export const NotificationConfigModal = ({ success }: SuccessType) => {
  if (success?.message) {
    toastSignal.value = {
      id: "notifications",
      type: success.status ? "success" : "error",
      message: success.message,
    };
  }

  return (
    <>
      <div
        id="notificationModal"
        aria-modal="true"
        class="absolute mt-12 z-40 w-full h-full px-4 py-2 overflow-x-hidden overflow-y-hidden max-h-full justify-center items-center flex"
        role="dialog"
      >
        <div class="relative h-full w-[600px] min-w-[400px] max-w-5xl">
          <div class="flex justify-center relative bg-white h-3/4 rounded-lg shadow-2xl shadow-stormCloud">
            <a
              href="/"
              className="flex justify-center items-center absolute right-0 w-10 h-10"
            >
              <button
                type="button"
                className="flex justify-center items-center text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 justify-center items-center"
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
            <div class="flex flex-col min-w-full items-center px-10 py-10">
              <div class="text-[16px] font-bold mb-3">Notifications</div>
              <NotificationDetail success={success} />
            </div>
          </div>
        </div>
      </div>
      <Toast id="notifications" />
    </>
  );
};
