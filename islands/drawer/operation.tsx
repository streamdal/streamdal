import { ConsumerIcon } from "../../components/icons/consumer.tsx";
import { ProducerIcon } from "../../components/icons/producer.tsx";
import { opModal } from "../../components/serviceMap/opModalSignal.ts";
import { OperationType } from "streamdal-protos/protos/sp_common.ts";
import { useState } from "preact/hooks";
import {
  tailEnabledSignal,
  tailSamplingRateSignal,
  tailSamplingSignal,
  tailSignal,
} from "./tail.tsx";
import { isNumeric } from "../../lib/utils.ts";
import { useSignalEffect } from "@preact/signals";
import { ServiceSignal } from "../../components/serviceMap/serviceSignal.ts";
import { BetaTag, ComingSoonTag } from "../../components/icons/featureTags.tsx";
import IconPlus from "tabler-icons/tsx/plus.tsx";
import { ManageOpPipelines } from "../../components/modals/manageOpPipelines.tsx";
import { Toggle } from "../../components/form/switch.tsx";
import { Schema } from "./schema.tsx";
import { Tooltip } from "../../components/tooltip/tooltip.tsx";
import IconChevronDown from "tabler-icons/tsx/chevron-down.tsx";
import IconChevronUp from "tabler-icons/tsx/chevron-up.tsx";

export default function Operation(
  { serviceMap }: { serviceMap: ServiceSignal },
) {
  const [managePipelines, setManagePipelines] = useState(false);
  const [tailNavOpen, setTailNavOpen] = useState(false);
  const [schemaNavOpen, setSchemaNavOpen] = useState(true);
  const pipelines = Object.values(serviceMap?.pipelines);

  const audience = opModal.value?.audience;
  const clients = opModal.value?.clients;

  useSignalEffect(() => {
    if (tailEnabledSignal.value === false) {
      tailSignal.value = {};
    }
  });

  return (
    <>
      <div class="rounded-t flex justify-between">
        <div class="z-[20] flex items-center justify-start px-4 w-full h-16 bg-web">
          {OperationType[audience?.operationType] === OperationType.CONSUMER
            ? <ConsumerIcon />
            : <ProducerIcon />}
          <div class="flex flex-col">
            <h3 class="text-lg text-cloud mx-2">
              {opModal.value.audience.operationName}
            </h3>
          </div>
        </div>
      </div>
      <div class="px-4 py-4 rounded-md mx-2">
        <div class="mb-2 flex items-center pr-2">
          <h3 class="text-web font-bold text-sm">
            Pipelines
          </h3>
          <BetaTag class={"ml-2"} />
        </div>
        {!pipelines?.length
          ? (
            <a href={"/pipelines"}>
              <button class="text-streamdalPurple border border-purple-600 bg-purple-50 font-semibold rounded-lg w-full flex justify-center text-sm px-2 py-1 text-center inline-flex items-center">
                <IconPlus class="w-4 h-4 mr-1" />
                Create a new pipeline
              </button>
            </a>
          )
          : (
            <button
              id="attach-pipeline"
              className="text-web font-semibold bg-purple-50 border border-purple-600 hover:border-[#8E84AD] font-medium rounded-md w-full flex justify-between text-sm px-2 text-xs py-1 text-center inline-flex items-center focus:ring-1 focus:outline-none focus:ring-purple-600 active:ring-1 active:outline-none active:ring-purple-600"
              type="button"
              onClick={() => setManagePipelines(!managePipelines)}
            >
              Attach/Detach Pipelines
              {managePipelines
                ? (
                  <IconChevronUp
                    class="w-4"
                    data-tooltip-target="pipeline-manage"
                  />
                )
                : (
                  <IconChevronDown
                    class="w-4"
                    data-tooltip-target="pipeline-manage"
                  />
                )}
              <Tooltip
                targetId="pipeline-manage"
                message={"Attach/detach and pause/unpause pipelines"}
              />
            </button>
          )}
        {managePipelines && <ManageOpPipelines pipelines={pipelines} />}
      </div>
      <div
        id="pipeline-attach-detach"
        data-accordion="open"
        data-active-classes="bg-blue-100 text-blue-600"
        class="py-2"
      >
        <h3 id="collapse-heading-2">
          <button
            type="button"
            className={`flex items-center w-full px-5 border-y border-purple-100 py-3 font-medium text-left text-web `}
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
          class={`border-b border-purple-100 pl-7 ${
            tailNavOpen ? "" : "hidden"
          }`}
          aria-labelledby="collapse-heading-2"
        >
          <div class="text-cobweb font-medium text-xs my-3">
            {clients
              ? "View your pipeline data in realtime"
              : "No attached clients"}
          </div>
          {clients && (
            <div class="flex flex-col">
              <div class="flex flex-row justify-start items-center mb-3">
                <Toggle
                  label="Sampling"
                  value={tailSamplingSignal.value}
                  setValue={(value) => tailSamplingSignal.value = value}
                />
                {tailSamplingSignal.value &&
                  (
                    <label className="relative inline-flex items-center cursor-pointer ml-2">
                      <span className="mr-3 text-[12px] font-[500] leading-[20px] text-cobweb">
                        Sample Setting
                      </span>

                      <input
                        class={`w-[${
                          (String(
                            tailSamplingRateSignal.value,
                          )
                            .length) * 12
                        }px] mr-2`}
                        value={tailSamplingRateSignal
                          .value}
                        onChange={(e) => {
                          if (isNumeric(e.target.value)) {
                            tailSamplingRateSignal.value = e.target.value;
                          }
                        }}
                      />
                      <span className="mr-3 text-[12px] font-[500] leading-[20px] text-cobweb">
                        /s
                      </span>
                    </label>
                  )}
              </div>
              <button
                onClick={() =>
                  tailEnabledSignal.value = !tailEnabledSignal
                    .value}
                className={`text-white bg-web rounded-md w-[260px] h-[34px] flex justify-center items-center font-medium text-sm mb-4 cursor-pointer`}
              >
                {tailEnabledSignal.value ? "Stop Tail" : "Start Tail"}
              </button>
            </div>
          )}
        </div>
        <h3 id="collapse-heading-3">
          <button
            className="flex items-center border-b border-purple-100 w-full px-5 py-3 font-medium text-left text-gray-500 focus:ring-2"
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
            className="flex items-center w-full px-5 border-b border-purple-100 py-3 font-medium text-left text-web focus:ring-2"
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
            className={`flex items-center w-full px-5 border-purple-100 py-3 font-medium text-left text-web`}
            onClick={() => setSchemaNavOpen(!schemaNavOpen)}
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
            class={"flex flex-col items-center justify-center p-4"}
          >
            <Schema audience={audience} />
          </div>
        )}
      </div>
    </>
  );
}
