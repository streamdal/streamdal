import IconPencil from "tabler-icons/tsx/pencil.tsx";
import IconPlus from "tabler-icons/tsx/plus.tsx";
import { useState } from "https://esm.sh/stable/preact@10.15.1/denonext/hooks.js";
import { Pipeline } from "snitch-protos/protos/pipeline.ts";
import { Tooltip } from "../components/tooltip/tooltip.tsx";
import PipelineDetail, { newPipeline } from "./pipeline.tsx";
import { SuccessType } from "../routes/pipelines/[id]/delete.tsx";

const Pipelines = (
  { id, pipelines, success }: {
    id?: string;
    pipelines?: Pipeline[];
    success: SuccessType;
  },
) => {
  //
  // wrapper for adding
  const [wrapper, setWrapper] = useState(
    pipelines.length > 0 ? pipelines : [newPipeline],
  );
  const index = id && wrapper?.findIndex((p) => p.id === id);
  const [selected, setSelected] = useState(index > -1 ? index : 0);

  const add = () => {
    setWrapper([...wrapper, newPipeline]);
    setSelected(wrapper.length);
  };

  return (
    <div
      id="pipelinesModal"
      aria-modal="true"
      class="fixed top-0 left-0 right-0 z-50 w-full p-4 inset-0 max-h-full justify-center items-center flex"
      role="dialog"
    >
      <div class="relative w-full max-w-5xl">
        <div class="relative bg-white rounded-lg shadow">
          <div class="flex justify-start">
            <div class="border-r w-1/3 flex flex-col pb-[16px] max-h-[80vh] overflow-y-auto">
              <div class="flex justify-between items-center pt-[26px] pb-[16px] px-[14px]">
                <div class="text-[16px] font-bold">Pipelines</div>
                <IconPlus
                  data-tooltip-target="pipeline-add"
                  class="w-5 h-5 cursor-pointer"
                  onClick={add}
                />
                <Tooltip targetId="pipeline-add" message="Add a new pipeline" />
              </div>
              {wrapper?.map((p: Pipeline, i: number) => (
                <div
                  class={`flex flex-row items-center justify-between py-[14px] pl-[30px] pr-[12px] ${
                    i === selected && "bg-sunset"
                  } cursor-pointer hover:bg-sunset`}
                  onClick={() => setSelected(i)}
                >
                  {p.name}
                  {selected === i && <IconPencil class="w-4 h-4 text-web" />}
                </div>
              ))}
            </div>
            <div class="w-full max-h-[80vh] overflow-y-auto">
              <PipelineDetail pipeline={wrapper[selected]} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pipelines;
