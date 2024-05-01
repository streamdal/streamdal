import { AttachPipelineModal } from "./attachPipelineModal.tsx";
import { DeleteOperationModal } from "./deleteOperationModal.tsx";
import { DeleteServiceModal } from "./deleteServiceModal.tsx";
import { DetachPipelineModal } from "./detachPipelineModal.tsx";
import { PausePipelineModal } from "./pausePipelineModal.tsx";
import { ResumePipelineModal } from "./resumePipelineModal.tsx";
import { TailRateModal } from "root/components/modals/tailRateModal.tsx";
import { opModal } from "root/components/serviceMap/opModalSignal.ts";

export const ServiceModals = () => {
  const audience = opModal.value?.audience;

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
        {opModal.value.deleteService && (
          <DeleteServiceModal audience={audience} />
        )}
        {opModal.value.tailRateModal && <TailRateModal />}
      </>
    )
    : null;
};
