import React from "react";

export type FormInputProps = {
  name: string;
  label: string;
  register: any;
  error: any;
};

export const FormInput = ({
  name,
  label,
  register,
  error,
  ...props
}: FormInputProps) => {
  return (
    <div className="flex flex-col mb-4">
      <label
        className="text-stormCloud font-medium text-[14px] leading-[18px]"
        htmlFor={name}
      >
        {label}
      </label>
      <input
        className={`rounded-sm border outline-0 mt-2 px-2 h-[47px] text-[14px] border-${
          error ? "streamdalRed" : ""
        }`}
        {...register(name)}
        {...props}
      />

      <div className="text-[12px] mt-1 font-semibold text-streamdalRed">
        {error}
      </div>
    </div>
  );
};
