import { ConsumerIcon } from "../components/icons/consumer.tsx";
import { ProducerIcon } from "../components/icons/producer.tsx";
import IconPlus from "tabler-icons/tsx/plus.tsx";
import IconUnlink from "tabler-icons/tsx/unlink.tsx";
import IconAdjustmentsHorizontal from "tabler-icons/tsx/adjustments-horizontal.tsx";
import { ServiceMapType } from "../lib/fetch.ts";
import { opModal } from "../components/serviceMap/opModalSignal.ts";
import { OperationType } from "streamdal-protos/protos/sp_common.ts";
import IconLink from "tabler-icons/tsx/link.tsx";
import IconPlayerPause from "tabler-icons/tsx/player-pause.tsx";
import { Toast } from "../components/toasts/toast.tsx";
import { Tooltip } from "../components/tooltip/tooltip.tsx";
import { PausePipelineModal } from "../components/modals/pausePipelineModal.tsx";
import { DetachPipelineModal } from "../components/modals/detachPipelineModal.tsx";
import { OddAttachModal } from "../components/modals/oddAttachModal.tsx";
import { EmptyStateBird } from "../components/icons/emptyStateBird.tsx";
import { useEffect, useState } from "preact/hooks";
import { DeleteOperationModal } from "../components/modals/deleteOperationModal.tsx";
import {
  Tail,
  tailEnabledSignal,
  tailSamplingRateSignal,
  tailSamplingSignal,
  tailSignal,
} from "./tail.tsx";
import { Toggle } from "../components/form/switch.tsx";
import { getAudienceOpRoute, isNumeric } from "../lib/utils.ts";
import IconTrash from "tabler-icons/tsx/trash.tsx";
import hljs from "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/es/highlight.min.js";
import IconWindowMaximize from "tabler-icons/tsx/window-maximize.tsx";
import { SchemaModal } from "../components/modals/schemaModal.tsx";
import { ComponentImage } from "./customNodes.tsx";
import { useSignalEffect } from "@preact/signals";
import { initFlowbite } from "flowbite";

import { BetaTag, ComingSoonTag } from "../components/icons/featureTags.tsx";
import { OperationOpModalInfo } from "./operationOpModal.tsx";
import { DeleteServiceModal } from "../components/modals/deleteServiceModal.tsx";
export const OP_MODAL_WIDTH = "308px";

export default function OpModal(
  { serviceMap }: { serviceMap: ServiceMapType },
) {
  const displayType = opModal.value?.displayType;
  const itemName = () => {
    switch (displayType) {
      case "operation":
        return opModal.value?.audience?.operationName;
      case "service":
        return opModal.value?.audience?.serviceName;
      case "component":
        return opModal.value?.audience.componentName;
    }
  };

  const iconDisplay = () => {
    if (displayType === "operation") {
      return opType === "CONSUMER"
        ? <ConsumerIcon className={"mx-2"} />
        : <ProducerIcon className={"mx-2"} />;
    }
    if (displayType === "component") {
      return (
        <ComponentImage componentName={displayName} className={"w-6 mx-2"} />
      );
    }
    return (
      <img
        src={"/images/placeholder-icon.png"}
        className={"w-7 mx-2"}
      />
    );
  };

  const audience = opModal.value?.audience;
  const attachedPipeline = opModal.value?.attachedPipeline;
  const clients = opModal.value?.clients;
  const opType = OperationType[audience?.operationType];
  const displayName = itemName();

  const [tailNavOpen, setTailNavOpen] = useState(false);
  const [schemaNavOpen, setSchemaNavOpen] = useState(false);
  const [schemaModalOpen, setSchemaModalOpen] = useState(false);

  const getSchema = async () => {
    const response = await fetch(`${getAudienceOpRoute(audience)}/schema`, {
      method: "GET",
    });
    return response.json();
  };

  const handleClose = () => {
    setSchemaModalOpen(false);
  };

  useSignalEffect(() => {
    if (tailEnabledSignal.value === false) {
      tailSignal.value = {};
    }
  });

  useEffect(async () => {
    //
    // Flowbite breaks on audience change for some reason
    initFlowbite();
    if (opModal.value) {
      const schema = await getSchema();
      opModal.value = {
        ...opModal.value,
        schemaInfo: {
          schema: JSON.stringify(schema.schema, null, 2),
          version: schema.version,
        },
      };
    }
  }, [audience, schemaNavOpen]);

  return (
    <>
      {opModal.value?.pause && (
        <PausePipelineModal
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
      {schemaModalOpen && (
        <SchemaModal
          schema={opModal.value.schemaInfo.schema}
          version={opModal.value.schemaInfo.version}
          setClose={handleClose}
        />
      )}
      {opModal.value?.deleteService && (
        <DeleteServiceModal audience={audience} />
      )}
      <div class="flex flex-row">
        {tailEnabledSignal.value && <Tail audience={audience} />}
        <div
          class={`fixed z-50 h-screen top-0 right-0 transition-transform ${`translate-x-full right-[${OP_MODAL_WIDTH}]`} flex flex-row justify-end items-start overflow-y-scroll`}
        >
          <div class="w-[308px] shadow-xl h-full">
            <div class="bg-white min-h-screen">
              {opModal.value == null
                ? (
                  <div class="w-full h-screen flex flex-col justify-center items-center">
                    <EmptyStateBird class="mb-2" />
                    <h2 class="text-[#8E84AD]">No Items Selected</h2>
                  </div>
                )
                : (
                  <div
                    class={"flex flex-col justify-between"}
                  >
                    <div>
                      <div class="rounded-t flex justify-between">
                        <div class="z-[20] flex items-center justify-start px-4 w-full h-16 bg-web">
                          {iconDisplay()}
                          <div class="flex flex-col">
                            <h3 class="text-lg text-cloud">
                              {displayName}
                            </h3>
                          </div>
                        </div>
                      </div>
                      {displayType === "operation"
                        ? (
                          <OperationOpModalInfo
                            serviceMap={serviceMap}
                            attachedPipeline={attachedPipeline}
                            setSchemaModalOpen={setSchemaModalOpen}
                            schemaModalOpen={schemaModalOpen}
                            setTailNavOpen={setTailNavOpen}
                            tailNavOpen={tailNavOpen}
                            clients={clients}
                          />
                        )
                        : (
                          <>
                            <h3 id="collapse-heading-10">
                              <button
                                type="button"
                                className="flex items-center border-b border-purple-100 w-full py-3 font-medium text-left text-gray-500 focus:ring-2"
                                data-accordion-target="#collapse-body-3"
                                aria-expanded="true"
                                aria-controls="collapse-body-10"
                              >
                                <h3 class="text-web text-sm font-semibold ml-10">
                                  Metrics
                                </h3>
                              </button>
                            </h3>
                            <div
                              id="collapse-body-10"
                              aria-labelledby="collapse-heading-10"
                            >
                              <div class="p-5">
                                <p class="text-gray-300 text-xs">
                                  Metrics coming soon...
                                </p>
                              </div>
                            </div>
                          </>
                        )}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
      <Toast id="pipelineCrud" />
    </>
  );
}
