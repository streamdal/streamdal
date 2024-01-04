import { ConsumerIcon } from "../../components/icons/consumer.tsx";
import { ProducerIcon } from "../../components/icons/producer.tsx";
import { opModal } from "../../components/serviceMap/opModalSignal.ts";
import { OperationType } from "streamdal-protos/protos/sp_common.ts";
import { useState } from "preact/hooks";
import { tailEnabledSignal, tailSamplingSignal, tailSignal } from "./tail.tsx";
import { useSignalEffect } from "@preact/signals";
import { ServiceSignal } from "../../components/serviceMap/serviceSignal.ts";
import { BetaTag, ComingSoonTag } from "../../components/icons/featureTags.tsx";
import { ManageOpPipelines } from "../../components/modals/manageOpPipelines.tsx";
import { Schema } from "./schema.tsx";
import IconInfoCircle from "tabler-icons/tsx/info-circle.tsx";
import { Tooltip } from "../../components/tooltip/tooltip.tsx";
import { zfd } from "zod-form-data";
import * as z from "zod/index.ts";
import { validate } from "../../components/form/validate.ts";

export const SampleRateSchema = zfd.formData({
  rate: zfd.numeric(z.number().min(1)),
  intervalSeconds: zfd.numeric(z.number().min(1)),
}).refine(
  (data) => data.rate * data.intervalSeconds <= data.intervalSeconds * 100,
  {
    message: "Max rate is 100/second",
    path: ["rate"],
  },
);

export default function Operation(
  { serviceMap }: { serviceMap: ServiceSignal },
) {
  const [managePipelines, setManagePipelines] = useState(true);
  const [tailNavOpen, setTailNavOpen] = useState(false);
  const [schemaNavOpen, setSchemaNavOpen] = useState(true);
  const pipelines = Object.values(serviceMap?.pipelines);

  const audience = opModal.value?.audience;
  const clients = opModal.value?.clients;

  const [sampleErrors, setSampleErrors] = useState({});

  const submitSampleRate = async (e: any) => {
    e.preventDefault();

    if (tailEnabledSignal.value) {
      tailEnabledSignal.value = false;
      return;
    }

    const data = new FormData(e.target);
    const { errors } = validate(SampleRateSchema, data);
    setSampleErrors(errors || {});

    if (!errors) {
      tailSamplingSignal.value.rate = Number(data.get("rate"));
      tailSamplingSignal.value.intervalSeconds = Number(
        data.get("intervalSeconds"),
      );
      tailEnabledSignal.value = true;
    }
  };

  useSignalEffect(() => {
    if (tailEnabledSignal.value === false) {
      tailSignal.value = [];
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
              {opModal.value?.audience.operationName}
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
            className="flex items-center w-full border-b border-purple-100 py-3 font-medium text-left text-web focus:ring-2"
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
          class={`px-4 py-2 border-b border-purple-100 ${
            managePipelines ? "" : "hidden"
          }`}
          aria-labelledby="collapse-heading-1"
        >
          <ManageOpPipelines pipelines={pipelines} />
        </div>
        <h3 id="collapse-heading-2">
          <button
            type="button"
            className={`flex items-center w-full border-y border-purple-100 py-3 font-medium text-left text-web`}
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
          class={`px-4 border-b border-purple-100 ${
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
            <form
              onSubmit={submitSampleRate}
            >
              <div class="flex flex-col">
                <div className="flex flex-row justify-start items-center mb-2">
                  <div class="mr-1 text-[12px] font-[500] text-cobweb">
                    Sampling
                  </div>
                  <IconInfoCircle
                    class="w-4 h-4 mr-2 text-cobweb cursor-pointer"
                    data-tooltip-target="sample-rate"
                  />
                  <Tooltip
                    targetId="sample-rate"
                    message={"Rate is the number of message to sample per the Interval in seconds you specify."}
                  />
                </div>
                <div class="flex flex-row justify-start items-center">
                  <label className="relative inline-flex items-center">
                    <span
                      className={`mr-2 text-[12px] font-[500] leading-[20px] ${
                        sampleErrors["rate"]
                          ? "text-streamdalRed"
                          : "text-cobweb"
                      }`}
                    >
                      Rate
                    </span>

                    <input
                      name="rate"
                      className={`h-[28px] border w-[70px] mr-2 text-sm px-1 ${
                        sampleErrors["rate"] ? "border-streamdalRed" : ""
                      }`}
                      defaultValue={tailSamplingSignal.value.rate}
                    />
                  </label>
                  <label className="relative inline-flex items-center ml-2">
                    <span
                      className={`mr-2 text-[12px] font-[500] leading-[20px] ${
                        sampleErrors["intervalSeconds"]
                          ? "text-streamdalRed"
                          : "text-cobweb"
                      }`}
                    >
                      Interval
                    </span>

                    <input
                      name="intervalSeconds"
                      className={`h-[28px] border w-[70px] mr-1 text-sm px-1 ${
                        sampleErrors["intervalSeconds"]
                          ? "border-streamdalRed"
                          : ""
                      }`}
                      defaultValue={tailSamplingSignal.value.intervalSeconds}
                    />
                    <span className="text-[12px] font-[500] leading-[20px] text-cobweb">
                      /s
                    </span>
                  </label>
                </div>
                <div className="text-[12px] mt-1 font-semibold text-streamdalRed">
                  {Object.values(sampleErrors).join(" ")}
                </div>
                <button
                  type="submit"
                  className={`mt-2 text-white bg-web rounded-md w-[260px] h-[34px] flex justify-center items-center font-medium text-sm mb-4 cursor-pointer`}
                >
                  {tailEnabledSignal.value ? "Stop Tail" : "Start Tail"}
                </button>
              </div>
            </form>
          )}
        </div>
        <h3 id="collapse-heading-3">
          <button
            className="flex items-center border-b border-purple-100 w-full py-3 font-medium text-left text-gray-500 focus:ring-2"
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
            className="flex items-center w-full border-b border-purple-100 py-3 font-medium text-left text-web focus:ring-2"
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
            className="flex items-center w-full border-b border-purple-100 py-3 font-medium text-left text-web focus:ring-2"
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
            <Schema audience={audience} />
          </div>
        )}
      </div>
    </>
  );
}
