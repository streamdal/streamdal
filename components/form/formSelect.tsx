import { ErrorType } from "./validate.ts";

export type FormSelectProps = {
  name: string;
  value: string;
  placeHolder?: string;
  label?: string;
  errors: ErrorType;
  children: React.ReactNode;
  onChange: (value: string) => void;
  inputClass?: string;
  wrapperClass?: string;
};

export const FormSelect = ({
  name,
  value,
  errors,
  label,
  onChange,
  children,
  placeHolder,
  inputClass,
  wrapperClass,
}: FormSelectProps) => {
  return (
    <div class={`flex flex-col ${wrapperClass}`}>
      {label && (
        <label htmlFor={name} className={"text-xs ml-2"}>
          {label}
        </label>
      )}
      <select
        id={name}
        name={name}
        class={`rounded-sm border outline-0 mt-2 px-2 pe-6 h-[47px] border-${
          errors[name] ? "streamdalRed" : "twilight"
        } ${inputClass}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeHolder}
      >
        {children}
      </select>

      <div className="text-[12px] mt-1 font-semibold text-streamdalRed">
        {errors[name]}
      </div>
    </div>
  );
};
