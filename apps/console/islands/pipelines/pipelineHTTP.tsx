import { ErrorType } from "root/components/form/validate.ts";
import {
  FormSelect,
  optionsFromEnum,
} from "root/components/form/formSelect.tsx";
import { FormInput } from "root/components/form/formInput.tsx";
import { HttpRequestMethod } from "streamdal-protos/protos/steps/sp_steps_httprequest.ts";
import { HttpRequestBodyMode } from "streamdal-protos/protos/steps/sp_steps_httprequest.ts";
import { FormTextArea } from "root/components/form/formTextArea.tsx";
import { FormStringKV } from "root/components/form/formStringKV.tsx";
import React from "react";
import {RadioGroup} from "../../components/form/radioGroup.tsx";

export type PipelineHTTPType = {
  stepNumber: number;
  data: any;
  setData: (data: any) => void;
  errors: ErrorType;
};

export const PipelineHTTP = (
  { stepNumber, data, setData, errors }: PipelineHTTPType,
) => {
  const bodyName = `steps.${stepNumber}.step.httpRequest.request.body`;
  const value = data.steps[stepNumber].step.httpRequest?.request?.body;

  const decodedValue = value instanceof Uint8Array
    ? new TextDecoder().decode(value)
    : value;

  return (
    <>
      <FormSelect
        name={`steps.${stepNumber}.step.httpRequest.request.method`}
        label="HTTP Method"
        data={data}
        setData={setData}
        errors={errors}
        inputClass="w-64"
        children={optionsFromEnum(HttpRequestMethod)}
      />

      <RadioGroup
        name={`steps.${stepNumber}.step.httpRequest.request.bodyMode`}
        data={data}
        errors={errors}
        options={{
          [HttpRequestBodyMode.STATIC]: "Static Body",
          [HttpRequestBodyMode.INTER_STEP_RESULT]: "Use Previous Step Result",
        }}
      />

      <FormInput
        name={`steps.${stepNumber}.step.httpRequest.request.url`}
        data={data}
        setData={setData}
        label="URL"
        placeHolder={"https://www.example.com/entity"}
        inputClass="w-full"
        errors={errors}
      />

      <FormTextArea
        name={bodyName}
        data={data}
        setData={setData}
        label="Request Body"
        errors={errors}
        value={decodedValue}
      />

      <FormStringKV
        name={`steps.${stepNumber}.step.httpRequest.request.headers`}
        data={data}
        label="Headers"
        description="Key/value pairs that will be sent along as HTTP request headers"
        errors={errors}
      />
    </>
  );
};
