import { ErrorType, resolveValue } from "../form/validate.ts";
import { useState } from "preact/hooks";
import IconTrash from "tabler-icons/tsx/trash.tsx";
import IconPlus from "tabler-icons/tsx/plus.tsx";
import { Tooltip } from "../tooltip/tooltip.tsx";
import IconInfoCircle from "tabler-icons/tsx/info-circle.tsx";

export type MetadataType = {
  name: string;
  data: any;
  errors: ErrorType;
};

export const MetaData = (
  { name, data, errors }: MetadataType,
) => {
  const existingMetadata = resolveValue(data, name);
  const [metaData, setMetaData] = useState(
    Object.entries(
      !existingMetadata || Object.keys(existingMetadata)?.length === 0
        ? { "": "" }
        : existingMetadata,
    ),
  );

  return (
    <div class="my-2">
      <div class="flex flex-row justify-start items-center mb-1">
        <label
          className={`text-xs `}
        >
          Metadata
        </label>
        <IconInfoCircle
          class="w-4 h-4 ml-1"
          data-tooltip-target={`${name}-metadata-tooltip`}
        />
        <Tooltip
          targetId={`${name}-metadata-tooltip`}
          message="Metadata are arbitrary keys and values that will be emitted to calling code"
        />
      </div>
      <div className="flex flex-col mb-2 border rounded-sm px-2 w-full">
        {metaData.map(([k, v], i) => {
          return (
            <div
              className="flex flex-row justify-between items-center w-full"
              key={`${name}-metadata-key-${i}`}
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
                    onChange={(e) =>
                      setMetaData(
                        metaData.map(([k, v], ki) =>
                          ki === i ? [e.target.value, v] : [k, v]
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
                    value={v}
                    onChange={(e) =>
                      setMetaData(
                        metaData.map(([k, v], ki) =>
                          ki === i ? [k, e.target.value] : [k, v]
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
                  metaData.length === 1
                    ? setMetaData([["", ""]])
                    : setMetaData(metaData.filter((_, index) => index !== i))}
              />
              <IconPlus
                data-tooltip-target={`${name}-metadata-add-${i}`}
                class="w-5 h-5 mt-3 mx-2 cursor-pointer"
                onClick={() => setMetaData([...metaData, ["", ""]])}
              />
              <Tooltip
                targetId={`${name}-metadata-add-${i}`}
                message={`Add metadata`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
