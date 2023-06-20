import { CheckCircleIcon } from "@heroicons/react/20/solid";
import React, { useEffect, useRef } from "react";

export const Success = ({ message }: { message?: string }) => {
  const ref = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    ref?.current?.scrollIntoView();
  }, []);
  return (
    <div className="flex flex-row justify-start items-center" ref={ref}>
      <CheckCircleIcon className="mr-1 w-[20px] text-streamdalGreen" />
      <div className="text-streamdalGreen text-xs-[14px] font-medium leading-[20px] ">
        {message || "Success!"}
      </div>
    </div>
  );
};
