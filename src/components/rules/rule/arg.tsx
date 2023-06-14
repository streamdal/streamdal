import { FormInput } from "../../form/formInput";
import React from "react";

export const RuleArg = ({
  index,
  ruleIndex,
  register,
  errors,
}: {
  index: number;
  ruleIndex: number;
  register: any;
  errors: any;
}) => (
  <div className="w-full" key={`rule-arg-key-${index}`}>
    <FormInput
      name={`rules[${ruleIndex}][match_config.args[${index}]`}
      label=""
      register={register}
      error={errors["match_config.args"]?.message || ""}
      margin=""
    />
  </div>
);
