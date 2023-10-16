import { Edit, Info, Silence } from "../icons/crud.tsx";
import { removeWhitespace, serviceKey } from "../../lib/utils.ts";
import { opModal } from "./opModalSignal.ts";
import { Audience } from "streamdal-protos/protos/sp_common.ts";
import { Pipeline } from "streamdal-protos/protos/sp_pipeline.ts";
import { NodeData } from "../../islands/customNodes.tsx";
import IconDots from "tabler-icons/tsx/dots.tsx";
import IconPlayerPause from "tabler-icons/tsx/player-pause.tsx";
import IconLink from "tabler-icons/tsx/link.tsx";
import { Tooltip } from "../tooltip/tooltip.tsx";
import IconUnlink from "tabler-icons/tsx/unlink.tsx";
import { useState } from "preact/hooks";
import IconTrash from "tabler-icons/tsx/trash.tsx";

export const NodeMenu = (
  { audience, attachedPipeline }: {
    audience: Audience;
    attachedPipeline: Pipeline;
  },
) => {
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
          <li
            className="flex w-full flex-start items-center py-2 px-2 hover:bg-sunset text-sm cursor-pointer"
            onClick={() =>
              opModal.value = {
                audience,
                attachedPipeline,
              }}
          >
            <Info className="w-4 text-web mr-2" />
            More Information
          </li>
          {attachedPipeline
            ? (
              <>
                <button
                  className="w-full"
                  onClick={() =>
                    opModal.value = {
                      audience: audience,
                      attachedPipeline: attachedPipeline,
                      pause: true,
                    }}
                >
                  <li className="group flex w-full flex-start items-center py-2 px-2 text-burnt text-sm">
                    <IconPlayerPause class="w-4 mr-2 text-burnt" />
                    Pause Pipeline
                  </li>
                </button>
                <button
                  className="w-full"
                  onClick={() =>
                    opModal.value = {
                      audience: audience,
                      attachedPipeline: attachedPipeline,
                      detach: true,
                    }}
                >
                  <li className="group flex w-full flex-start items-center py-2 px-2 text-burnt text-sm">
                    <IconUnlink class="w-4 mr-2 text-burnt" />
                    Detach Pipeline
                  </li>
                </button>
                <a href={`/pipelines/${attachedPipeline}`}>
                  <li className="flex w-full flex-start items-center px-2 py-2 hover:bg-sunset text-sm">
                    <Edit className="text-red mr-2" />
                    Edit Rules
                  </li>
                </a>
              </>
            )
            : (
              <>
                <button className="w-full">
                  <li
                    className="group flex w-full flex-start items-center py-2 px-2 hover:bg-sunset text-sm"
                    onClick={() =>
                      opModal.value = {
                        audience,
                        attachedPipeline,
                        attach: true,
                      }}
                  >
                    <IconLink class="w-4 mr-2 text-web" />
                    Attach Pipeline
                  </li>
                </button>
                <li
                  data-tooltip-target={`${id}-rule-warning`}
                  className="flex w-full flex-start items-center px-2 py-2 hover:bg-sunset text-sm cursor-not-allowed"
                >
                  <Edit className="text-red mr-2" />
                  Edit Rules
                </li>
                <Tooltip
                  targetId={`${id}-rule-warning`}
                  message="You must attach a pipeline first"
                />
              </>
            )}

          <li className="flex w-full flex-start items-center py-2 px-2 hover:bg-sunset text-sm cursor-not-allowed">
            <Silence className="text-web mr-2" />
            Silence Notifications
          </li>
        </ul>
      </div>
    </div>
  );
};

export const ServiceNodeMenu = ({ data }: { data: NodeData }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={"flex flex-col"}>
      <button
        onClick={() =>
          opModal.value = {
            audience: data?.audience,
            deleteService: true,
          }}
        className={"p-2 rounded"}
      >
        <IconTrash
          class={`w-5 h-5 hover:text-streamdalRed invisible z-50 ${
            trashActive ? "text-streamdalRed" : "text-gray-300"
          } group-hover:visible ${highlight && "visible"}`}
        />
      </button>
      {/*{open && (*/}
      {/*  <div*/}
      {/*    class={`absolute z-[51] left-[-10x] top-[-60px] bg-white divide-y divide-gray-100 rounded-lg shadow w-[200px]`}*/}
      {/*    onMouseLeave={() => setOpen(false)}*/}
      {/*  >*/}
      {/*    <ul*/}
      {/*      class="py-2 text-sm text-gray-700"*/}
      {/*      aria-labelledby="dropdownButton"*/}
      {/*    >*/}
      {/*      <a href="/pipelines">*/}
      {/*        <li className="flex w-full flex-start items-center py-2 px-2 hover:bg-sunset text-sm">*/}
      {/*          <Edit className="text-red mr-2" />*/}
      {/*          Edit Pipelines*/}
      {/*        </li>*/}
      {/*      </a>*/}
      {/*      <li className="flex w-full flex-start items-center py-2 px-2 hover:bg-sunset text-sm cursor-not-allowed">*/}
      {/*        <Silence className="text-web mr-2" />*/}
      {/*        Silence Notifications*/}
      {/*      </li>*/}
      {/*      <li*/}
      {/*        className="flex w-full flex-start items-center py-2 px-2 hover:bg-sunset text-sm cursor-pointer"*/}
      {/*        onClick={() =>*/}
      {/*          opModal.value = {*/}
      {/*            audience: data?.audience,*/}
      {/*            deleteService: true,*/}
      {/*          }}*/}
      {/*      >*/}
      {/*        <IconTrash className="w-4 h-4 text-red mr-2" />*/}
      {/*        Delete Service*/}
      {/*      </li>*/}
      {/*    </ul>*/}
      {/*  </div>*/}
      {/*)}*/}
    </div>
  );
};
