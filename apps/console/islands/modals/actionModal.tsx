import { ReactNode } from "preact/compat";
import IconX from "tabler-icons/tsx/x.tsx";

export const ActionModal = (
  { icon, message, actionText, onAction, onClose, destructive }: {
    icon: ReactNode;
    message: ReactNode;
    actionText: string;
    onAction: () => void;
    onClose: () => void;
    destructive?: boolean;
  },
) => {
  return (
    <div className="fixed top-[16%] left-[30%] z-50">
      <div class="relative min-w-96 max-h-[80vh] max-w-[80vw] p-4 overflow-x-hidden overflow-y-auto">
        <div
          class={`relative bg-white rounded-lg border shadow-xl px-6 pt-8 pb-4 ${
            destructive ? "border-streamdalRed" : "border-burnt"
          }`}
        >
          <button
            type="button"
            className="absolute top-2 right-2 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center"
            onClick={onClose}
          >
            <IconX class="w-6 h-6" />
          </button>

          <div class="flex flex-col">
            <div className="mx-auto mb-4">{icon}</div>
            <div className="mx-auto mb-4">{message}</div>

            <div className="mx-auto">
              <form method="POST">
                <button
                  type="button"
                  class="btn-secondary mr-2"
                  onClick={onClose}
                >
                  Cancel
                </button>

                <button
                  class={destructive ? "btn-delete" : "btn-heimdal"}
                  type="submit"
                  onClick={onAction}
                >
                  {actionText}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
