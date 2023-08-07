import { ErrorType } from "../form/validate.ts";
import { CheckboxGroup } from "../form/checkboxGroup.tsx";
import { PipelineStepCondition } from "snitch-protos/protos/pipeline.ts";

export type StepConditionType = {
  stepIndex: number;
  data: any;
  setData: (data: any) => void;
  errors: ErrorType;
};

export const StepConditions = (
  { stepIndex, data, setData, errors }: StepConditionType,
) => {
  return (
    <div class="flex flex-row justify-between">
      <CheckboxGroup
        label="On Success"
        name={`steps.${stepIndex}.onSuccess`}
        data={data}
        setData={setData}
        errors={errors}
        options={PipelineStepCondition}
        wrapperClass="w-1/2 mr-1"
      />
      <CheckboxGroup
        label="On Failure"
        name={`steps.${stepIndex}.onFailure`}
        data={data}
        setData={setData}
        errors={errors}
        options={PipelineStepCondition}
        wrapperClass="w-1/2 ml-1"
      />
    </div>
  );
};
