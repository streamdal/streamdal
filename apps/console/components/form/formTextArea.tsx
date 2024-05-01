import { ErrorType, parsePath, resolveValue, updateData } from "./validate.ts";
import { ChangeEvent } from "react";

export type FormInputProps = {
  name: string;
  data: any;
  setData: (data: any) => void;
  label?: string;
  placeHolder?: string;
  errors: ErrorType;
  inputClass?: string;
  wrapperClass?: string;
  value?: string;
  rows?: number;
};

export const FormTextArea = ({
  name,
  data,
  setData,
  errors,
  label,
  placeHolder,
  inputClass,
  wrapperClass,
  value,
  rows = 5,
}: FormInputProps) => {
  const v = value || resolveValue(data, name);

  return (
    <div class={`flex flex-col my-2 ${wrapperClass}`}>
      {label && (
        <label
          htmlFor={name}
          className={`text-xs mb-[3px] ${errors[name] && "text-streamdalRed"}`}
        >
          {label}
        </label>
      )}

      <textarea
        rows={rows}
        id={name}
        name={name}
        class={`resize-y rounded-sm border outline-0 p-2 pe-6 min-h-[${
          rows * 27
        }px] ${
          errors[name] ? "border-streamdalRed" : "border-twilight"
        } ${inputClass}`}
        value={v}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
          updateData(
            data,
            setData,
            parsePath(name),
            e.currentTarget.value,
          )}
        placeholder={placeHolder}
      />

      <div className="text-[12px] mt-1 font-semibold text-streamdalRed">
        {errors[name]}
      </div>
    </div>
  );
};
