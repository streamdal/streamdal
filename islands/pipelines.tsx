import IconPencil from "tabler-icons/tsx/pencil.tsx";
import IconPlus from "tabler-icons/tsx/plus.tsx";
import { useState } from "https://esm.sh/stable/preact@10.15.1/denonext/hooks.js";
import { Pipeline } from "snitch-protos/protos/pipeline.ts";
import { Tooltip } from "../components/tooltip/tooltip.tsx";
import PipelineDetail from "./pipeline.tsx";

const Pipelines = ({ pipelines }: { pipelines?: Pipeline[] }) => {
  const [selected, setSelected] = useState(0);
  return (
    <div
      id="defaultModal"
      aria-modal="true"
      class="fixed top-0 left-0 right-0 z-50 w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-rem)] max-h-full justify-center items-center flex"
      role="dialog"
    >
      <div class="relative w-full max-w-5xl max-h-full">
        <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
          <div class="flex justify-start">
            <div class="border-r w-1/3 flex flex-col pb-[16px]">
              <div class="flex justify-between items-center pt-[26px] pb-[16px] px-[14px]">
                <div class="text-[16px] font-bold">Pipelines</div>
                <IconPlus
                  data-tooltip-target="pipeline-add"
                  class="w-5 h-5 cursor-pointer"
                />
                <Tooltip targetId="pipeline-add" message="Add a new pipeline" />
              </div>
              {pipelines?.map((p: Pipeline, i: number) => (
                <div
                  class={`flex flex-row items-center justify-between py-[14px] pl-[30px] pr-[12px] ${
                    i === selected && "bg-sunset"
                  } cursor-pointer`}
                >
                  <div
                    onClick={() => setSelected(i)}
                  >
                    {p.name}
                  </div>
                  {selected === i && <IconPencil class="w-4 h-4 text-web" />}
                </div>
              ))}
            </div>
            <div class="w-full">
              {pipelines && pipelines[selected] && (
                <PipelineDetail pipeline={pipelines[selected]} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pipelines;
