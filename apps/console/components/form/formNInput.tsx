import { ErrorType, resolveValue } from "./validate.ts";
import { useState } from "preact/hooks";
import IconTrash from "tabler-icons/tsx/trash.tsx";
import IconPlus from "tabler-icons/tsx/plus.tsx";
import { Tooltip } from "../tooltip/tooltip.tsx";
import { FormInput } from "./formInput.tsx";

export type FormNInputProps = {
  name: string;
  data: any;
  setData: (data: any) => void;
  label?: string;
  placeHolder?: string;
  errors: ErrorType;
};

/**
 * Re-usable n+1 input widget
 */
export const FormNInput = ({
  name,
  data,
  setData,
  errors,
  label,
  placeHolder,
}: FormNInputProps) => {
  const value = resolveValue(data, name);
  const length = value?.length || 1;

  const [inputs, setInputs] = useState(Array.from({ length }, (v, k) => k));

  return (
    <div className="flex flex-col mb-2 border rounded-sm px-2 w-full">
      {inputs.map((i) => (
        <div
          className="flex flex-row justify-between items-center w-full"
          key={`n-input-key-${i}`}
        >
          <FormInput
            name={`${name}.${i}`}
            data={data}
            setData={setData}
            label={label}
            errors={errors}
            placeHolder={placeHolder}
            inputClass="w-full"
            wrapperClass="w-full"
          />
          {inputs.length > 1 &&
            (
              <IconTrash
                class="w-5 h-5 mt-3 ml-2 text-eyelid cursor-pointer"
                onClick={() => setInputs(inputs.filter((index) => index !== i))}
              />
            )}
          <IconPlus
            data-tooltip-target={`input-add-${i}`}
            class="w-5 h-5 mt-3 ml-2 cursor-pointer"
            onClick={() => setInputs([...inputs, inputs.length])}
          />
          <Tooltip targetId={`input-add-${i}`} message={`Add a ${label}`} />
        </div>
      ))}
    </div>
  );
};
