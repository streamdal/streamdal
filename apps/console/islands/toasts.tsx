import { signal, useSignalEffect } from "@preact/signals";
import { debounce } from "$std/async/debounce.ts";
import { useEffect, useState } from "preact/hooks";
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

export const toastSignal = signal<ToastType | null>(null);
export const toastsSignal = signal<ToastType[]>([]);

export const showToast = (
  { id, message, type, autoClose = true }: ToastType,
) => {
  toastSignal.value = { id, message, type, autoClose };
};

export const Toasts = () => {
  const addToast = debounce(
    (toast: ToastType) => {
      if (toastsSignal.value.find((t) => t.id === toast.id)) {
        return;
      }

      toastsSignal.value = [...toastsSignal.value, ...[toast]];

      if (toast.autoClose) {
        setTimeout(() => {
          removeToast(toast);
        }, 3000);
      }
    },
    10,
  );

  const removeToast = (toast: ToastType) => {
    toastsSignal.value = toastsSignal.value.filter((t) => t.id !== toast.id);
  };

  useSignalEffect(() => {
    if (
      toastSignal.value
    ) {
      addToast(toastSignal.value);
    }

    toastSignal.value = null;
  });

  if (toastsSignal.value.length === 0) {
    return null;
  }

  return (
    <div class="relative">
      <div class="fixed top-[10%] left-[40%] z-50 flex flex-col w-full">
        {toastsSignal.value.map(({ id, message, type }) => (
          <div
            id={id}
            class={`flex items-center max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg border ${
              type === "error" ? "border-streamdalRed" : "border-streamdalGreen"
            }`}
            role="alert"
          >
            <div
              class={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 ${
                type === "error" ? "text-red-500" : "text-emerald-500"
              } ${type === "error" ? "bg-red-100" : "bg-green-100"} rounded-lg`}
            >
              {type === "error"
                ? <IconExclamationCircle class="w-6 h-6 text-streamdalRed" />
                : <IconCheck class="w-6 h-6 text-streamdalGreen" />}
            </div>
            <div class="ml-3 text-sm font-normal w-full">{message}</div>
            <button
              type="button"
              class="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 "
              aria-label="Close"
              onClick={() => removeToast({ id, message, type })}
            >
              <IconX class="w-6 h-6" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
