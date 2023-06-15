import React, { useState } from "react";
import { RuleArg } from "./arg";
import { EyeIcon, XMarkIcon } from "@heroicons/react/20/solid";

export const RuleArgs = ({
  register,
  errors,
  ruleIndex,
}: {
  register: any;
  errors: any;
  ruleIndex: number;
}) => {
  const [args, setArgs] = useState([
    <RuleArg
      ruleIndex={ruleIndex}
      index={0}
      register={register}
      errors={errors}
    />,
  ]);

  return (
    <div className="flex flex-col">
      <div className="mb-2 text-stormCloud font-medium text-[14px] leading-[18px]">
        Args
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
                  errors={errors}
                  index={args.length}
                />,
              ])
            }
          />
        </div>
      </div>
    </div>
  );
};
