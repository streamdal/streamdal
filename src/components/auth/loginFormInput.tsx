import type React from "react";
import type { InputHTMLAttributes } from "react";
import { CustomFlowbiteTheme, Label, TextInput } from "flowbite-react";

export type FormInputProps = {
  name: string;
  label: string;
  error?: any;
  register: any;
  row?: boolean;
  margin?: string;
};

export const LoginFormInput = ({
  name,
  label,
  error,
  register,
  row,
  margin = "mb-4",
  ...props
}: FormInputProps & InputHTMLAttributes<string>) => {
  const customTheme: CustomFlowbiteTheme["textInput"] = {
    field: {
      input: {
        colors: {
          gray: "focus:border-purple-500 focus:ring-purple-500",
        },
      },
    },
  };
  return (
    <div
      className={`flex flex-col ${margin} w-full w-[200px] md:max-2xl:w-[450px]`}
    >
      <div className={`flex ${row ? "flex-row" : "flex-col"} mb-2 block`}>
        <Label
          className="text-stormCloud font-medium text-[14px] leading-[18px]"
          htmlFor={name}
          value={label}
        />
        <TextInput
          type="email"
          theme={customTheme}
          // className={`border-${error ? "streamdalRed" : ""}`}
          {...register(name)}
          {...props}
        />
      </div>
      <div className="text-[12px] mt-1 font-semibold text-streamdalRed">
        {error}
      </div>
    </div>
  );
};
