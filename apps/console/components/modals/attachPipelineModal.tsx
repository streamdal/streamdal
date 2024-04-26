import { ActionModal } from "root/components/modals/actionModal.tsx";
import { Audience } from "streamdal-protos/protos/sp_common.ts";
import { Pipeline } from "streamdal-protos/protos/sp_pipeline.ts";
import IconUnlink from "tabler-icons/tsx/unlink.tsx";
import { toastSignal } from "../toasts/toast.tsx";
import { getAudienceOpRoute } from "../../lib/utils.ts";
import { opModal } from "../serviceMap/opModalSignal.ts";
import { serviceSignal } from "../serviceMap/serviceSignal.ts";

const updateSignal = (audience: Audience, pipeline: Pipeline) => {
  serviceSignal.value = {
    ...serviceSignal.value,
    pipelines: {
      ...serviceSignal.value.pipelines,
      [pipeline.id]: {
        ...serviceSignal.value.pipelines[pipeline.id],
        audiences: [
          ...serviceSignal.value.pipelines[pipeline.id]
            ? serviceSignal.value.pipelines[pipeline.id].audiences
            : [],
          ...[audience],
        ],
      },
    },
  };
};

export const AttachPipelineModal = (
  { audience, attachPipeline }: {
    audience: Audience;
    attachPipeline: Pipeline;
  },
) => {
  const close = () =>
    opModal.value = { ...opModal.value, attachPipeline: null };

  const attach = async () => {
    const response = await fetch(
      `${getAudienceOpRoute(audience)}/pipeline/${attachPipeline.id}/attach`,
      {
        method: "POST",
      },
    );

    const { success } = await response.json();

    if (success.message) {
      updateSignal(audience, attachPipeline);
      toastSignal.value = {
        id: "pipelineCrud",
        type: success.status ? "success" : "error",
        message: success.message,
      };
    }

    close();
  };

  return (
    <ActionModal
      icon={<IconUnlink class="w-10 h-10 mt-3 text-burnt" />}
      message={
        <div>
          Attach pipeline{" "}
          <span class="text-medium font-bold ">
            {attachPipeline.name}
          </span>?
        </div>
      }
      actionText="Attach"
      destructive={false}
      onClose={close}
      onAction={attach}
    />
  );
};
