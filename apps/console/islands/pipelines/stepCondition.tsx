import { AbortCondition } from "streamdal-protos/protos/sp_pipeline.ts";
import { RadioGroup } from "../../components/form/radioGroup.tsx";
import IconInfoCircle from "tabler-icons/tsx/info-circle.tsx";
import { Tooltip } from "../../components/tooltip/tooltip.tsx";
import { useState } from "preact/hooks";
import IconChevronUp from "tabler-icons/tsx/chevron-up.tsx";
import IconChevronDown from "tabler-icons/tsx/chevron-down.tsx";
import { FormStringKV } from "../../components/form/formStringKV.tsx";
import { StepNotifications } from "./stepNotifications.tsx";
import { NotificationConfig } from "streamdal-protos/protos/sp_notify.ts";
import { ErrorType } from "root/components/form/validate.ts";

export type StepConditionType = {
  name: string;
  label: string;
  toolTip: string;
  data: any;
  setData: (data: any) => void;
  errors: ErrorType;
  notifications: NotificationConfig[];
};

export const StepCondition = (
  { name, label, toolTip, data, setData, errors, notifications }:
    StepConditionType,
) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      class={`my-2 border rounded-sm ${
        errors && Object.keys(errors).some((k) => k.includes(name)) &&
        "border-streamdalRed"
      }`}
    >
      <div
        class="flex flex-row justify-between items-center p-2 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div class="flex flex-row justify-start items-center">
          <label
            className={`text-xs ${errors[name] && "text-streamdalRed"}`}
          >
            {label}
          </label>
          <IconInfoCircle
            class="w-4 h-4 ml-1"
            data-tooltip-target={`${name}-tooltip`}
          />
          <Tooltip
            targetId={`${name}-tooltip`}
            message={toolTip}
          />
        </div>
        {expanded
          ? <IconChevronUp class="w-6 h-6 text-twilight" />
          : <IconChevronDown class="w-6 h-6 text-twilight" />}
      </div>
      <div
        className={`flex flex-col p-2 w-full border-t md:${
          expanded ? "visible" : "hidden"
        }`}
      >
        <RadioGroup
          name={`${name}.abort`}
          data={data}
          errors={errors}
          options={{
            [AbortCondition.UNSET]: "Don't Abort",
            [AbortCondition.ABORT_CURRENT]: "Abort Current Pipeline",
            [AbortCondition.ABORT_ALL]: "Abort All Pipelines",
          }}
        />
        <FormStringKV
          name={`${name}.metadata`}
          data={data}
          label={"Metadata"}
          description="Metadata are arbitrary keys and values that will be emitted to calling code"
          errors={errors}
        />
        <StepNotifications
          notifications={notifications}
          name={`${name}.notification`}
          data={data}
          setData={setData}
          errors={errors}
        />
      </div>
    </div>
  );
};
