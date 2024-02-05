import { ErrorType } from "../components/form/validate.ts";
import { FormSelect, optionsFromEnum } from "../components/form/formSelect.tsx";
import {
  TransformTruncateType,
  TransformType,
} from "streamdal-protos/protos/steps/sp_steps_transform.ts";
import { PipelineStep } from "streamdal-protos/protos/sp_pipeline.ts";
import { FormInput } from "../components/form/formInput.tsx";
import { FormBoolean } from "../components/form/formBoolean.tsx";
import { FormNInput } from "../components/form/formNInput.tsx";
import IconInfoCircle from "tabler-icons/tsx/info-circle.tsx";
import { useState } from "preact/hooks";

export type PipelineTransformType = {
  stepNumber: number;
  step: PipelineStep;
  data: any;
  setData: (data: any) => void;
  errors: ErrorType;
};

export type PipelineTransformPath = {
  stepNumber: number;
  data: any;
  setData: (data: any) => void;
  errors: ErrorType;
  optionPath: string;
};

const TransformPath = (
  { optionPath, stepNumber, data, setData, errors }: PipelineTransformPath,
) => {
  const [dynamic, setDynamic] = useState(data?.steps[stepNumber]?.dynamic);

  const dynamicAvailable = stepNumber > 0 &&
    data?.steps[stepNumber - 1]?.step?.oneofKind === "detective";

  return (
    <>
      {dynamicAvailable &&
        (
          <div class="flex flex-row items-center mb-2">
            <input
              type="checkbox"
              id={`steps.${stepNumber}.dynamic`}
              name={`steps.${stepNumber}.dynamic`}
              className={`w-4 h-4 rounded border mr-2 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2`}
              value={dynamic}
              checked={dynamic}
              onChange={() => setDynamic(!dynamic)}
            />
            <label className="text-web font-medium text-[14px] mt-1">
              Use output of previous detective step as Path
            </label>
          </div>
        )}
      {!dynamic &&
        (
          <FormInput
            name={`steps.${stepNumber}.step.transform.options.${optionPath}.path`}
            data={data}
            setData={setData}
            label="Path"
            placeHolder="ex: object.field"
            errors={errors}
          />
        )}
    </>
  );
};

export const TransformOptions = (
  { stepNumber, step, data, setData, errors }: PipelineTransformType,
) => {
  const type =
    (step.step.oneofKind === "transform" && step.step?.transform?.type) ||
    TransformType.REPLACE_VALUE;

  switch (Number(type)) {
    case TransformType.REPLACE_VALUE:
      return (
        <>
          <input
            type="hidden"
            name={`steps.${stepNumber}.step.transform.options.oneofKind`}
            value="replaceValueOptions"
          />
          <TransformPath
            stepNumber={stepNumber}
            data={data}
            setData={setData}
            errors={errors}
            optionPath={"replaceValueOptions"}
          />

          <FormInput
            name={`steps.${stepNumber}.step.transform.options.replaceValueOptions.value`}
            data={data}
            setData={setData}
            label="Value"
            placeHolder="value to use as a replacement"
            errors={errors}
          />
        </>
      );
    case TransformType.DELETE_FIELD:
      return (
        <>
          <input
            type="hidden"
            name={`steps.${stepNumber}.step.transform.options.oneofKind`}
            value="deleteFieldOptions"
          />
          <TransformPath
            stepNumber={stepNumber}
            data={data}
            setData={setData}
            errors={errors}
            optionPath={"deleteFieldOptions"}
          />
        </>
      );
    case TransformType.OBFUSCATE_VALUE:
      return (
        <>
          <input
            type="hidden"
            name={`steps.${stepNumber}.step.transform.options.oneofKind`}
            value="obfuscateOptions"
          />
          <TransformPath
            stepNumber={stepNumber}
            data={data}
            setData={setData}
            errors={errors}
            optionPath={"obfuscateOptions"}
          />
        </>
      );
    case TransformType.MASK_VALUE:
      return (
        <>
          <input
            type="hidden"
            name={`steps.${stepNumber}.step.transform.options.oneofKind`}
            value="maskOptions"
          />
          <TransformPath
            stepNumber={stepNumber}
            data={data}
            setData={setData}
            errors={errors}
            optionPath={"maskOptions"}
          />
        </>
      );
    case TransformType.TRUNCATE_VALUE:
      return (
        <>
          <input
            type="hidden"
            name={`steps.${stepNumber}.step.transform.options.oneofKind`}
            value="truncateOptions"
          />
          <FormSelect
            name={`steps.${stepNumber}.step.transform.options.truncateOptions.type`}
            label="Truncate Type"
            data={data}
            setData={setData}
            errors={errors}
            inputClass="w-64"
            children={optionsFromEnum(TransformTruncateType)}
          />
          <TransformPath
            stepNumber={stepNumber}
            data={data}
            setData={setData}
            errors={errors}
            optionPath={"truncateOptions"}
          />
          <FormInput
            name={`steps.${stepNumber}.step.transform.options.truncateOptions.value`}
            data={data}
            setData={setData}
            label="Value"
            placeHolder={`Truncate after ${
              (step.step.oneofKind === "transform" &&
                    step?.step?.transform?.options?.oneofKind ===
                      "truncateOptions" &&
                    Number(
                      step?.step?.transform?.options?.truncateOptions?.type,
                    ) ||
                  TransformTruncateType.LENGTH) ===
                  TransformTruncateType.LENGTH
                ? "this many bytes"
                : "this percentage"
            } of the original value `}
            errors={errors}
          />
        </>
      );
    case TransformType.EXTRACT:
      return (
        <>
          <input
            type="hidden"
            name={`steps.${stepNumber}.step.transform.options.oneofKind`}
            value="extractOptions"
          />
          <FormBoolean
            name={`steps.${stepNumber}.step.transform.options.extractOptions.flatten`}
            data={data}
            display="Flatten result object"
          />
          <FormNInput
            name={`steps.${stepNumber}.step.transform.options.extractOptions.paths`}
            data={data}
            setData={setData}
            label="Path"
            placeHolder="ex: object.field"
            errors={errors}
          />
        </>
      );
    default:
      return null;
  }
};

export const PipelineTransform = (
  { stepNumber, step, data, setData, errors }: PipelineTransformType,
) => {
  return (
    <>
      <div class="flex flex-row justify-start items-center">
        <FormSelect
          name={`steps.${stepNumber}.step.transform.type`}
          label="Transform Type"
          data={data}
          setData={setData}
          errors={errors}
          inputClass="w-64"
          children={optionsFromEnum(TransformType)}
        />

        {step?.step?.oneofKind === "transform" &&
            Number(step?.step?.transform?.type) === TransformType.EXTRACT
          ? (
            <div class="h-[47px] mt-3 ml-2 flex flex-row items-center text-stormCloud text-sm">
              <IconInfoCircle class="w-5 h-5 mr-1" />
              Take only selected paths, drop all others
            </div>
          )
          : ""}
      </div>
      <TransformOptions
        stepNumber={stepNumber}
        step={step}
        data={data}
        setData={setData}
        errors={errors}
      />
    </>
  );
};
