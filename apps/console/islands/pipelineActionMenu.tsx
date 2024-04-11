import { useEffect, useState } from "preact/hooks";
import { Audience } from "streamdal-protos/protos/sp_common.ts";
import IconPlayerPause from "tabler-icons/tsx/player-pause.tsx";
import IconPlayerPlay from "tabler-icons/tsx/player-play.tsx";
import { opModal } from "../components/serviceMap/opModalSignal.ts";
import { Tooltip } from "../components/tooltip/tooltip.tsx";
import { audienceKey } from "../lib/utils.ts";

import { Pipeline } from "streamdal-protos/protos/sp_pipeline.ts";
import { serviceSignal } from "../components/serviceMap/serviceSignal.ts";
import { tailEnabledSignal } from "root/components/tail/signals.ts";

const AttachDetach = (
  { pipeline, attached }: { pipeline: Pipeline; attached: boolean },
) => {
  const [checked, setChecked] = useState(false);

  const toggle = (e: any) => {
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
  const key = audienceKey(audience);
  const p = serviceSignal.value?.configs[key]?.configs?.find((p) =>
    p.id === pipeline.id
  );

  return (
    <div
      class={`p-2 flex flex-row justify-between items-center ${
        p ? "" : "bg-gray-100"
      } hover:bg-purple-100`}
    >
      <div class="flex flex-row justify-start items-center">
        <AttachDetach pipeline={pipeline} attached={!!p} />
        <PauseResume
          pipeline={pipeline}
          attached={!!p}
          paused={!!p?.paused}
        />

        <div
          data-tooltip-target={`pipeline-name-${pipeline.id}`}
          class={"flex flex-row justify-start items-center"}
        >
          <div
            class={`w-[${p ? "195px" : "200px"}] truncate`}
          >
            {pipeline.name}
          </div>
        </div>
        <Tooltip
          targetId={`pipeline-name-${pipeline.id}`}
          message={pipeline.name}
        />
      </div>
      <div class="flex flex-row justify-end items-center ">
        <a
          href={`/pipelines/${pipeline.id}`}
          className="flex items-center"
          f-partial={`/partials/pipelines/${pipeline.id}`}
          data-tooltip-target="pipeline-edit"
          onClick={() => tailEnabledSignal.value = false}
        >
          <img src="/images/edit.svg" className="w-[24px]" />
        </a>
        <Tooltip
          targetId="pipeline-edit"
          message={"Edit Pipeline"}
        />
      </div>
    </div>
  );
};
