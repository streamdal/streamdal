import IconPencil from "tabler-icons/tsx/pencil.tsx";
import IconPlus from "tabler-icons/tsx/plus.tsx";

import { Pipeline } from "snitch-protos/protos/pipeline.ts";
import { Tooltip } from "../components/tooltip/tooltip.tsx";
import PipelineDetail, { newPipeline } from "./pipeline.tsx";
import { SuccessType } from "../routes/_middleware.ts";
import { Toast, toastSignal } from "../components/toasts/toast.tsx";

const Pipelines = (
  { id, pipelines, success, add = false }: {
    id?: string;
    pipelines?: Pipeline[];
    success: SuccessType;
    add?: boolean;
  },
) => {
  //
  // wrapper supports adding a new entry
  const wrapper = [
    ...pipelines,
    ...pipelines.length === 0 || add ? [newPipeline] : [],
  ];

  const index = id && wrapper?.findIndex((p) => p.id === id);
  const selected = add ? wrapper.length - 1 : index > -1 ? index : 0;

  if (success?.message) {
    toastSignal.value = {
      id: "pipeline",
      type: success.status ? "success" : "error",
      message: success.message,
    };
  }

  return (
    <>
      <div
        id="pipelinesModal"
        aria-modal="true"
        class="absolute mt-12 z-40 w-full px-4 py-2 overflow-x-hidden overflow-y-hidden max-h-full justify-center items-center flex"
        role="dialog"
      >
        <div class="relative w-full max-w-5xl shadow-2xl shadow-stormCloud">
          <div class="relative bg-white rounded-lg shadow">
            <div class="flex justify-start">
              <div class="border-r w-1/3 flex flex-col pb-[16px] max-h-[80vh] overflow-y-auto">
                <div class="flex justify-between items-center pt-[26px] pb-[16px] px-[14px]">
                  <div class="text-[16px] font-bold">Pipelines</div>
                  <a href="/pipelines/add">
                    <IconPlus
                      data-tooltip-target="pipeline-add"
                      class="w-5 h-5 cursor-pointer"
                    />
                  </a>
                  <Tooltip
                    targetId="pipeline-add"
                    message="Add a new pipeline"
                  />
                </div>
                {wrapper?.map((p: Pipeline, i: number) => (
                  <a href={`/pipelines/${p.id}`}>
                    <div
                      class={`flex flex-row items-center justify-between py-[14px] pl-[30px] pr-[12px] ${
                        i === selected && "bg-sunset"
                      } cursor-pointer hover:bg-sunset`}
                    >
                      {p.name}
                      {selected === i &&
                        <IconPencil class="w-4 h-4 text-web" />}
                    </div>
                  </a>
                ))}
              </div>
              <div class="w-full max-h-[80vh] overflow-y-auto">
                <PipelineDetail
                  pipeline={wrapper[selected]}
                  success={success}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toast id="pipeline" />
    </>
  );
};

export default Pipelines;
