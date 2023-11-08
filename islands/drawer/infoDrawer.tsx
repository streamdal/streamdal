import { ServiceSignal } from "../../components/serviceMap/serviceSignal.ts";
import { opModal } from "../../components/serviceMap/opModalSignal.ts";
import { EmptyStateBird } from "../../components/icons/emptyStateBird.tsx";
import Operation from "./operation.tsx";
import Service from "./service.tsx";
import Component from "./component.tsx";
import { Toast } from "../../components/toasts/toast.tsx";
import { PausePipelineModal } from "../../components/modals/pausePipelineModal.tsx";
import { DetachPipelineModal } from "../../components/modals/detachPipelineModal.tsx";
import { DeleteOperationModal } from "../../components/modals/deleteOperationModal.tsx";
import { SchemaModal } from "../../components/modals/schemaModal.tsx";
import { DeleteServiceModal } from "../../components/modals/deleteServiceModal.tsx";
import { Tail, tailEnabledSignal } from "./tail.tsx";
import { useEffect } from "preact/hooks";
import { initFlowbite } from "flowbite";
import { ResumePipelineModal } from "../../components/modals/resumePipelineModal.tsx";

export const OP_MODAL_WIDTH = "308px";

const EmptyDrawer = () => (
  <div
    class={`fixed z-50 h-screen top-0 right-0 transition-transform ${`translate-x-full right-[${OP_MODAL_WIDTH}]`} flex flex-row justify-end items-start overflow-y-scroll`}
  >
    <div class="w-[308px] shadow-xl h-full bg-white">
      <div class="bg-white min-h-screen">
        <div class="w-full h-screen flex flex-col justify-center items-center">
          <EmptyStateBird class="mb-2" />
          <h2 class="text-[#8E84AD]">No Items Selected</h2>
        </div>
      </div>
    </div>
  </div>
);

export const DrawerContents = (
  { serviceMap }: { serviceMap: ServiceSignal },
) => {
  switch (opModal.value?.displayType) {
    case "operation":
      return <Operation serviceMap={serviceMap} />;
    case "service":
      return <Service serviceMap={serviceMap} />;
    case "component":
      return <Component />;
    default:
      return <EmptyDrawer />;
  }
};

export const InfoDrawer = ({ serviceMap }: { serviceMap: ServiceSignal }) => {
  const audience = opModal.value?.audience;
  const attachedPipeline = opModal.value?.attachedPipeline;

  useEffect(() => {
    //
    // Flowbite breaks on audience change for some reason
    initFlowbite();
  }, [audience]);

  return (
    <>
      <Toast id="pipelineCrud" />
      {opModal.value?.pause && (
        <PausePipelineModal
          audience={audience}
          pipeline={attachedPipeline}
        />
      )}
      {opModal.value?.resume && (
        <ResumePipelineModal
          audience={audience}
          pipeline={attachedPipeline}
        />
      )}
      {opModal.value?.detach && (
        <DetachPipelineModal
          audience={audience}
          pipeline={attachedPipeline}
        />
      )}
      {opModal.value?.delete && (
        <DeleteOperationModal
          audience={audience}
          pipeline={attachedPipeline || null}
        />
      )}
      {opModal.value?.schemaModal && <SchemaModal />}
      {opModal.value?.deleteService && (
        <DeleteServiceModal audience={audience} />
      )}
      {tailEnabledSignal.value && <Tail audience={audience} />}
      <div
        class={`fixed z-50 h-screen top-0 right-0 transition-transform ${`translate-x-full right-[${OP_MODAL_WIDTH}]`} flex flex-row justify-end items-start overflow-y-scroll`}
      >
        <div class="w-[308px] shadow-xl h-full bg-white">
          {<DrawerContents serviceMap={serviceMap} />}
        </div>
      </div>
    </>
  );
};
