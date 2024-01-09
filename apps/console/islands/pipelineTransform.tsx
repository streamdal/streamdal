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

export type PipelineTransformType = {
  stepNumber: number;
  step: PipelineStep;
  data: any;
  setData: (data: any) => void;
  errors: ErrorType;
};

export const TransformOptions = (
  { stepNumber, step, data, setData, errors }: PipelineTransformType,
) => {
  const type = step.step?.transform?.type || TransformType.REPLACE_VALUE;

  switch (Number(type)) {
    case TransformType.REPLACE_VALUE:
      return (
        <>
          <input
            type="hidden"
            name={`steps.${stepNumber}.step.transform.options.oneofKind`}
            value="replaceValueOptions"
          />
          <FormInput
            name={`steps.${stepNumber}.step.transform.options.replaceValueOptions.path`}
            data={data}
            setData={setData}
            label="Path"
            placeHolder="ex: object.field"
            errors={errors}
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
          <FormInput
            name={`steps.${stepNumber}.step.transform.options.deleteFieldOptions.path`}
            data={data}
            setData={setData}
            label="Path"
            placeHolder="ex: object.field"
            errors={errors}
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
          <FormInput
            name={`steps.${stepNumber}.step.transform.options.obfuscateOptions.path`}
            data={data}
            setData={setData}
            label="Path"
            placeHolder="ex: object.field"
            errors={errors}
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
          <FormInput
            name={`steps.${stepNumber}.step.transform.options.maskOptions.path`}
            data={data}
            setData={setData}
            label="Path"
            placeHolder="ex: object.field"
            errors={errors}
          />
          <FormInput
            name={`steps.${stepNumber}.step.transform.options.maskOptions.mask`}
            data={data}
            setData={setData}
            label="Mask"
            placeHolder="value to use as a mask"
            errors={errors}
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
          <FormInput
            name={`steps.${stepNumber}.step.transform.options.truncateOptions.path`}
            data={data}
            setData={setData}
            label="Path"
            placeHolder="ex: object.field"
            errors={errors}
          />
          <FormInput
            name={`steps.${stepNumber}.step.transform.options.truncateOptions.value`}
            data={data}
            setData={setData}
            label="Value"
            placeHolder={`Truncate after ${
              (Number(step?.step?.transform?.options?.truncateOptions?.type) ||
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
            display="Flatten"
            defaultChecked={step?.step?.transform?.options
              ?.extractOptions?.flatten}
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
  }
};

export const PipelineTransform = (
  { stepNumber, step, data, setData, errors }: PipelineTransformType,
) => {
  return (
    <>
      <FormSelect
        name={`steps.${stepNumber}.step.transform.type`}
        label="Transform Type"
        data={data}
        setData={setData}
        errors={errors}
        inputClass="w-64"
        children={optionsFromEnum(TransformType)}
      />
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
