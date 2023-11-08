import { opModal } from "../serviceMap/opModalSignal.ts";
import IconPlayerPause from "tabler-icons/tsx/player-pause.tsx";
import IconPlayerPlay from "tabler-icons/tsx/player-play.tsx";
import { Tooltip } from "../tooltip/tooltip.tsx";
import IconUnlink from "tabler-icons/tsx/unlink.tsx";
import IconAdjustmentsHorizontal from "tabler-icons/tsx/adjustments-horizontal.tsx";
import { Audience } from "streamdal-protos/protos/sp_common.ts";
import { audienceKey } from "../../lib/utils.ts";
import IconLink from "tabler-icons/tsx/link.tsx";
import { useEffect } from "preact/hooks";
import { initFlowbite } from "flowbite";
import Pipeline from "../../islands/pipeline.tsx";
import { serviceSignal } from "../serviceMap/serviceSignal.ts";

const AttachDetach = (
  { pipeline, attached }: { pipeline: Pipeline; attached: boolean },
) =>
  attached
    ? (
      <>
        <button
          data-tooltip-target="pipeline-unlink"
          type="button"
          className="mr-2"
          onClick={() =>
            opModal.value = {
              ...opModal.value,
              detachPipeline: pipeline,
            }}
        >
          <IconUnlink class="w-4 h-4 text-gray-400" />
        </button>
        <Tooltip
          targetId="pipeline-unlink"
          message={"Detach pipeline"}
        />
      </>
    )
    : (
      <>
        <button
          data-tooltip-target="pipeline-link"
          type="button"
          className="mr-2"
          onClick={() =>
            opModal.value = {
              ...opModal.value,
              attachPipeline: pipeline,
            }}
        >
          <IconLink class="w-4 h-4 text-gray-400" />
        </button>
        <Tooltip
          targetId="pipeline-link"
          message={"Attach pipeline"}
        />
      </>
    );

const PauseResume = (
  { pipeline, attached, paused }: {
    pipeline: Pipeline;
    attached: boolean;
    paused: boolean;
  },
) =>
  !attached ? null : paused
    ? (
      <>
        <button
          data-tooltip-target="pipeline-resume"
          type="button"
          onClick={() =>
            opModal.value = {
              ...opModal.value,
              resumePipeline: pipeline,
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
              pausePipeline: pipeline,
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
    );

export const PipelineActionMenu = (
  { audience, pipeline }: {
    audience: Audience;
    pipeline: Pipeline;
  },
) => {
  const attached = serviceSignal.value?.pipelines[pipeline.id].audiences?.some((
    a: Audience,
  ) => audienceKey(a) === audienceKey(audience));

  const paused = serviceSignal.value?.pipelines[pipeline.id].paused?.some((
    a: Audience,
  ) => audienceKey(a) === audienceKey(audience));

  useEffect(() => {
    //
    // Flowbite breaks on audience change for some reason
    initFlowbite();
  }, [attached, paused]);

  return (
    <div class="p-2 flex flex-row justify-between items-center hover:bg-purple-100">
      <div class="flex flex-row justify-start items-center">
        <AttachDetach pipeline={pipeline} attached={attached} />
        <PauseResume
          pipeline={pipeline}
          attached={attached}
          paused={paused}
        />

        <div
          class={`max-w-[${
            attached ? "150px" : "190px"
          }] flex flex-row justify-start items-center whitespace-nowrap text-ellipsis overflow-hidden`}
        >
          {pipeline.name}
        </div>
      </div>
      <div class="flex flex-row justify-end items-center ">
        <a
          href={`/pipelines/${pipeline.id}`}
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
            message={"Edit Pipeline"}
          />
        </a>
      </div>
    </div>
  );
};
