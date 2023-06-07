import { ExclamationCircleIcon } from "@heroicons/react/20/solid";
import React from "react";

export const Error = ({ error }: { error: string }) => (
  <div className="flex flex-row justify-start align-middle">
    <ExclamationCircleIcon
      className="mr-2 w-[20px] text-error"
      aria-hidden="true"
    />
    <span className="text-web">{error}</span>
  </div>
);
