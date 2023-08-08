import IconExclamationCircle from "tabler-icons/tsx/exclamation-circle.tsx";
import IconCheck from "tabler-icons/tsx/check.tsx";
import IconX from "tabler-icons/tsx/x.tsx";
import { useEffect } from "preact/hooks";

export type ToastType = "error" | "success";

//
// TODO: maybe move to a proper react context
//  provider so state doesn't have to be passed ind
export const Toast = (
  { message, type, open, setOpen, autoClose = true, closeDuration = 3000 }: {
    message: string;
    type: ToastType;
    open: boolean;
    setOpen: (arg: boolean) => void;
    autoClose?: boolean;
    closeDuration?: number;
  },
) => {
  useEffect(() => {
    if (open && autoClose) {
      setTimeout(() => {
        setOpen(false);
      }, closeDuration);
    }
  }, [open]);

  return (
    open
      ? (
        <div class="relative">
          <div
            id="toast-x"
            class={`fixed top-[8%] left-[40%] z-50 flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg border border-${
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
            <div class="ml-3 text-sm font-normal">{message}</div>
            <button
              type="button"
              class="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 "
              data-dismiss-target="#toast-x"
              aria-label="Close"
              onClick={() => setOpen(false)}
            >
              <IconX class="w-6 h-6" />
            </button>
          </div>
        </div>
      )
      : null
  );
};
