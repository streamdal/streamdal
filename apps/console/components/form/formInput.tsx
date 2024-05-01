import { ErrorType, parsePath, resolveValue, updateData } from "./validate.ts";
import { ChangeEvent } from "react";

export type FormInputProps = {
  name: string;
  data: any;
  setData: (data: any) => void;
  label?: string;
  placeHolder?: string;
  errors: ErrorType | null;
  inputClass?: string;
  wrapperClass?: string;
};

export const FormInput = ({
  name,
  data,
  setData,
  errors,
  label,
  placeHolder,
  inputClass,
  wrapperClass,
}: FormInputProps) => {
  const value = resolveValue(data, name);

  return (
    <div class={`flex flex-col my-2 ${wrapperClass}`}>
      {label && (
        <label
          htmlFor={name}
          className={`text-xs mb-[3px] ${
            errors && errors[name] && "text-streamdalRed"
          }`}
        >
          {label}
        </label>
      )}
      <input
        id={name}
        name={name}
        class={`rounded-sm border outline-0 px-2 pe-6 h-[47px] ${
          errors && errors[name] ? "border-streamdalRed" : "border-twilight"
        } ${inputClass}`}
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          updateData(
            data,
            setData,
            parsePath(name),
            e.currentTarget.value,
          )}
        placeholder={placeHolder}
        size={value?.length}
      />

      <div className="text-[12px] mt-1 font-semibold text-streamdalRed">
        {errors ? errors[name] : null}
      </div>
    </div>
  );
};
