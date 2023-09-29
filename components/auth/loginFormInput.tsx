import type React from "react";
import type { InputHTMLAttributes } from "react";

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
  // error,
  // register,
  row,
  margin = "mb-4",
  ...props
}: FormInputProps & InputHTMLAttributes<string>) => {
  return (
    <div className={`flex flex-col ${margin} w-full w-[200px]`}>
      <div className={`flex ${row ? "flex-row" : "flex-col"} mb-1 block`}>
        <div>
          <label
            for={name}
            class="text-sm font-medium text-gray-900"
          >
            {label}
          </label>
          <input
            id={name}
            class="bg-purple-50 border h-10 pl-3 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full"
            required
          />
        </div>
      </div>
    </div>
  );
};
