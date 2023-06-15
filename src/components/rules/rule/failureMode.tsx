import type { MATCH_TYPE } from "./addEdit";
import { FormSelect } from "../../form/formSelect";
import React from "react";
import { useWatch } from "react-hook-form";
import { FormInput } from "../../form/formInput";

export const FAILURE_MODE_TYPE: MATCH_TYPE = {
  RULE_FAILURE_MODE_UNSET: { display: "Unset" },
  RULE_FAILURE_MODE_REJECT: { display: "Reject" },
  RULE_FAILURE_MODE_DLQ: { display: "Dead Letter" },
  RULE_FAILURE_MODE_TRANSFORM: { display: "Transform" },
  RULE_FAILURE_MODE_ALERT_SLACK: { display: "Slack Alert" },
};

export const TRANSFORM_TYPE: MATCH_TYPE = {
  TRANSFORM_TYPE_REPLACE: { display: "Replace" },
  TRANSFORM_TYPE_DELETE: { display: "Delete" },
};

export const FailureMode = ({
  ruleIndex,
  failureMode,
  register,
  control,
  errors,
  index,
}: {
  ruleIndex: number;
  failureMode: any;
  register: any;
  control: any;
  errors: any;
  index: number;
}) => {
  const watchMode = useWatch({
    control,
    name: `rules[${ruleIndex}].failure_mode_configs[${index}].mode]`,
  });

  //
  // Shenanigans: I don't know how to make react-hooks-form watch initial value on
  // dynamic fields
  const mode = watchMode || failureMode?.mode || "RULE_FAILURE_MODE_UNSET";

  return (
    <div className="mt-2 w-full">
      <FormSelect
        name={`rules[${ruleIndex}].failure_mode_configs[${index}].mode]`}
        label="Failure Mode Type"
        register={register}
        error={errors["failure_mode_configs.mode"]?.message || ""}
      >
        {Object.keys(FAILURE_MODE_TYPE).map((k: string, i: number) => (
          <option key={`failure-mode-type-option-key-${i}`} value={k}>
            {FAILURE_MODE_TYPE[k].display}
          </option>
        ))}
      </FormSelect>
      {mode === "RULE_FAILURE_MODE_ALERT_SLACK" && (
        <FormInput
          name={`rules[${ruleIndex}].failure_mode_configs[${index}].alert_slack[slack_channel]]`}
          label="Slack Channel"
          register={register}
          error={
            errors["failure_mode_configs.alert_slack.slack_channel"]?.message ||
            ""
          }
        />
      )}
      {mode === "RULE_FAILURE_MODE_DLQ" && (
        <FormInput
          name={`rules[${ruleIndex}].failure_mode_configs[${index}].dlq[streamdal_token]]`}
          label="Streamdal Token"
          register={register}
          error={
            errors["failure_mode_configs.dlq.streamdal_token"]?.message || ""
          }
        />
      )}
      {mode === "RULE_FAILURE_MODE_TRANSFORM" && (
        <>
          <FormInput
            name={`rules[${ruleIndex}].failure_mode_configs[${index}].transform[path]]`}
            label="Path"
            register={register}
            error={errors["failure_mode_configs.transform.path"]?.message || ""}
          />
          <FormInput
            name={`rules[${ruleIndex}].failure_mode_configs[${index}].transform[value]]`}
            label="Value"
            register={register}
            error={
              errors["failure_mode_configs.transform.value"]?.message || ""
            }
          />
          <FormSelect
            name={`rules[${ruleIndex}].failure_mode_configs[${index}].transform[type]]`}
            label="Transform Type"
            register={register}
            error={errors["failure_mode_configs.transform.type"]?.message || ""}
          >
            {Object.keys(TRANSFORM_TYPE).map((k: string, i: number) => (
              <option
                key={`failure-mode-transform-type-option-key-${i}`}
                value={k}
              >
                {TRANSFORM_TYPE[k].display}
              </option>
            ))}
          </FormSelect>
        </>
      )}
    </div>
  );
};
