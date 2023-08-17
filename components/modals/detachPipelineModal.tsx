import IconX from "tabler-icons/tsx/x.tsx";
import { Audience } from "snitch-protos/protos/common.ts";
import { Pipeline } from "snitch-protos/protos/pipeline.ts";
import { getAudienceOpRoute } from "../../lib/utils.ts";
import { toastSignal } from "../toasts/toast.tsx";
import IconUnlink from "tabler-icons/tsx/unlink.tsx";
import { opModal } from "../serviceMap/opModalSignal.ts";

export const DetachPipelineModal = (
  { audience, pipeline }: {
    audience: Audience;
    pipeline: Pipeline;
  },
) => {
  const close = () => opModal.value = { ...opModal.value, detach: false };

  const detach = async () => {
    const response = await fetch(
      `${getAudienceOpRoute(audience)}/pipeline/${pipeline.id}/detach`,
      {
        method: "POST",
      },
    );

    const { success } = await response.json();

    if (success.message) {
      toastSignal.value = {
        id: "pipelineCrud",
        type: success.status ? "success" : "error",
        message: success.message,
      };
    }
    close();
  };

  return (
    <div class="absolute top-[8%] left-[35%] z-50 p-4 overflow-x-hidden overflow-y-auto inset-0 max-h-[80vh]">
      <div class="relative w-full max-w-md max-h-full">
        <div class="relative bg-white rounded-lg border border-burnt shadow-2xl shadow-burnt">
          <button
            type="button"
            className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center"
            onClick={close}
          >
            <IconX class="w-6 h-6" />
          </button>
          <div class="p-6 text-center">
            <IconUnlink class="w-10 h-10 mt-3 mx-auto text-burnt" />
            <div class="my-4">
              Detach pipeline{" "}
              <span class="my-5 text-medium font-bold ">
                {pipeline.name}
              </span>{" "}
              from operation{" "}
              <span class="my-5 text-medium font-bold ">
                {audience.operationName}
              </span>?
            </div>

            <button
              className="btn-secondary mr-2"
              onClick={close}
            >
              Cancel
            </button>
            <button
              class="btn-heimdal"
              type="submit"
              onClick={detach}
            >
              Detach
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
