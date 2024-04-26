import { ActionModal } from "root/components/modals/actionModal.tsx";
import { Audience } from "streamdal-protos/protos/sp_common.ts";
import { Pipeline } from "streamdal-protos/protos/sp_pipeline.ts";
import IconUnlink from "tabler-icons/tsx/unlink.tsx";
import { audienceKey, getAudienceOpRoute } from "../../lib/utils.ts";
import { opModal } from "../serviceMap/opModalSignal.ts";
import { serviceSignal } from "../serviceMap/serviceSignal.ts";
import { toastSignal } from "../toasts/toast.tsx";

export const detachPipeline = (audience: Audience, pipeline: Pipeline) => {
  serviceSignal.value = {
    ...serviceSignal.value,
    pipelines: {
      ...serviceSignal.value.pipelines,
      [pipeline.id]: {
        ...serviceSignal.value.pipelines[pipeline.id],
        audiences: serviceSignal.value.pipelines[pipeline.id]?.audiences
          ?.filter((
            a: Audience,
          ) => audienceKey(a) !== audienceKey(audience)),
      },
    },
  };
};

export const DetachPipelineModal = (
  { audience }: { audience: Audience },
) => {
  const pipeline = opModal.value.detachPipeline;

  if (!pipeline) {
    toastSignal.value = {
      id: "pipelineCrud",
      type: "error",
      message: "Pipeline not found",
    };
    return null;
  }

  const close = () =>
    opModal.value = { ...opModal.value, detachPipeline: null };

  const detach = async () => {
    const response = await fetch(
      `${getAudienceOpRoute(audience)}/pipeline/${pipeline.id}/detach`,
      {
        method: "POST",
      },
    );

    const { success } = await response.json();

    if (success.message) {
      detachPipeline(audience, pipeline);
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
          Detach pipeline{" "}
          <span class="text-medium font-bold ">
            {pipeline.name}
          </span>?
        </div>
      }
      actionText="Detach"
      destructive={false}
      onClose={close}
      onAction={detach}
    />
  );
};
