import IconTrash from "tabler-icons/tsx/trash.tsx";
import IconX from "tabler-icons/tsx/x.tsx";
import { Audience } from "snitch-protos/protos/sp_common.ts";
import { Pipeline } from "snitch-protos/protos/sp_pipeline.ts";
import { getAudienceOpRoute } from "../../lib/utils.ts";
import { toastSignal } from "../toasts/toast.tsx";
import IconPlayerPause from "tabler-icons/tsx/player-pause.tsx";
import { opModal } from "../serviceMap/opModalSignal.ts";

export const PausePipelineModal = (
  { audience, pipeline }: {
    audience: Audience;
    pipeline: Pipeline;
  },
) => {
  const close = () => opModal.value = { ...opModal.value, pause: false };

  const pause = async () => {
    const response = await fetch(
      `${getAudienceOpRoute(audience)}/pipeline/${pipeline.id}/pause`,
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
            <IconPlayerPause class="w-10 h-10 mt-3 mx-auto text-burnt" />
            <div class="my-4">
              Pause pipeline{" "}
              <span class="my-5 text-medium font-bold ">
                {pipeline.name}
              </span>{" "}
              for operation{" "}
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
              onClick={pause}
            >
              Pause
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
