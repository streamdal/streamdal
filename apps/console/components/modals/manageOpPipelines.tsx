import { PipelineInfo } from "streamdal-protos/protos/sp_info.ts";
import IconPlus from "tabler-icons/tsx/plus.tsx";
import { opModal } from "../serviceMap/opModalSignal.ts";
import { PipelineActionMenu } from "../../islands/pipelineActionMenu.tsx";
import { tailEnabledSignal } from "root/components/tail/signals.ts";

export const ManageOpPipelines = (
  { pipelines }: { pipelines: PipelineInfo[] },
) => {
  const audience = opModal.value.audience;
  const sorted = pipelines.sort((a, b) =>
    (a.pipeline?.name || "").localeCompare(b.pipeline?.name || "")
  );

  return (
    audience
      ? (
        <div class="w-full bg-purple-50 divide-gray-100 max-h-[260px] overflow-auto rounded">
          <ul
            class="text-sm text-gray-700 divide-y"
            aria-labelledby="dropdownDefaultButton"
          >
            {sorted.map(({ pipeline }: PipelineInfo) => (
              pipeline
                ? (
                  <PipelineActionMenu
                    audience={audience}
                    pipeline={pipeline}
                  />
                )
                : null
            ))}
            <div class="flex items-center justify-center hover:bg-purple-100 py-3">
              <a
                href="/pipelines/add"
                onClick={() => tailEnabledSignal.value = false}
              >
                <div
                  class={"flex justify-between items-center text-streamdalPurple font-semibold"}
                >
                  <p class={"text-xs text-streamdalPurple font-semibold"}>
                    Create new pipeline
                  </p>
                  <IconPlus class={"w-3 h-3 ml-3"} />
                </div>
              </a>
            </div>
          </ul>
        </div>
      )
      : null
  );
};
