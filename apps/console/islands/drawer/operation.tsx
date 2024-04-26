import { useSignalEffect } from "@preact/signals";
import { useState } from "preact/hooks";
import { tailSamplingSignal } from "root/components/tail/signals.ts";
import { SchemaNav } from "root/islands/drawer/schemaNav.tsx";
import { Audience, OperationType } from "streamdal-protos/protos/sp_common.ts";
import IconEdit from "tabler-icons/tsx/edit.tsx";
import { ConsumerIcon } from "../../components/icons/consumer.tsx";
import { BetaTag, ComingSoonTag } from "../../components/icons/featureTags.tsx";
import { ProducerIcon } from "../../components/icons/producer.tsx";
import { ManageOpPipelines } from "../../components/modals/manageOpPipelines.tsx";
import { opModal } from "../../components/serviceMap/opModalSignal.ts";
import {
  ServiceSignal,
  serviceSignal,
} from "../../components/serviceMap/serviceSignal.ts";
import { tailRunningSignal } from "../../components/tail/signals.ts";
import { Tooltip } from "../../components/tooltip/tooltip.tsx";
import { audienceKey } from "../../lib/utils.ts";

export default function Operation(
  { serviceMap, audience }: { serviceMap: ServiceSignal; audience: Audience },
) {
  const [managePipelines, setManagePipelines] = useState(true);
  const [tailNavOpen, setTailNavOpen] = useState(true);
  const [schemaNavOpen, setSchemaNavOpen] = useState(true);
  const [pipelines, setPipelines] = useState(
    Object.values(serviceMap?.pipelines),
  );
  const [clients, setClients] = useState(opModal.value.clients);
  const key = audienceKey(audience);

  useSignalEffect(() => {
    if (serviceSignal.value?.streamingUpdate) {
      setPipelines(Object.values(serviceSignal.value.pipelines));
      setClients(serviceSignal.value.liveAudiences?.get(key)?.length || 0);
    }
  });

  return (
    audience
      ? (
        <>
          <div class="rounded-t flex justify-between">
            <div class="z-[20] flex items-center justify-start px-4 w-full h-16 bg-web">
              {Number(audience.operationType) === OperationType.CONSUMER
                ? <ConsumerIcon />
                : <ProducerIcon />}
              <div class="flex flex-col">
                <h3 class="text-lg text-cloud mx-2">
                  {audience.operationName}
                </h3>
              </div>
            </div>
          </div>
          <div
            data-accordion="open"
            data-active-classes="bg-sunset text-blue-600"
          >
            <h3 id="collapse-heading-1">
              <button
                className="flex items-center w-full border-b border-violet-100 py-3 font-medium text-left text-web focus:ring-2"
                onClick={() => setManagePipelines(!managePipelines)}
                data-accordion-target="#collapse-body-1"
                aria-expanded="true"
                aria-controls="collapse-body-1"
              >
                <h3
                  className={"text-web text-sm font-semibold ml-3"}
                >
                  Pipelines
                </h3>
                <BetaTag class={"ml-2"} />
              </button>
            </h3>
            <div
              id="collapse-body-1"
              class={`p-2 border-b border-violet-100 ${
                managePipelines ? "" : "hidden"
              }`}
              aria-labelledby="collapse-heading-1"
            >
              <ManageOpPipelines pipelines={pipelines} />
            </div>
            <h3 id="collapse-heading-2">
              <button
                type="button"
                className={`flex items-center w-full border-y border-violet-100 py-3 font-medium text-left text-web`}
                data-accordion-target="#collapse-body-2"
                aria-expanded="true"
                aria-controls="collapse-body-2"
                onClick={() => setTailNavOpen(!tailNavOpen)}
              >
                <h3 class="text-sm font-semibold ml-3">
                  Tail
                </h3>
              </button>
            </h3>
            <div
              id="collapse-body-2"
              class={`px-4 border-b border-violet-100 ${
                tailNavOpen ? "" : "hidden"
              }`}
              aria-labelledby="collapse-heading-2"
            >
              <div class="text-cobweb font-medium text-xs my-3">
                {clients
                  ? "View your pipeline data in realtime"
                  : "No attached clients"}
              </div>

              {clients
                ? (
                  <div class="flex flex-col">
                    <div className="flex flex-row justify-start items-center mb-2 text-[12px] font-[500] text-cobweb">
                      Sampling at
                      <span class="mx-1 font-bold">
                        {tailSamplingSignal.value.rate}
                      </span>
                      messages per
                      <span class="mx-1 font-bold">
                        {tailSamplingSignal.value.intervalSeconds}
                      </span>
                      second{tailSamplingSignal.value.intervalSeconds > 1
                        ? "s"
                        : ""}
                      <IconEdit
                        class="ml-1 w-5 h-5 text-cobweb cursor-pointer"
                        data-tooltip-target="sample-rate"
                        onClick={() =>
                          opModal.value = {
                            ...opModal.value,
                            tailRateModal: true,
                          }}
                      />
                      <Tooltip
                        targetId="sample-rate"
                        message={"Change sample rate."}
                      />
                    </div>
                    <a
                      href={tailRunningSignal.value
                        ? "/"
                        : `/tail/${encodeURIComponent(key)}`}
                      f-partial={tailRunningSignal.value
                        ? "/partials"
                        : `/partials/tail/${encodeURIComponent(key)}`}
                      className={`mt-2 text-white bg-web rounded-md w-[260px] h-[34px] flex justify-center items-center font-medium text-sm mb-4 cursor-pointer`}
                    >
                      {tailRunningSignal.value ? "Stop Tail" : "Start Tail"}
                    </a>
                  </div>
                )
                : null}
            </div>
            <h3 id="collapse-heading-3">
              <button
                className="flex items-center border-b border-violet-100 w-full py-3 font-medium text-left text-gray-500 focus:ring-2"
                data-accordion-target="#collapse-body-3"
                aria-expanded="false"
                aria-controls="collapse-body-3"
              >
                <h3 class="text-gray-400 text-sm font-semibold ml-3">
                  Notifications
                </h3>
                <ComingSoonTag class={"ml-2"} />
              </button>
            </h3>
            <div
              id="collapse-body-3"
              class="hidden"
              aria-labelledby="collapse-heading-3"
            >
              <div class="p-5">
                <p class="text-gray-300 text-xs">
                  Notifications coming soon...
                </p>
              </div>
            </div>
            <h3 id="collapse-heading-4">
              <button
                className="flex items-center w-full border-b border-violet-100 py-3 font-medium text-left text-web focus:ring-2"
                data-accordion-target="#collapse-body-4"
                aria-expanded="false"
                aria-controls="collapse-body-4"
              >
                <h3 class="text-gray-400 text-sm font-semibold ml-3">
                  Trends
                </h3>
                <ComingSoonTag class={"ml-2"} />
              </button>
            </h3>
            <div
              id="collapse-body-4"
              class="hidden"
              aria-labelledby="collapse-heading-4"
            >
              <p class="p-5 text-gray-300 text-xs">
                Trends coming soon...
              </p>
            </div>
            <h3 id="collapse-heading-5">
              <button
                className="flex items-center w-full border-b border-violet-100 py-3 font-medium text-left text-web focus:ring-2"
                onClick={() => setSchemaNavOpen(!schemaNavOpen)}
                data-accordion-target="#collapse-body-5"
                aria-expanded="true"
                aria-controls="collapse-body-5"
              >
                <h3
                  className={"text-web text-sm font-semibold ml-3"}
                >
                  Schema
                </h3>
                <BetaTag class={"ml-2"} />
              </button>
            </h3>
            {schemaNavOpen && (
              <div
                id="collapse-body-5"
                aria-labelledby="collapse-heading-5"
                class={"flex flex-col items-center justify-center px-4 pt-2"}
              >
                <SchemaNav audience={audience} />
              </div>
            )}
          </div>
        </>
      )
      : null
  );
}
