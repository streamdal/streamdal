import { ErrorType, resolveValue } from "./validate.ts";
import { useState } from "preact/hooks";
import IconInfoCircle from "tabler-icons/tsx/info-circle.tsx";
import { Tooltip } from "../../components/tooltip/tooltip.tsx";

export type RadioGroupProps = {
  name: string;
  data: any;
  options: { [k: number]: string };
  errors: ErrorType;
  wrapperClass?: string;
  tooltip?: string;
};

export const RadioGroup = ({
  name,
  data,
  options,
  errors,
  wrapperClass,
  tooltip,
}: RadioGroupProps) => {
  const [selected, setSelected] = useState(resolveValue(data, name) || 0);

  return (
    <div class={`flex flex-col border rounded my-2 pt-2 px-2 pb-1 w-full`}>
      <div
        class={`flex flex-row justify-start items-center ${wrapperClass}`}
      >
        {Object.entries(options).map(([k, v]) => {
          return (
            <div class="flex flex-row items-center">
              <input
                type="radio"
                name={name}
                className={`w-4 h-4 rounded border mr-1 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2`}
                value={k}
                checked={selected == k}
                onChange={() => setSelected(k)}
              />
              <label className="text-web font-medium text-[14px] mr-4">
                {v}
              </label>
            </div>
          );
        })}
        {tooltip && (
          <div>
            <IconInfoCircle
              class="w-4 h-4 ml-1"
              data-tooltip-target={`radio-tooltip`}
            />
            <Tooltip
              targetId={`radio-tooltip`}
              message={tooltip}
            />
          </div>
        )}
      </div>
      <div className="text-[12px] mt-1 font-semibold text-streamdalRed">
        {errors[name]}
      </div>
    </div>
  );
};
