import { ActionModal } from "./actionModal.tsx";
import { Audience } from "streamdal-protos/protos/sp_common.ts";
import IconPlayerPlay from "tabler-icons/tsx/player-play.tsx";
import { audienceKey, getAudienceOpRoute } from "../../lib/utils.ts";
import { opModal } from "../../components/serviceMap/opModalSignal.ts";
import { showToast } from "root/islands/toasts.tsx";

export const ResumePipelineModal = ({ audience }: { audience: Audience }) => {
  const pipeline = opModal.value.resumePipeline;

  if (!pipeline) {
    showToast({
      id: audienceKey(audience),
      type: "error",
      message: "Pipeline not found",
    });
    return null;
  }

  const close = () =>
    opModal.value = { ...opModal.value, resumePipeline: null };

  const resume = async () => {
    const response = await fetch(
      `${getAudienceOpRoute(audience)}/pipeline/${pipeline.id}/resume`,
      {
        method: "POST",
      },
    );

    const { success } = await response.json();

    if (success.message) {
      togglePausePipeline(false, audience, pipeline);
      showToast({
        id: audienceKey(audience),
        type: success.status ? "success" : "error",
        message: success.message,
      });
    }

    close();
  };

  return (
    <ActionModal
      icon={<IconPlayerPlay class="w-10 h-10 mt-3 text-burnt" />}
      message={
        <div>
          Resume pipeline{" "}
          <span class="text-medium font-bold ">
            {pipeline.name}
          </span>?
        </div>
      }
      actionText="Resume"
      destructive={false}
      onClose={close}
      onAction={resume}
    />
  );
};
