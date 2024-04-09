import { ErrorType } from "../components/form/validate.ts";
import { FormSelect, optionsFromEnum } from "../components/form/formSelect.tsx";
import { FormInput } from "../components/form/formInput.tsx";
import { HttpRequestMethod } from "streamdal-protos/protos/steps/sp_steps_httprequest.ts";
import { FormTextArea } from "../components/form/formTextArea.tsx";
import { FormStringKV } from "../components/form/formStringKV.tsx";

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
      <FormInput
        name={`steps.${stepNumber}.step.httpRequest.request.url`}
        data={data}
        setData={setData}
        label="URL"
        placeHolder={"https://www.example.com/entity"}
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
