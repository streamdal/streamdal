import IconX from "tabler-icons/tsx/x.tsx";
import { Audience } from "streamdal-protos/protos/sp_common.ts";
import { Pipeline } from "streamdal-protos/protos/sp_pipeline.ts";
import { audienceKey, getAudienceOpRoute } from "../../lib/utils.ts";
import { toastSignal } from "../toasts/toast.tsx";
import IconPlayerPause from "tabler-icons/tsx/player-pause.tsx";
import { opModal } from "../serviceMap/opModalSignal.ts";
import { serviceSignal } from "../serviceMap/serviceSignal.ts";

export const resumePipeline = (audience: Audience, pipeline: Pipeline) => {
  serviceSignal.value = {
    ...serviceSignal.value,
    pipelines: {
      ...serviceSignal.value.pipelines,
      [pipeline.id]: {
        ...serviceSignal.value.pipelines[pipeline.id],
        paused: serviceSignal.value.pipelines[pipeline.id]?.paused?.filter((
          a: Audience,
        ) => audienceKey(a) !== audienceKey(audience)),
      },
    },
  };
};

export const ResumePipelineModal = (
  { audience, pipeline }: {
    audience: Audience;
    pipeline: Pipeline;
  },
) => {
  const close = () => opModal.value = { ...opModal.value, resume: false };

  const resume = async () => {
    const response = await fetch(
      `${getAudienceOpRoute(audience)}/pipeline/${pipeline.id}/resume`,
      {
        method: "POST",
      },
    );

    const { success } = await response.json();

    if (success.message) {
      resumePipeline(audience, pipeline);
      toastSignal.value = {
        id: "pipelineCrud",
        type: success.status ? "success" : "error",
        message: success.message,
      };
    }
    opModal.value = { ...opModal.value, resume: false };
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
              Resume pipeline{" "}
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
              onClick={resume}
            >
              Resume
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
