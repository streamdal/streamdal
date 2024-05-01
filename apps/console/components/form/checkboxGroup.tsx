import { ErrorType, resolveValue } from "./validate.ts";
import { isNumeric, titleCase } from "../../lib/utils.ts";
import { FormCheckbox } from "./formCheckbox.tsx";

export type CheckboxGroupProps = {
  name: string;
  data: any;
  options: any;
  label?: string;
  errors: ErrorType;
  wrapperClass?: string;
};

//
// This may not be generally re-usable as it's currently built around our standard
// proto option enum structure. See PipelineStepCondition, DetectiveType,
// TransformType, etc.
export const CheckboxGroup = ({
  name,
  data,
  options,
  errors,
  label,
  wrapperClass,
}: CheckboxGroupProps) => {
  return (
    <div class={`flex flex-col ${wrapperClass}`}>
      {label && (
        <label
          className={`text-xs mb-[3px] ${errors[name] && "text-streamdalRed"}`}
        >
          {label}
        </label>
      )}
      <div
        class={`flex flex-col p-2 rounded-sm border ${
          errors[name] ? "border-streamdalRed" : "border-twilight"
        }`}
      >
        {Object.entries(options).filter((
          [k, _],
        ) => k !== "0" && isNumeric(k)).map(([k, v], i) => {
          const path = `${name}[${i}]`;
          const selected = resolveValue(data, name);
          return (
            <FormCheckbox
              path={path}
              value={k}
              display={titleCase(v).replace("_", " ")}
              defaultChecked={Array.isArray(selected) &&
                selected.includes(Number(k))}
            />
          );
        })}
      </div>
      <div className="text-[12px] mt-1 font-semibold text-streamdalRed">
        {errors[name]}
      </div>
    </div>
  );
};
