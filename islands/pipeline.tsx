import IconChevronDown from "https://deno.land/x/tabler_icons_tsx@0.0.3/tsx/chevron-down.tsx";
import IconChevronUp from "https://deno.land/x/tabler_icons_tsx@0.0.3/tsx/chevron-up.tsx";
import IconGripVertical from "https://deno.land/x/tabler_icons_tsx@0.0.3/tsx/grip-vertical.tsx";
import { useState } from "preact/hooks";
import { Pipeline, PipelineStep } from "snitch-protos/protos/pipeline.ts";
import { StepMenu } from "../components/pipeline/stepMenu.tsx";

const PipelineDetail = ({ pipeline }: { pipeline: Pipeline }) => {
  const [open, setOpen] = useState(new Array());
  return (
    <div class="p-6 flex flex-col">
      <div class="flex flex-row items-center mb-6">
        <div class="text-[16px] font-semibold mr-2">
          Steps
        </div>
        <div class="text-[14px] font-medium text-stormCloud">
          {pipeline?.steps?.length || 0}
        </div>
      </div>
      {pipeline?.steps?.map((
        step: PipelineStep,
        i: number,
      ) => (
        <div class="flex flex-row items-start mb-6">
          <div class="text-[16px] font-medium text-twilight mr-6 mt-4">
            {i + 1}
          </div>
          <div class="rounded-md border border-twilight w-full">
            <div class="flex flex-row w-full justify-between px-[9px] py-[13px]">
              <div class="flex flex-row">
                <div class="mr-2">
                  <IconGripVertical class="w-6 h-6 text-twilight cursor-pointer" />
                </div>
                <div class="text-[16px] font-medium mr-2">
                  {step.name}
                </div>
                <StepMenu
                  onDelete={() => console.log("delete coming soon...")}
                />
              </div>
              {open.includes(i)
                ? (
                  <IconChevronUp
                    class="w-6 h-6 text-twilight cursor-pointer"
                    onClick={() => setOpen(open.filter((o: number) => o !== i))}
                  />
                )
                : (
                  <IconChevronDown
                    class="w-6 h-6 text-twilight cursor-pointer"
                    onClick={() => setOpen([...open, i])}
                  />
                )}
            </div>
            {open.includes(i)
              ? (
                <div class="border-t p-[13px]">
                  ...step details coming soon...
                </div>
              )
              : null}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PipelineDetail;
