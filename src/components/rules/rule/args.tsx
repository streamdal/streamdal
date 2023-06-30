import React, { useState } from "react";
import { RuleArg } from "./arg";
import { XMarkIcon } from "@heroicons/react/20/solid";

export const RuleArgs = ({
  register,
  control,
  ruleIndex,
  allowMultiple = true,
}: {
  register: any;
  control: any;
  ruleIndex: number;
  allowMultiple?: boolean;
}) => {
  const [args, setArgs] = useState([
    <RuleArg
      ruleIndex={ruleIndex}
      index={0}
      register={register}
      control={control}
    />,
  ]);

  return (
    <div className="flex flex-col mb-2">
      <div className="mb-2 text-stormCloud font-medium text-[14px] leading-[18px]">
        Field Match Args
      </div>
      <div className="flex flex-col mb-2 border rounded-sm px-2">
        {args.map((a, i) => (
          <div
            className="flex flex-row justify-between align-middle w-full"
            key={`rule-arg-key-${i}`}
          >
            {a}
            {args.length > 1 && (
              <XMarkIcon
                className="ml-2 text-stormCloud w-[20px] cursor-pointer"
                onClick={() =>
                  setArgs(args.filter((a: any, index: number) => i !== index))
                }
              />
            )}
          </div>
        ))}
        {allowMultiple && (
          <div className="w-full my-2 flex justify-end">
            <input
              type="button"
              className="flex justify-center btn-secondary h-10 cursor-pointer"
              value="+ Add Arg"
              onClick={() =>
                setArgs([
                  ...args,
                  <RuleArg
                    ruleIndex={ruleIndex}
                    register={register}
                    control={control}
                    index={args.length}
                  />,
                ])
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};
