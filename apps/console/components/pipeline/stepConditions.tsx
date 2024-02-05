import { ErrorType } from "../form/validate.ts";
import { StepCondition } from "./stepCondition.tsx";

export type StepConditionsType = {
  stepIndex: number;
  data: any;
  errors: ErrorType;
};

export const StepConditions = (
  { stepIndex, data, errors }: StepConditionsType,
) => {
  return (
    <div class="flex flex-col">
      <StepCondition
        name={`steps.${stepIndex}.onTrue`}
        label="On True"
        toolTip="Actions to take when the step condition returns true"
        data={data}
        errors={errors}
      />
      <StepCondition
        name={`steps.${stepIndex}.onFalse`}
        label="On False"
        toolTip="Actions to take when the step condition returns false"
        data={data}
        errors={errors}
      />
      <StepCondition
        name={`steps.${stepIndex}.onError`}
        label="On Error"
        toolTip="Action to take when the step condition did not compelte because of an error"
        data={data}
        errors={errors}
      />
    </div>
  );
};
