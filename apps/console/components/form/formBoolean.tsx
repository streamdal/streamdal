import { useState } from "preact/hooks";
import { resolveValue } from "./validate.ts";

export type FormCheckboxType = {
  name: string;
  data: any;
  display: string;
};

export const FormBoolean = ({
  name,
  data,
  display,
}: FormCheckboxType) => {
  const value = resolveValue(data, name);
  const [checked, setChecked] = useState(value);

  return (
    <div class="flex flex-row items-center mb-2">
      <input
        type="checkbox"
        id={name}
        name={name}
        className={`w-4 h-4 rounded border mr-2 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2`}
        value={checked}
        checked={checked}
        onChange={() => setChecked(!checked)}
      />
      <label class="text-web font-medium text-[14px] mt-1">
        {display}
      </label>
    </div>
  );
};
