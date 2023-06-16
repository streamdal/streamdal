import { CheckCircleIcon } from "@heroicons/react/20/solid";
import React from "react";

export const Success = ({ message }: { message?: string }) => (
  <div className="flex flex-row justify-start items-center">
    <CheckCircleIcon className="mr-1 w-[20px] text-streamdalGreen" />
    <div className="text-streamdalGreen text-xs-[14px] font-medium leading-[20px] ">
      {message || "Success!"}
    </div>
  </div>
);
