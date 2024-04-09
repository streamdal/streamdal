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
import { ResumePipelineModal } from "../../components/modals/resumePipelineModal.tsx";
import { AttachPipelineModal } from "../../components/modals/attachPipelineModal.tsx";
import { Audience } from "https://deno.land/x/streamdal_protos@v0.0.126/protos/sp_common.ts";
import { TailRateModal } from "../../components/modals/tailRateModal.tsx";
import { useEffect } from "preact/hooks";
import { initFlowBite } from "../../components/flowbite/init.tsx";
import { OP_MODAL_WIDTH } from "root/lib/const.ts";
import { tailEnabledSignal } from "root/components/tail/signals.ts";
import { Tail } from "root/islands/drawer/tail.tsx";

const EmptyDrawer = () => (
  <div class="h-full bg-white">
    <div class="min-h-screen bg-white">
      <div class="flex h-screen w-full flex-col items-center justify-center">
        <EmptyStateBird class="mb-2" />
        <h2 class="text-[#8E84AD]">No Items Selected</h2>
      </div>
    </div>
  </div>
);

export const DrawerContents = ({
  serviceMap,
}: {
  serviceMap: ServiceSignal;
}) => {
  switch (opModal.value?.displayType) {
    case "operation":
      return <Operation serviceMap={serviceMap} />;
    case "service":
      return <Service serviceMap={serviceMap} />;
    case "component":
      return <Component />;
    default:
      return null;
  }
};

export const Modals = ({ audience }: { audience?: Audience }) => {
  return audience
    ? (
      <>
        {opModal.value.pausePipeline && audience && (
          <PausePipelineModal audience={audience} />
        )}
        {opModal.value.resumePipeline && (
          <ResumePipelineModal audience={audience} />
        )}
        {opModal.value.detachPipeline && (
          <DetachPipelineModal audience={audience} />
        )}
        {opModal.value.attachPipeline && (
          <AttachPipelineModal
            audience={audience}
            attachPipeline={opModal.value.attachPipeline}
          />
        )}
        {opModal.value.deleteOperation && (
          <DeleteOperationModal audience={audience} />
        )}
        {opModal.value.schemaModal && <SchemaModal />}
        {opModal.value.deleteService && (
          <DeleteServiceModal audience={audience} />
        )}
        {tailEnabledSignal.value && <Tail audience={audience} />}
        {opModal.value.tailRateModal && <TailRateModal />}
      </>
    )
    : null;
};

export const InfoDrawer = ({
  serviceMap,
}: {
  serviceMap: ServiceSignal | null;
}) => {
  const audience = opModal.value?.audience;

  useEffect(() => {
    void initFlowBite();
  }, []);

  return (
    <>
      <Toast id="pipelineCrud" />
      <Modals audience={audience} />
      <div
        class={`fixed right-0 top-0 z-50 flex h-screen flex-row items-start justify-end overflow-y-scroll shadow-xl`}
      >
        <div class={`h-full bg-white w-[${OP_MODAL_WIDTH}]`}>
          {audience && opModal.value?.displayType && serviceMap
            ? <DrawerContents serviceMap={serviceMap} />
            : <EmptyDrawer />}
        </div>
      </div>
    </>
  );
};
