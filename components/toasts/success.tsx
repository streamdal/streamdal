import IconCheck from "tabler-icons/tsx/check.tsx";
import {
  useEffect,
  useState,
} from "https://esm.sh/stable/preact@10.15.1/denonext/hooks.js";
import IconX from "tabler-icons/tsx/x.tsx";

export const SuccessToast = (
  { message, open = true, autoClose = true, closeDuration = 3000 }: {
    message: string;
    open?: boolean;
    autoClose?: boolean;
    closeDuration?: number;
  },
) => {
  const [toastOpen, setToastOpen] = useState(false);
  useEffect(() => {
  }, []);

  useEffect(() => {
    setToastOpen(open);
    if (open && autoClose) {
      setTimeout(() => {
        setToastOpen(false);
      }, closeDuration);
    }
  }, [open]);

  return (
    toastOpen
      ? (
        <div
          id="toast-success"
          class="fixed top-[8%] left-[40%] z-50 flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg border border-streamdalGreen"
          role="alert"
        >
          <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg">
            <IconCheck class="w-6 h-6" />
          </div>
          <div class="ml-3 text-sm font-normal">{message}</div>
          <button
            type="button"
            class="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 "
            data-dismiss-target="#toast-success"
            aria-label="Close"
            onClick={() => setToastOpen(false)}
          >
            <IconX class="w-6 h-6" />
          </button>
        </div>
      )
      : null
  );
};
