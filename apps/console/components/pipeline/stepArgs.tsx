import { DetectiveType } from "streamdal-protos/protos/steps/sp_steps_detective.ts";
import { FormInput } from "../form/formInput.tsx";
import { ErrorType } from "../form/validate.ts";
import { useState } from "preact/hooks";
import IconTrash from "tabler-icons/tsx/trash.tsx";
import IconPlus from "tabler-icons/tsx/plus.tsx";
import { Tooltip } from "../tooltip/tooltip.tsx";
import { FormSelect } from "../form/formSelect.tsx";
import { titleCase } from "../../lib/utils.ts";
import { nArgTypes, oneArgTypes } from "root/components/pipeline/pipeline.ts";
import { RadioGroup } from "../form/radioGroup.tsx";
import React from "react";
import { DetectiveTypePIIKeywordMode } from "streamdal-protos/protos/steps/sp_steps_detective.ts";

export const argTypes = [...oneArgTypes, ...nArgTypes];

export type StepArgType = {
  stepIndex: number;
  argIndex: number;
  data: any;
  setData: (data: any) => void;
  errors: ErrorType;
};

export type StepArgsType = {
  stepIndex: number;
  type: keyof typeof DetectiveType;
  data: any;
  setData: (data: any) => void;
  errors: ErrorType;
};

export const StepArg = (
  { stepIndex, argIndex, data, setData, errors }: StepArgType,
) => (
  <FormInput
    name={`steps.${stepIndex}.step.detective.args.${argIndex}`}
    data={data}
    setData={setData}
    label="Arg"
    errors={errors}
    inputClass="w-full"
    wrapperClass="w-full"
  />
);

export const StepArgs = (
  { stepIndex, type, data, setData, errors }: StepArgsType,
) => {
  console.log("Step args type:", type);
  console.log("Step data:", data.steps[stepIndex]);
  console.log("Step set data:", setData);

  //
  // Peek into step to see how many args there are so we
  // can tell the ui how many args to render initially
  const length = data?.steps[stepIndex]
    ?.step[data?.steps[stepIndex]?.step?.oneofKind]?.args?.length || 1;

  console.log("Length: ", length);

  const [args, setArgs] = useState(Array.from({ length }, (v, k) => k));

  console.log("Args: ", args);
  console.log("setArgs: ", setArgs);

  return type === "IS_TYPE"
    ? (
      <FormSelect
        name={`steps.0.step.detective.args.0`}
        data={data}
        setData={setData}
        label="Type"
        errors={errors}
        inputClass="w-36"
        children={["string", "number", "boolean", "array", "object", "null"]
          .map((s, i) => (
            <option
              key={`is-type-arg-key-${i}`}
              value={s}
              label={titleCase(s)}
            />
          ))}
      />
    )
    : type === "PII_KEYWORD"
      ? (
        <RadioGroup
          name={`steps.0.step.detective.piiKeywordMode`}
          data={data}
          errors={errors}
          options={{
            [DetectiveTypePIIKeywordMode.DETECTIVE_TYPE_PII_KEYWORD_MODE_UNSET]: "Performance",
            [DetectiveTypePIIKeywordMode.DETECTIVE_TYPE_PII_KEYWORD_MODE_ACCURACY]: "Accuracy",
          }}
        />
      )
    : oneArgTypes.filter((a: string) =>
        !["STRING_CONTAINS_ANY", "STRING_CONTAINS_ALL"].includes(a)
      ).includes(type)
    ? (
      <StepArg
        stepIndex={stepIndex}
        argIndex={0}
        data={data}
        setData={setData}
        errors={errors}
      />
    )
    : (
      <div className="flex flex-col mb-2 border rounded-sm px-2 w-full">
        {args.map((i) => (
          <div
            className="flex flex-row justify-between items-center w-full"
            key={`rule-arg-key-${i}`}
          >
            <StepArg
              stepIndex={stepIndex}
              argIndex={i}
              data={data}
              setData={setData}
              errors={errors}
            />
            {args.length > 1 &&
              (
                <IconTrash
                  class="w-5 h-5 mt-3 ml-2 text-eyelid cursor-pointer"
                  onClick={() => setArgs(args.filter((index) => index !== i))}
                />
              )}
            <IconPlus
              data-tooltip-target="arg-add"
              class="w-5 h-5 mt-3 ml-2 cursor-pointer"
              onClick={() => setArgs([...args, args.length])}
            />
            <Tooltip targetId="arg-add" message="Add an arg" />
          </div>
        ))}
      </div>
    );
};
