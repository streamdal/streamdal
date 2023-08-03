import { ErrorType } from "./validate.ts";

export type FormInputProps = {
  name: string;
  value: string;
  placeHolder?: string;
  errors: ErrorType;
  onChange: (value: string) => void;
  inputClass?: string;
  wrapperClass?: string;
};

export const FormInput = ({
  name,
  value,
  errors,
  onChange,
  placeHolder,
  inputClass,
  wrapperClass,
}: FormInputProps) => {
  return (
    <div class={`flex flex-col ${wrapperClass}`}>
      <input
        id={name}
        name={name}
        class={`rounded-sm border border-${
          errors[name] ? "streamdalRed" : "white"
        } ${inputClass}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeHolder}
        size={value.length}
      />

      <div className="text-[12px] mt-1 font-semibold text-streamdalRed">
        {errors[name]}
      </div>
    </div>
  );
};
