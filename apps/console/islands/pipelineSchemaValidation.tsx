import { ErrorType } from "../components/form/validate.ts";
import { FormSelect, optionsFromEnum } from "../components/form/formSelect.tsx";
import { PipelineStep } from "streamdal-protos/protos/sp_pipeline.ts";
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

  //
  // Backend sends us the schema as Uint8Array
  // so we decode it on the fly for display
  const value =
    step.step?.schemaValidation?.options?.jsonSchema?.jsonSchema instanceof
        Uint8Array
      ? new TextDecoder().decode(
        step.step?.schemaValidation?.options?.jsonSchema?.jsonSchema,
      )
      : step.step?.schemaValidation?.options?.jsonSchema?.jsonSchema;

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
            value={value}
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
