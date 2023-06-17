import type { MATCH_TYPE } from "./addEdit";
import { FormSelect } from "../../form/formSelect";
import React, { useEffect, useState } from "react";
import { useFormState, useWatch } from "react-hook-form";
import { FormInput } from "../../form/formInput";
import { getJson } from "../../../lib/fetch";
import type { RulesetType } from "../rulesetAddEdit";

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
  index,
}: {
  ruleIndex: number;
  failureMode: any;
  register: any;
  control: any;
  index: number;
}) => {
  const [slackConfigured, setSlackConfigured] = useState(false);
  const watchMode = useWatch({
    control,
    name: `rules[${ruleIndex}].failure_mode_configs[${index}].mode]`,
  });

  const { errors } = useFormState<RulesetType>({
    control,
  });

  const checkSlack = async () => {
    try {
      const response = await getJson(`/v1/slack`);
      setSlackConfigured(!!response?.values?.token);
    } catch {
      setSlackConfigured(false);
    }
  };

  useEffect(() => {
    checkSlack();
  }, []);
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
        error={
          errors?.rules?.[ruleIndex]?.failure_mode_configs?.[index]?.mode
            ?.message || ""
        }
      >
        {Object.keys(FAILURE_MODE_TYPE).map((k: string, i: number) => (
          <option key={`failure-mode-type-option-key-${i}`} value={k}>
            {FAILURE_MODE_TYPE[k].display}
          </option>
        ))}
      </FormSelect>
      {mode === "RULE_FAILURE_MODE_ALERT_SLACK" && (
        <div className="flex flex-col">
          <FormInput
            name={`rules[${ruleIndex}].failure_mode_configs[${index}].alert_slack[slack_channel]]`}
            label="Slack Channel"
            register={register}
            error={
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              // prettier-ignore
              errors?.rules?.[ruleIndex]?.failure_mode_configs?.[index]?.alert_slack?.slack_channel?.message || ""
            }
          />
          {slackConfigured ? null : (
            <div className="mb-4">
              In order to receive Slack Alerts, you must configure Slack{" "}
              <a href="/slack" className="underline underline-offset-1">
                here
              </a>
              .
            </div>
          )}
        </div>
      )}
      {mode === "RULE_FAILURE_MODE_DLQ" && (
        <FormInput
          name={`rules[${ruleIndex}].failure_mode_configs[${index}].dlq[streamdal_token]]`}
          label="Streamdal Token"
          register={register}
          error={
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            // prettier-ignore
            errors?.rules?.[ruleIndex]?.failure_mode_configs?.[index]?.dlq?.streamdal_token?.message || ""
          }
        />
      )}
      {mode === "RULE_FAILURE_MODE_TRANSFORM" && (
        <>
          <FormInput
            name={`rules[${ruleIndex}].failure_mode_configs[${index}].transform[path]]`}
            label="Path"
            register={register}
            error={
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              // prettier-ignore
              errors?.rules?.[ruleIndex]?.failure_mode_configs?.[index]?.transform?.path?.message || ""
            }
          />
          <FormInput
            name={`rules[${ruleIndex}].failure_mode_configs[${index}].transform[value]]`}
            label="Value"
            register={register}
            error={
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              // prettier-ignore
              errors?.rules?.[ruleIndex]?.failure_mode_configs?.[index]?.transform?.value?.message || ""
            }
          />
          <FormSelect
            name={`rules[${ruleIndex}].failure_mode_configs[${index}].transform[type]]`}
            label="Transform Type"
            register={register}
            error={
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              // prettier-ignore
              errors?.rules?.[ruleIndex]?.failure_mode_configs?.[index]?.transform?.type?.message || ""
            }
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
