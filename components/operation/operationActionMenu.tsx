import { opModal } from "../serviceMap/opModalSignal.ts";
import IconPlayerPause from "tabler-icons/tsx/player-pause.tsx";
import IconPlayerPlay from "tabler-icons/tsx/player-play.tsx";
import { Tooltip } from "../tooltip/tooltip.tsx";
import IconUnlink from "tabler-icons/tsx/unlink.tsx";
import IconAdjustmentsHorizontal from "tabler-icons/tsx/adjustments-horizontal.tsx";
import { Audience } from "streamdal-protos/protos/sp_common.ts";
import { Pipeline } from "streamdal-protos/protos/sp_pipeline.ts";
import { audienceKey } from "../../lib/utils.ts";
import { computed } from "@preact/signals";
import { serviceSignal } from "../serviceMap/serviceSignal.ts";

export const OperationActionMenu = (
  { audience, attachedPipeline }: {
    audience: Audience;
    attachedPipeline: Pipeline;
  },
) => {
  const paused = serviceSignal.value?.pipelines[attachedPipeline.id]?.paused
    ?.some((
      a: Audience,
    ) => audienceKey(a) === audienceKey(audience));

  return (
    <div class="py-1 flex flex-row items-center">
      {paused
        ? (
          <>
            <button
              data-tooltip-target="pipeline-resume"
              type="button"
              onClick={() =>
                opModal.value = {
                  ...opModal.value,
                  resume: true,
                }}
              className="mr-2"
            >
              <IconPlayerPlay class="w-4 h-4 text-gray-400" />
            </button>
            <Tooltip
              targetId="pipeline-resume"
              message={"Resume pipeline"}
            />
          </>
        )
        : (
          <>
            <button
              data-tooltip-target="pipeline-pause"
              type="button"
              onClick={() =>
                opModal.value = {
                  ...opModal.value,
                  pause: true,
                }}
              className="mr-2"
            >
              <IconPlayerPause class="w-4 h-4 text-gray-400" />
            </button>
            <Tooltip
              targetId="pipeline-pause"
              message={"Pause pipeline"}
            />
          </>
        )}
      <button
        data-tooltip-target="pipeline-unlink"
        type="button"
        className="mr-2"
        onClick={() =>
          opModal.value = {
            ...opModal.value,
            detach: true,
          }}
      >
        <IconUnlink class="w-4 h-4 text-gray-400" />
      </button>
      <Tooltip
        targetId="pipeline-unlink"
        message={"Detach pipeline"}
      />
      <a
        href={"/pipelines"}
        className="flex items-center"
      >
        <button
          type="button"
          data-tooltip-target="pipeline-edit"
        >
          <IconAdjustmentsHorizontal class="w-4 h-4 text-gray-400" />
        </button>
        <Tooltip
          targetId="pipeline-edit"
          message={"Edit Pipelines"}
        />
      </a>
    </div>
  );
};
