import { ErrorType, parsePath, resolveValue, updateData } from "./validate.ts";
import { ChangeEvent } from "react";

// An unadorned input for use in non-traditional form placements
export type FormInputProps = {
  name: string;
  data: any;
  setData: (data: any) => void;
  placeHolder?: string;
  errors: ErrorType;
  inputClass?: string;
  wrapperClass?: string;
  defaultValue?: string;
};

export const InlineInput = ({
  name,
  data,
  setData,
  errors,
  placeHolder,
  inputClass,
  wrapperClass,
  defaultValue,
}: FormInputProps) => {
  const value = resolveValue(data, name) || defaultValue;

  return (
    <div class={`flex flex-col ${wrapperClass}`}>
      <input
        id={name}
        name={name}
        class={`px-2 rounded-sm border ${
          errors[name] ? "border-streamdalRed" : "border-white"
        } ${inputClass}`}
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          updateData(data, setData, parsePath(name), e.currentTarget.value)}
        placeholder={placeHolder}
        size={value?.length}
      />

      <div className="text-[12px] mt-1 font-semibold text-streamdalRed">
        {errors[name]}
      </div>
    </div>
  );
};
