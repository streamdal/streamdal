import { FormInput } from "../../form/formInput";
import React from "react";
import { useFormState } from "react-hook-form";
import type { RulesetType } from "../rulesetAddEdit";

export const RuleArg = ({
  index,
  ruleIndex,
  register,
  control,
}: {
  index: number;
  ruleIndex: number;
  register: any;
  control: any;
}) => {
  const { errors } = useFormState<RulesetType>({
    control,
  });

  return (
    <div className="w-full" key={`rule-arg-key-${index}`}>
      <FormInput
        name={`rules[${ruleIndex}][match_config].args[${index}]`}
        label=""
        register={register}
        error={
          errors?.rules?.[ruleIndex]?.match_config?.args?.[index]?.message || ""
        }
        margin=""
      />
    </div>
  );
};
