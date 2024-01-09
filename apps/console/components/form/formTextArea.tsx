import { ErrorType, parsePath, resolveValue, updateData } from "./validate.ts";

export type FormInputProps = {
  name: string;
  data: any;
  setData: (data: any) => void;
  label?: string;
  placeHolder?: string;
  errors: ErrorType;
  inputClass?: string;
  wrapperClass?: string;
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
  rows = 5,
}: FormInputProps) => {
  const value = resolveValue(data, name);

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
        }px] border-${
          errors[name] ? "streamdalRed" : "border-twilight"
        } ${inputClass}`}
        value={value}
        onChange={(e) =>
          updateData(
            data,
            setData,
            parsePath(name),
            e.target.value,
          )}
        placeholder={placeHolder}
      />

      <div className="text-[12px] mt-1 font-semibold text-streamdalRed">
        {errors[name]}
      </div>
    </div>
  );
};
