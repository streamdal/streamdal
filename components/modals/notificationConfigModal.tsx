import { opModal } from "../serviceMap/opModalSignal.ts";
import { Toast, toastSignal } from "../toasts/toast.tsx";
import { NotificationDetail } from "../../islands/notifications.tsx";
import { SuccessType } from "../../routes/_middleware.ts";

export const NotificationConfigModal = ({ success }: SuccessType) => {
  const close = () => opModal.value = { ...opModal.value, pause: false };

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
        <div class="relative w-1/2 h-full max-w-5xl">
          <div class="relative bg-white h-3/4 rounded-lg shadow-2xl shadow-stormCloud">
            <div class="flex flex-col justify-between items-center px-10 py-10">
              <div class="text-[16px] font-bold">Notifications</div>
              <NotificationDetail success={success} />
            </div>
          </div>
        </div>
      </div>
      <Toast id="notification" />
    </>
  );
};
