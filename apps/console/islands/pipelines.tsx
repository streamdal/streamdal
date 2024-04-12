import IconPencil from "tabler-icons/tsx/pencil.tsx";
import IconPlus from "tabler-icons/tsx/plus.tsx";

import { Pipeline } from "streamdal-protos/protos/sp_pipeline.ts";
import { Tooltip } from "../components/tooltip/tooltip.tsx";
import PipelineDetail from "./pipeline.tsx";
import { SuccessType } from "../routes/_middleware.ts";
import { Toast, toastSignal } from "../components/toasts/toast.tsx";
import { OP_MODAL_WIDTH } from "root/lib/const.ts";
import { NotificationConfig } from "streamdal-protos/protos/sp_notify.ts";
import { useEffect } from "preact/hooks";
import { initFlowBite } from "../components/flowbite/init.tsx";
import { newPipeline } from "root/components/pipeline/pipeline.ts";

const Pipelines = (
  { id, pipelines, notifications, success, add = false }: {
    id?: string;
    pipelines?: Pipeline[];
    notifications: NotificationConfig[];
    success?: SuccessType;
    add?: boolean;
  },
) => {
  //
  // wrapper supports adding a new entry
  const wrapper = [
    ...pipelines ? pipelines : [],
    ...pipelines?.length === 0 || add ? [newPipeline] : [],
  ];

  const index = id ? wrapper?.findIndex((p) => p.id === id) : 0;
  const selected = add ? wrapper.length - 1 : index > -1 ? index : 0;

  if (success?.message) {
    toastSignal.value = {
      id: "pipeline",
      type: success.status ? "success" : "error",
      message: success.message,
    };
  }

  useEffect(() => {
    void initFlowBite();
  }, []);

  return (
    <>
      <div
        className={`relative flex flex-col h-screen w-full mr-[${OP_MODAL_WIDTH}]`}
      >
        <div className="h-46 w-full bg-streamdalPurple p-4 text-white font-semibold text-sm">
          <span className="opacity-50">Home</span> / Manage Pipelines
        </div>
        <div class="relative bg-white h-full">
          <div class="flex justify-start h-full">
            <div class="border-r w-1/3 flex flex-col pb-[16px] overflow-y-auto">
              <div class="flex justify-between items-center pt-[26px] pb-[16px] px-[14px]">
                <div class="text-[16px] font-bold">Pipelines</div>
                <a
                  href="/pipelines/add"
                  f-partial="/partials/pipelines/add"
                  data-tooltip-target="pipeline-add"
                >
                  <img src="/images/plus.svg" class="w-[20px]" />
                </a>
                <Tooltip
                  targetId="pipeline-add"
                  message="Add a new pipeline"
                />
              </div>
              {wrapper?.map((p: Pipeline, i: number) => (
                <a
                  href={`/pipelines/${p.id}`}
                  f-partial={`/partials/pipelines/${p.id}`}
                >
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
            <div class="w-full max-h-[88vh] overflow-y-auto">
              <PipelineDetail
                pipeline={wrapper[selected]}
                notifications={notifications}
              />
            </div>
          </div>
        </div>
      </div>
      <Toast id="pipeline" />
    </>
  );
};

export default Pipelines;
