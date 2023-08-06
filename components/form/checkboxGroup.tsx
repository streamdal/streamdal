import { ErrorType, parsePath, resolveValue, updateData } from "./validate.ts";
import { isNumeric, titleCase } from "../../lib/utils.ts";

export type CheckboxGroupProps = {
  name: string;
  data: any;
  setData: (data: any) => void;
  options: any;
  label?: string;
  errors: ErrorType;
  inputClass?: string;
  wrapperClass?: string;
};

export const CheckboxGroup = ({
  name,
  data,
  setData,
  options,
  errors,
  label,
  inputClass,
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
        class={`flex flex-col p-2 rounded-sm border border-${
          errors[name] ? "streamdalRed" : "twilight"
        }  `}
      >
        {Object.entries(options).filter((
          [k, _],
        ) => k !== "0" && isNumeric(k)).map(([k, v], i) => {
          const path = `${name}[${i}]`;
          return (
            <div class="flex flex-row items-center">
              <input
                type="checkbox"
                id={path}
                name={path}
                className={`w-4 h-4 rounded border mx-2 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2 ${inputClass}`}
                value={k}
                onChange={(e) =>
                  updateData(
                    data,
                    setData,
                    parsePath(path),
                    e.target.value,
                  )}
              />
              <label class="text-web font-medium text-[14px]">
                {titleCase(v)}
              </label>
            </div>
          );
        })}
      </div>
      <div className="text-[12px] mt-1 font-semibold text-streamdalRed">
        {errors[name]}
      </div>
    </div>
  );
};
