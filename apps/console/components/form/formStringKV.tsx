import { ErrorType, resolveValue } from "../form/validate.ts";
import { useState } from "preact/hooks";
import IconTrash from "tabler-icons/tsx/trash.tsx";
import IconPlus from "tabler-icons/tsx/plus.tsx";
import { Tooltip } from "../tooltip/tooltip.tsx";
import IconInfoCircle from "tabler-icons/tsx/info-circle.tsx";
import { ChangeEvent } from "react";

export type FormKVType = {
  name: string;
  label: string;
  description: string;
  data: any;
  errors: ErrorType;
};

/**
 * A re-usable component to generate an object/map of string key value pairs.
 * These will be serialized to protos like so:
 *
 *    thing: {
 *         [key: string]: string;
 *     };
 */
export const FormStringKV = (
  { name, label, description, data, errors }: FormKVType,
) => {
  const existingData = resolveValue(data, name);
  const [pairs, setPairs] = useState(
    Object.entries(
      !existingData || Object.keys(existingData)?.length === 0
        ? { "": "" }
        : existingData,
    ),
  );

  return (
    <div class="my-2">
      <div class="flex flex-row justify-start items-center mb-1">
        <label
          className={`text-xs `}
        >
          {label}
        </label>
        <IconInfoCircle
          class="w-4 h-4 ml-1"
          data-tooltip-target={`${name}-tooltip`}
        />
        <Tooltip
          targetId={`${name}-tooltip`}
          message={description}
        />
      </div>
      <div className="flex flex-col mb-2 border rounded-sm px-2 w-full">
        {pairs.map(([k, v], i) => {
          return (
            <div
              className="flex flex-row justify-between items-center w-full"
              key={`${name}-key-${i}`}
            >
              <div className="flex flex-row justify-start items-start w-[80%]">
                <div class={`flex flex-col mr-4 my-2 w-[50%]`}>
                  <label
                    className={`text-xs mb-[3px] `}
                  >
                    Key
                  </label>
                  <input
                    className={`rounded-sm border outline-0 px-2 pe-6 h-[47px] border-twilight `}
                    value={k}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setPairs(
                        pairs.map(([k, v], ki) =>
                          ki === i ? [e.currentTarget.value, v] : [k, v]
                        ),
                      )}
                    placeholder="key"
                  />
                  <div className="text-[12px] mt-1 font-semibold text-streamdalRed">
                  </div>
                </div>
                <div class={`flex flex-col mr-4 my-2 w-[50%]`}>
                  <label
                    className={`text-xs mb-[3px] `}
                  >
                    Value
                  </label>
                  <input
                    {...k && { name: `${name}.${k}` }}
                    className={`rounded-sm border outline-0 px-2 pe-6 h-[47px] border-twilight ${
                      errors[`${name}.${k}`] && "border-streamdalRed"
                    } `}
                    value={v as string}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setPairs(
                        pairs.map(([k, v], ki) =>
                          ki === i ? [k, e.currentTarget.value] : [k, v]
                        ),
                      )}
                    disabled={!k}
                    placeholder={k ? "value" : "enter key first"}
                  />
                  <div className="text-[12px] mt-1 font-semibold text-streamdalRed">
                    <div className="text-[12px] mt-1 font-semibold text-streamdalRed">
                      {errors[`${name}.${k}`]}
                    </div>
                  </div>
                </div>
              </div>

              <IconTrash
                class="w-5 h-5 mt-3 ml-2 text-eyelid cursor-pointer"
                onClick={() =>
                  pairs.length === 1
                    ? setPairs([["", ""]])
                    : setPairs(pairs.filter((_, index) => index !== i))}
              />
              <IconPlus
                data-tooltip-target={`${name}-add-${i}`}
                class="w-5 h-5 mt-3 mx-2 cursor-pointer"
                onClick={() => setPairs([...pairs, ["", ""]])}
              />
              <Tooltip
                targetId={`${name}-add-${i}`}
                message={`Add ${label}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
