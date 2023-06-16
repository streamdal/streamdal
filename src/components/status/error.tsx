import { ExclamationCircleIcon } from "@heroicons/react/20/solid";
import React from "react";

export const Error = ({ error }: { error: string }) => (
  <div className="flex flex-row justify-start align-middle mt-4">
    <ExclamationCircleIcon
      className="mr-2 w-[20px] text-streamdalRed"
      aria-hidden="true"
    />
    <span className="text-streamdalRed text-xs-[14px] font-medium leading-[18px] ">
      {error}
    </span>
  </div>
);
