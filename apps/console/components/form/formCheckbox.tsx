import { useState } from "preact/hooks";

export type FormCheckboxType = {
  value: string;
  display: string;
  path: string;
  defaultChecked: boolean;
};

export const FormCheckbox = ({
  value,
  display,
  path,
  defaultChecked,
}: FormCheckboxType) => {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div class="flex flex-row items-center">
      <input
        type="checkbox"
        id={path}
        name={path}
        className={`w-4 h-4 rounded border mx-2 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2`}
        value={value}
        checked={checked}
        onChange={() => setChecked(!checked)}
      />
      <label class="text-web font-medium text-[14px]">
        {display}
      </label>
    </div>
  );
};
