import { signal } from "@preact/signals";
import IconCheck from "tabler-icons/tsx/check.tsx";
import IconExclamationCircle from "tabler-icons/tsx/exclamation-circle.tsx";
import IconX from "tabler-icons/tsx/x.tsx";
export type ToastKind = "error" | "success";

export type ToastType = {
  id: string;
  message: string;
  type: ToastKind;
  autoClose?: boolean;
};

export const toastsSignal = signal<ToastType[]>([]);

export const showToast = (
  { id, message, type, autoClose = true }: ToastType,
) => {
  addToast({ id, message, type, autoClose });
};

const addToast = (toast: ToastType) => {
  if (toastsSignal.value.find((t: ToastType) => t.id === toast.id)) {
    return;
  }

  toastsSignal.value = [...toastsSignal.value, ...[toast]];

  if (toast.autoClose) {
    setTimeout(() => {
      removeToast(toast);
    }, 3000);
  }
};

const removeToast = (toast: ToastType) => {
  toastsSignal.value = toastsSignal.value.filter((t: ToastType) =>
    t.id !== toast.id
  );
};

export const Toasts = () => {
  if (toastsSignal.value.length === 0) {
    return null;
  }

  return (
    <div class="relative">
      <div class="fixed top-[10%] left-[30%] z-50 flex flex-col">
        {toastsSignal.value.map((
          { id, message, type }: ToastType,
          i: number,
        ) => (
          <div class="relative" key={`toast-${i}`}>
            <div
              class={`flex items-center min-w-96 max-h-[80vh] max-w-[80vw] p-4 mb-4 text-gray-500 bg-white rounded-lg border ${
                type === "error"
                  ? "border-streamdalRed"
                  : "border-streamdalGreen"
              }`}
            >
              <div
                class={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 ${
                  type === "error"
                    ? "text-red-500 bg-red"
                    : "text-green-500 bg-green"
                }  rounded-lg`}
              >
                {type === "error"
                  ? <IconExclamationCircle class="w-6 h-6 text-streamdalRed" />
                  : <IconCheck class="w-6 h-6 text-streamdalGreen" />}
              </div>
              <div class="ml-3 text-sm font-normal w-full">{message}</div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => removeToast({ id, message, type })}
              >
                <IconX class="w-6 h-6" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
