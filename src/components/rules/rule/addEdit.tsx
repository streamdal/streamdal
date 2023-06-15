import { FormSelect } from "../../form/formSelect";
import React from "react";
import { FormHidden } from "../../form/formHidden";
import { FormInput } from "../../form/formInput";
import { RuleArgs } from "./args";
import { useWatch } from "react-hook-form";
import { XMarkIcon } from "@heroicons/react/20/solid";

export type MATCH_TYPE = { [key in string]: { display: string } };

export const RULE_TYPE_MATCH: MATCH_TYPE = {
  string_contains_any: { display: "String Contains Any" },
  string_contains_all: { display: "String Contains All" },
  ip_address: { display: "IP Address" },
  regex: { display: "Regex" },
  ts_rfc3339: { display: "Timestamp (RFC3339)" },
};

export type RULE_TYPE = {
  id?: string;
  failure_mode_config?: any;
  match_config: any;
};

export const RuleAddEdit = ({
  control,
  rule,
  register,
  errors,
  index,
  remove,
}: {
  control: any;
  rule: any;
  register: any;
  errors: any;
  index: number;
  remove: any;
}) => {
  const watchType = useWatch({
    control,
    name: `rules[${index}][match_config.type]`,
  });

  //
  // Shenanigans: I don't know how to make react-hooks-form watch initial value on
  // dynamic fields
  const type = watchType || rule?.match_config?.type;

  return (
    <div className="flex flex-col justify-start align-top my-2 mx-1">
      <div className="flex flex-row justify-between text-stormCloud font-medium text-[14px] leading-[18px]">
        {index + 1}.
        <XMarkIcon
          className="text-stormCloud w-[20px] cursor-pointer"
          onClick={remove}
        />
      </div>
      <div className="pt-2 w-full">
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
          error={errors["match_config.path"]?.message || ""}
          placeholder="ex: payload.address"
        />
        <FormSelect
          name={`rules[${index}][match_config.type]`}
          label="Field Match Type"
          register={register}
          error={errors["match_config.type"]?.message || ""}
        >
          {Object.keys(RULE_TYPE_MATCH).map((k: string, i: number) => (
            <option key={`rule-type-match-key-${i}`} value={k}>
              {RULE_TYPE_MATCH[k].display}
            </option>
          ))}
        </FormSelect>
        {["string_contains_any", "string_contains_all", "regex"].includes(
          type
        ) && <RuleArgs ruleIndex={index} register={register} errors={errors} />}
      </div>
    </div>
  );
};
