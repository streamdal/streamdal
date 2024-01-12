import IconX from "tabler-icons/tsx/x.tsx";
import {
  tailEnabledSignal,
  tailPausedSignal,
  tailSamplingSignal,
} from "../../islands/drawer/tail.tsx";
import { useEffect, useRef, useState } from "preact/hooks";
import { zfd } from "zod-form-data";
import * as z from "zod/index.ts";
import { opModal } from "../serviceMap/opModalSignal.ts";
import { validate } from "../form/validate.ts";

export const defaultTailSampleRate = {
  rate: 25,
  intervalSeconds: 1,
};

export const SampleRateSchema = zfd.formData({
  rate: zfd.numeric(z.number().min(1)),
  intervalSeconds: zfd.numeric(z.number().min(1)),
}).refine(
  (data) => {
    return data.rate / data.intervalSeconds <=
      defaultTailSampleRate.rate;
  },
  {
    message: `Max rate is ${defaultTailSampleRate.rate}/second`,
    path: ["rate"],
  },
);

export const TailRateModal = () => {
  const modalRef = useRef(null);

  useEffect(() => {
    const clickAway = (event) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target)
      ) {
        opModal.value = { ...opModal.value, tailRateModal: false };
      }
    };
    document.addEventListener("mousedown", clickAway);
    return () => {
      document.removeEventListener("mousedown", clickAway);
    };
  }, [modalRef]);

  const [sampleErrors, setSampleErrors] = useState({});

  const submitSampleRate = async (e: any) => {
    e.preventDefault();

    const data = new FormData(e.target);
    const { errors } = validate(SampleRateSchema, data);
    setSampleErrors(errors || {});

    if (errors) {
      return;
    }

    tailSamplingSignal.value.rate = Number(data.get("rate"));
    tailSamplingSignal.value.intervalSeconds = Number(
      data.get("intervalSeconds"),
    );

    //
    // restart tail if it's running
    if (tailEnabledSignal.value && !tailPausedSignal.value) {
      tailPausedSignal.value = true;
      setTimeout(() => tailPausedSignal.value = false, 1000);
    }
    opModal.value = { ...opModal.value, tailRateModal: false };
  };

  return (
    <div
      ref={modalRef}
      class="absolute top-[8%] left-[30%] z-50 p-4 overflow-x-hidden overflow-y-auto inset-0 max-w-md max-h-full"
    >
      <div class="relative bg-white rounded-lg border border-burnt shadow-2xl shadow-burnt flex flex-col">
        <div class="h-[20px]">
          <a href="/">
            <button
              type="button"
              className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center"
              onClick={() =>
                opModal.value = { ...opModal.value, tailRateModal: false }}
            >
              <IconX class="w-6 h-6" />
            </button>
          </a>
        </div>
        <div class="p-6 text-center">
          <form
            onSubmit={submitSampleRate}
          >
            <div
              className={`mb-4`}
            >
              Rate is the number of messages to sample per the Interval in
              seconds you specify.
            </div>

            <div class="flex flex-col">
              <label
                htmlFor="rate"
                className={`text-left text-xs mb-[3px] ${
                  sampleErrors["rate"] && "text-streamdalRed"
                }`}
              >
                Rate
              </label>
              <input
                name="rate"
                className={`h-[32px] border mr-2 px-1 ${
                  sampleErrors["rate"] ? "border-streamdalRed" : ""
                }`}
                defaultValue={tailSamplingSignal.value.rate}
              />
              <div className="text-left h-6 text-[12px] mt-1 font-semibold text-streamdalRed">
                {sampleErrors["rate"]}
              </div>

              <label
                htmlFor="intervalSeconds"
                className={`text-left text-xs mb-[3px] ${
                  sampleErrors["intervalSeconds"] && "text-streamdalRed"
                }`}
              >
                Interval in seconds
              </label>

              <input
                name="intervalSeconds"
                className={`h-[32px] border mr-1 text-sm px-1 ${
                  sampleErrors["intervalSeconds"] ? "border-streamdalRed" : ""
                }`}
                defaultValue={tailSamplingSignal.value.intervalSeconds}
              />
              <div className="text-left h-6 text-[12px] mt-1 font-semibold text-streamdalRed">
                {sampleErrors["intervalSeconds"]}
              </div>
            </div>
            <button
              className="btn-secondary mr-2"
              onClick={() =>
                opModal.value = { ...opModal.value, tailRateModal: false }}
            >
              Cancel
            </button>
            <button
              className="btn-heimdal"
              type="submit"
            >
              Set Rate
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
