import { FormSelect } from "../../form/formSelect";
import React from "react";
import { FormHidden } from "../../form/formHidden";
import { FormInput } from "../../form/formInput";
import { RuleArgs } from "./args";
import { useFormState, useWatch } from "react-hook-form";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { FailureModes } from "./failureModes";
import type { RulesetType } from "../rulesetAddEdit";
export type MATCH_TYPE = { [key in string]: { display: string } };

export const RULE_TYPE_MATCH: MATCH_TYPE = {
  string_contains_any: { display: "String Contains Any" },
  string_contains_all: { display: "String Contains All" },
  ip_address: { display: "IP Address" },
  regex: { display: "Regex" },
  ts_rfc3339: { display: "Timestamp (RFC3339)" },
  ts_unix_nano: { display: "Timestamp (Unix Nano)" },
  ts_unix: { display: "Timestamp (Unix)" },
  true: { display: "Is True" },
  false: { display: "Is False" },
  is_empty: { display: "Is Empty" },
  pii: { display: "PII (all known types)" },
  pii_creditcard: { display: "PII Credit Card" },
  pii_ssn: { display: "PII Social Security Number" },
  pii_email: { display: "PII Email" },
  pii_phone: { display: "PII Phone" },
};

export const RuleAddEdit = ({
  control,
  rule,
  register,
  index,
  remove,
}: {
  control: any;
  rule: any;
  register: any;
  index: number;
  remove: any;
}) => {
  const { errors } = useFormState<RulesetType>({
    control,
  });

  const watchType = useWatch({
    control,
    name: `rules[${index}][match_config.type]`,
  });

  //
  // Shenanigans: I don't know how to make react-hooks-form watch initial value on
  // dynamic fields
  const type = watchType || rule?.match_config?.type;

  return (
    <div className="flex flex-col justify-start align-top">
      <div className="flex flex-row justify-between text-stormCloud font-medium text-[14px] leading-[18px] bg-sunset p-2">
        Rule {index + 1}.
        <XMarkIcon
          className="text-stormCloud w-[20px] cursor-pointer"
          onClick={() => remove(index)}
        />
      </div>
      <div className="p-2 w-full">
        {rule?.id && (
          <FormHidden
            name={`rules[${index}][id]`}
            value={rule.id}
            register={register}
          />
        )}
        {/*There will be more options eventually*/}
        <FormHidden
          name={`rules[${index}][type]`}
          value="RULE_TYPE_MATCH"
          register={register}
        />
        <FormInput
          name={`rules[${index}][match_config.path]`}
          label="Field Path"
          register={register}
          error={errors?.rules?.[index]?.match_config?.path?.message || ""}
          placeholder="ex: payload.address"
        />
        <FormSelect
          name={`rules[${index}][match_config.type]`}
          label="Field Match Type"
          register={register}
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          error={errors?.rules?.[index]?.match_config?.type?.message || ""}
        >
          {Object.keys(RULE_TYPE_MATCH).map((k: string, i: number) => (
            <option key={`rule-type-match-key-${i}`} value={k}>
              {RULE_TYPE_MATCH[k].display}
            </option>
          ))}
        </FormSelect>
        {["string_contains_any", "string_contains_all", "regex"].includes(
          type
        ) && (
          <RuleArgs ruleIndex={index} register={register} control={control} />
        )}
        <FailureModes
          rule={rule}
          register={register}
          control={control}
          ruleIndex={index}
        />
      </div>
    </div>
  );
};
