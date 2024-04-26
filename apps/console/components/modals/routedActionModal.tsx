import { ReactNode } from "preact/compat";
import IconX from "tabler-icons/tsx/x.tsx";

export const RoutedActionModal = (
  { icon, message, actionText, cancelUrl, destructive }: {
    icon: ReactNode;
    message: ReactNode;
    actionText: string;
    cancelUrl: string;
    destructive?: boolean;
  },
) => {
  return (
    //
    // Disabling partial nav here as downstream redirects don't work with fresh.
    // Roundabout typecast as deno/fresh does not permit a straightforward f-client-nav="false"
    <div className="fixed top-[8%] left-[30%] z-50">
      <div
        class="relative min-w-96 max-h-[80vh] max-w-[80vw] p-4 overflow-x-hidden overflow-y-auto"
        f-client-nav={"false" as unknown as boolean}
      >
        <div
          class={`relative bg-white rounded-lg border shadow-xl px-6 pt-8 pb-4 ${
            destructive ? "border-streamdalRed" : "border-burnt"
          }`}
        >
          <a href={cancelUrl}>
            <button
              type="button"
              className="absolute top-2 right-2 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center"
            >
              <IconX class="w-6 h-6" />
            </button>
          </a>
          <div class="flex flex-col">
            <div className="mx-auto mb-4">{icon}</div>
            <div className="mx-auto mb-4">{message}</div>

            <div className="mx-auto">
              <form method="POST">
                <a
                  href={cancelUrl}
                >
                  <button type="button" class="btn-secondary mr-2">
                    Cancel
                  </button>
                </a>
                <button
                  class={destructive ? "btn-delete" : "btn-heimdal"}
                  type="submit"
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
