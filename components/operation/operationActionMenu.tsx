import { opModal } from "../serviceMap/opModalSignal.ts";
import IconPlayerPause from "tabler-icons/tsx/player-pause.tsx";
import { Tooltip } from "../tooltip/tooltip.tsx";
import IconUnlink from "tabler-icons/tsx/unlink.tsx";
import IconAdjustmentsHorizontal from "tabler-icons/tsx/adjustments-horizontal.tsx";

export const OperationActionMenu = () => {
  return (
    <div class="py-1 flex flex-row items-center">
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
        message={"Click to pause pipelines"}
      />
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
        message={"Click to detach pipeline"}
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
