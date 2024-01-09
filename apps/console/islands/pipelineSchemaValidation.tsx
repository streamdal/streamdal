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
import {
  JSONSchemaDraft,
  SchemaValidationType,
} from "streamdal-protos/protos/steps/sp_steps_schema_validation.ts";
import { FormTextArea } from "../components/form/formTextArea.tsx";

export type PipelineSchemaValidationType = {
  stepNumber: number;
  step: PipelineStep;
  data: any;
  setData: (data: any) => void;
  errors: ErrorType;
};

export const SchemaValidationOptions = (
  { stepNumber, step, data, setData, errors }: PipelineSchemaValidationType,
) => {
  const type = step.step?.schemaValidation?.type ||
    SchemaValidationType.JSONSCHEMA;

  switch (Number(type)) {
    case SchemaValidationType.JSONSCHEMA:
      return (
        <>
          <input
            type="hidden"
            name={`steps.${stepNumber}.step.schemaValidation.options.oneofKind`}
            value="jsonSchema"
          />
          <FormTextArea
            name={`steps.${stepNumber}.step.schemaValidation.options.jsonSchema.jsonSchema`}
            data={data}
            setData={setData}
            label="Schema"
            placeHolder="paste your schema here"
            errors={errors}
          />
          <FormSelect
            name={`steps.${stepNumber}.step.schemaValidation.options.jsonSchema.draft`}
            label="Schema Draft Version"
            data={data}
            setData={setData}
            errors={errors}
            inputClass="w-64"
            children={optionsFromEnum(JSONSchemaDraft)}
          />
        </>
      );
  }
};

export const PipelineSchemaValidation = (
  { stepNumber, step, data, setData, errors }: PipelineSchemaValidationType,
) => {
  return (
    <>
      <FormSelect
        name={`steps.${stepNumber}.step.schemaValidation.type`}
        label="Type"
        data={data}
        setData={setData}
        errors={errors}
        inputClass="w-64"
        children={optionsFromEnum(SchemaValidationType)}
      />
      <SchemaValidationOptions
        stepNumber={stepNumber}
        step={step}
        data={data}
        setData={setData}
        errors={errors}
      />
    </>
  );
};
