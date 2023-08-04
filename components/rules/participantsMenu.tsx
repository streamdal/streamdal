import { PipelineInfo } from "https://deno.land/x/snitch_protos@v0.0.56/protos/info.ts";
import {  Edit, Info, Pause, Silence  } from "../icons/crud.tsx";
import IconDots from "tabler-icons/tsx/dots.tsx";
import {  useState  } from "https://esm.sh/stable/preact@10.15.1/denonext/hooks.js";
import { pausePipeline } from "../../lib/fetch.ts";

export const NodeMenu = ({ data }: { data: PipelineInfo }) => {
  const [isOpen, setIsOpen] = useState();

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
        id={`flow-${data?.audience?.operationName}`}
        className={`z-40 bg-white divide-y divide-gray-100 rounded-lg shadow w-[200px] dark:bg-gray-700 top-20 absolute ${
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
          {data?.audience && (
            <a
              href={`/${encodeURIComponent(data.audience.serviceName)}/${
                encodeURIComponent(data.audience.componentName)
              }/${
                data.audience.operationType === 1
                  ? encodeURIComponent("consumer")
                  : encodeURIComponent("producer")
              }/${encodeURIComponent(data.audience.operationName)}`}
            >
              <li className="flex w-full flex-start py-2 px-2 hover:bg-sunset text-sm">
                <Info className="w-4 text-web mx-1" />
                More Information
              </li>
            </a>
          )}
          <button class="w-full">
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
