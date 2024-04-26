import { useState } from "preact/hooks";
import { SchemaType } from "root/routes/schema/[id]/index.tsx";
import { Audience } from "streamdal-protos/protos/sp_common.ts";
import IconWindowMaximize from "tabler-icons/tsx/window-maximize.tsx";
import IconWindowMinimize from "tabler-icons/tsx/window-minimize.tsx";
import IconX from "tabler-icons/tsx/x.tsx";
import { Tooltip } from "../components/tooltip/tooltip.tsx";
import { humanDateFormat } from "root/lib/utils.ts";

const SchemaDate = (
  { updatedDate }: { updatedDate?: string },
) => {
  try {
    return (
      updatedDate
        ? (
          <img
            class="ml-2"
            alt="Schema Version"
            src={`https://img.shields.io/badge/updated-${
              new Date(updatedDate).toLocaleDateString(
                "en-us",
                humanDateFormat,
              )
            }-4595e6`}
          />
        )
        : null
    );
  } catch (e) {
    console.error("error getting schema updated date", e);
  }
  return null;
};

export const Schema = (
  { audience, schema }: { audience: Audience; schema: SchemaType },
) => {
  const [fullScreen, setFullScreen] = useState(false);

  return (
    <div
      className={`flex flex-col h-screen ${
        fullScreen ? "z-[51] absolute top-0 bottom-0 left-0 right-0" : ""
      }`}
    >
      {!fullScreen && (
        <div className="h-46 w-full bg-streamdalPurple p-4 text-white font-semibold text-sm">
          <span className="opacity-50">Home</span> / Schema
        </div>
      )}
      <div
        class={`flex h-full flex-col bg-white px-12`}
      >
        <div
          class={`flex flew-row item-center my-4 mt-6 justify-between text-3xl font-medium`}
        >
          <div class="flex flex-row items-center justify-start">
            <span class="mr-1">Schema</span>
            <span class="text-streamdalPurple">{audience.operationName}</span>
          </div>

          <div class="flex flex-row items-center justify-end">
            <div
              className="bg-streamdalPurple ml-2 flex h-[36px] w-[36px] cursor-pointer items-center justify-center rounded-[50%]"
              data-tooltip-target="tail-fullscreen"
              onClick={() => setFullScreen(!fullScreen)}
            >
              {fullScreen
                ? <IconWindowMinimize class="h-6 w-6 text-white" />
                : <IconWindowMaximize class="h-6 w-6 text-white" />}
              <Tooltip
                targetId="tail-fullscreen"
                message={fullScreen ? "Smaller" : "Fullscreen"}
              />
            </div>

            <a href="/" f-partial="/partials">
              <div
                className="bg-streamdalPurple ml-2 flex h-[36px] w-[36px] cursor-pointer items-center justify-center rounded-[50%]"
                data-tooltip-target="schema-close"
              >
                <IconX class="w-6 h-6 text-white pointer-events-none" />
                <Tooltip targetId="schema-close" message="Close Schema" />
              </div>
            </a>
          </div>
        </div>
        <div
          class={`flex flex-col ${
            fullScreen ? "h-[calc(100vh-120px)]" : "h-[calc(100vh-240px)]"
          } dark-scrollbar overflow-y-scroll rounded-md bg-black text-white p-4`}
        >
          <div class="flex flex-row justify-start items-center mb-2">
            <img
              alt="Schema Version"
              src={`https://img.shields.io/badge/version-${schema?.version}-956CFF`}
            />
            <SchemaDate
              updatedDate={schema?.lastUpdated}
            />
          </div>
          <pre className={"h-[150px]"}>
          <code>
            <div
                class={"font-sm "}
                dangerouslySetInnerHTML={{__html: schema.schema}}
            >
            </div>
          </code>
          </pre>
        </div>
      </div>
    </div>
  );
};
