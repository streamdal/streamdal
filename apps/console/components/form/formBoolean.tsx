import { useState } from "preact/hooks";

export type FormCheckboxType = {
  name: string;
  display: string;
  defaultChecked: boolean;
};

export const FormBoolean = ({
  name,
  display,
  defaultChecked,
}: FormCheckboxType) => {
  const [checked, setChecked] = useState(defaultChecked);
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
      <label class="text-web font-medium text-[14px]">
        {display}
      </label>
    </div>
  );
};
