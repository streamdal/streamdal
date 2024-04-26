import { opModal } from "root/components/serviceMap/opModalSignal.ts";
import { AttachPipelineModal } from "root/components/modals/attachPipelineModal.tsx";
import { DeleteOperationModal } from "root/components/modals/deleteOperationModal.tsx";
import { DeleteServiceModal } from "root/components/modals/deleteServiceModal.tsx";
import { DetachPipelineModal } from "root/components/modals/detachPipelineModal.tsx";
import { PausePipelineModal } from "root/components/modals/pausePipelineModal.tsx";
import { ResumePipelineModal } from "root/components/modals/resumePipelineModal.tsx";
import { TailRateModal } from "root/components/modals/tailRateModal.tsx";

export const Modals = () => {
  const audience = opModal.value?.audience;

  return audience
    ? (
      <div className="fixed top-[10%] left-[30%] z-50">
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
        {opModal.value.deleteService && (
          <DeleteServiceModal audience={audience} />
        )}
        {opModal.value.tailRateModal && <TailRateModal />}
      </div>
    )
    : null;
};
