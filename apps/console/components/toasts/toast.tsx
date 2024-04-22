import IconExclamationCircle from "tabler-icons/tsx/exclamation-circle.tsx";
import IconCheck from "tabler-icons/tsx/check.tsx";
import IconX from "tabler-icons/tsx/x.tsx";
import { signal } from "@preact/signals";

export type ToastKind = "error" | "success";

export type ToastType = {
  id: string;
  message: string;
  type: ToastKind;
};

export const toastSignal = signal<ToastType | null>(null);

export const Toast = ({ id }: { id: string }) => {
  if (toastSignal.value == null || id !== toastSignal.value.id) {
    return null;
  }

  setTimeout(() => {
    toastSignal.value = null;
  }, 3000);

  const { type, message } = toastSignal.value;

  return (
    <div class="relative">
      <div
        id="toast-x"
        class={`fixed top-[10%] left-[40%] z-50 flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg border border-${
          type === "error" ? "streamdalRed" : "streamdalGreen"
        }`}
        role="alert"
      >
        <div
          class={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-${
            type === "error" ? "red" : "green"
          }-500 bg-${type === "error" ? "red" : "green"}-100 rounded-lg`}
        >
          {type === "error"
            ? <IconExclamationCircle class="w-6 h-6 text-streamdalRed" />
            : <IconCheck class="w-6 h-6 text-streamdalGreen" />}
        </div>
        <div class="ml-3 text-sm font-normal w-full">{message}</div>
        <button
          type="button"
          class="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 "
          data-dismiss-target="#toast-x"
          aria-label="Close"
          onClick={() => toastSignal.value = null}
        >
          <IconX class="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
