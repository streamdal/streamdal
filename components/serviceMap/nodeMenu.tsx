import { Edit, Info, Pause, Silence } from "../icons/crud.tsx";
import IconDots from "tabler-icons/tsx/dots.tsx";
import { useState } from "preact/hooks";
import { removeWhitespace } from "../../lib/utils.ts";
import { opModal } from "./opModalSignal.ts";
import { Audience } from "snitch-protos/protos/common.ts";
import { Pipeline } from "snitch-protos/protos/pipeline.ts";

export const NodeMenu = ({ audience, attachedPipeline }: {
  audience: Audience;
  attachedPipeline: Pipeline;
}) => {
  const id = removeWhitespace(audience.operationName);
  return (
    <div className={"rounded bg-purple-50 ml-4"}>
      <div
        id={`${id}-button}`}
        data-dropdown-toggle={`${id}-menu`}
        data-dropdown-placement="top"
        type="button"
        class="cursor-pointer"
      >
        <IconDots class="w-6 h-6 text-gray-400" aria-hidden="true" />
      </div>
      <div
        id={`${id}-menu`}
        className={`z-[1002] left-[-100px] top=[-10px] bg-white divide-y divide-gray-100 rounded-lg shadow w-[200px] hidden`}
      >
        <ul
          class="py-2 text-sm text-gray-700"
          aria-labelledby="dropdownButton"
        >
          <a href="/pipelines">
            <li className="flex w-full flex-start px-2 py-2 hover:bg-sunset text-sm">
              <Edit className="text-red mx-2" />
              Edit Pipelines
            </li>
          </a>
          <li className="flex w-full flex-start py-2 px-2 hover:bg-sunset text-sm cursor-not-allowed">
            <Silence className="text-web mx-2" />
            Silence Notifications
          </li>

          <li
            className="flex w-full flex-start py-2 px-2 hover:bg-sunset text-sm cursor-pointer"
            onClick={() => opModal.value = audience}
          >
            <Info className="w-4 text-web mx-1" />
            More Information
          </li>

          <button
            class={`w-full ${
              attachedPipeline ? "cursor-pointer" : "cursor-not-allowed"
            }`}
          >
            <li class="group flex w-full flex-start py-2 px-2 text-eyelid hover:text-white hover:bg-eyelid text-sm">
              <Pause class="w-4 mx-1 text-eyelid group-hover:text-white fill-current" />
              Pause
            </li>
          </button>
        </ul>
      </div>
    </div>
  );
};

export const ServiceNodeMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={"rounded bg-purple-50 ml-4"}>
      <div
        id="dropdownButton"
        type="button"
        class="cursor-pointer"
        onClick={handleClick}
      >
        <IconDots class="w-6 h-6 text-gray-400" aria-hidden="true" />
      </div>
      <div
        id={"flow-service"}
        className={`relative z-40 bg-white divide-y divide-gray-100 rounded-lg shadow w-[200px] top-20 absolute ${
          isOpen ? null : "hidden"
        }`}
      >
        <ul
          class="py-2 text-sm text-gray-700 dark:text-gray-200"
          aria-labelledby="dropdownButton"
        >
          <a href="/pipelines">
            <li className="flex w-full flex-start px-2 py-2 hover:bg-sunset text-sm">
              <Edit className="text-red mx-2" />
              Edit Rules
            </li>
          </a>
          <a href="/slack">
            <li className="flex w-full flex-start py-2 px-2 hover:bg-sunset text-sm">
              <Silence className="text-web mx-2" />
              Silence Notifications
            </li>
          </a>
          <button class="w-full" //todo: pass down envars to browser/move call to route handler
            //   onClick={() => pause(data.pipeline?.id)}
          >
            <li className="group flex w-full flex-start py-2 px-2 text-eyelid hover:text-white hover:bg-eyelid text-sm">
              <Pause className="w-4 mx-1 text-eyelid group-hover:text-white fill-current" />
              Pause
            </li>
          </button>
        </ul>
      </div>
    </div>
  );
};
