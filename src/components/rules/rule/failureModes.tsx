import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { FailureMode } from "./failureMode";

export const FailureModes = ({
  ruleIndex,
  rule,
  register,
  control,
  errors,
}: {
  ruleIndex: number;
  rule: any;
  register: any;
  control: any;
  errors: any;
}) => {
  const [modes, setModes] = useState(
    rule?.failure_mode_configs?.length
      ? rule.failure_mode_configs.map((f: any, i: number) => (
          <FailureMode
            ruleIndex={ruleIndex}
            failureMode={f}
            index={i}
            register={register}
            control={control}
            errors={errors}
          />
        ))
      : [
          <FailureMode
            ruleIndex={ruleIndex}
            failureMode={{}}
            index={0}
            register={register}
            control={control}
            errors={errors}
          />,
        ]
  );

  return (
    <div className="flex flex-col mb-2">
      <div className="text-stormCloud font-medium text-[14px] leading-[18px]">
        Failure Modes
      </div>
      <div className="flex flex-col my-2 border rounded-sm">
        {modes?.length ? (
          modes?.map((m: any, i: number) => (
            <div className="border-b" key={`failure-modes-key-${i}`}>
              <div className="flex flex-row justify-between text-stormCloud font-medium text-[14px] leading-[18px] bg-sunset p-2">
                Failure Mode {i + 1}.
                <XMarkIcon
                  className="text-stormCloud w-[20px] cursor-pointer"
                  onClick={() =>
                    setModes(
                      modes.filter((a: any, index: number) => i !== index)
                    )
                  }
                />
              </div>
              <div className="flex flex-row justify-between items-start w-full px-2">
                {m}
              </div>
            </div>
          ))
        ) : (
          <div className="p-2 border-b">No failure modes found</div>
        )}
        <div className="w-full my-2 flex justify-end">
          <input
            type="button"
            className="flex justify-center btn-secondary h-10 cursor-pointer w-36"
            value="+ Add Failure Mode"
            onClick={() =>
              setModes([
                ...(modes ? modes : []),
                <FailureMode
                  ruleIndex={ruleIndex}
                  failureMode={{}}
                  index={modes?.length || 0}
                  register={register}
                  control={control}
                  errors={errors}
                />,
              ])
            }
          />
        </div>
      </div>
    </div>
  );
};
