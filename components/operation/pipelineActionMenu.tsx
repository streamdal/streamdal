import { opModal } from "../serviceMap/opModalSignal.ts";
import IconPlayerPause from "tabler-icons/tsx/player-pause.tsx";
import IconPlayerPlay from "tabler-icons/tsx/player-play.tsx";
import { Tooltip } from "../tooltip/tooltip.tsx";
import IconAdjustmentsHorizontal from "tabler-icons/tsx/adjustments-horizontal.tsx";
import { Audience } from "streamdal-protos/protos/sp_common.ts";
import { audienceKey } from "../../lib/utils.ts";
import { useEffect, useState } from "preact/hooks";
import { initFlowbite } from "flowbite";
import Pipeline from "../../islands/pipeline.tsx";
import { serviceSignal } from "../serviceMap/serviceSignal.ts";

const AttachDetach = (
  { pipeline, attached }: { pipeline: Pipeline; attached: boolean },
) => {
  const [checked, setChecked] = useState(false);

  const toggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    opModal.value = {
      ...opModal.value,
      ...attached ? { detachPipeline: pipeline } : { attachPipeline: pipeline },
    };
  };

  useEffect(() => {
    setChecked(attached);
  }, [attached]);

  useEffect(() => {
    setChecked(attached);
  }, [confirm]);

  return (
    <div
      data-tooltip-target={`attach-detach-pipeline-${pipeline.id}`}
      class="flex flex-row items-center"
      onClick={toggle}
    >
      <input
        type="checkbox"
        className={`w-4 h-4 rounded border mx-2 checkmark-streamdal border-streamdalPurple appearance-none checked:bg-streamdalPurple flex justify-center items-center`}
        checked={checked}
      />
      <Tooltip
        targetId={`attach-detach-pipeline-${pipeline.id}`}
        message={`${attached ? "Detach" : "Attach"} pipeline`}
      />
    </div>
  );
};

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
    <div
      class={`p-2 flex flex-row justify-between items-center hover:bg-purple-100`}
    >
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
