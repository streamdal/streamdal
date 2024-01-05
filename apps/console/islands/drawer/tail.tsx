import { Audience } from "streamdal-protos/protos/sp_common.ts";
import { OP_MODAL_WIDTH } from "./infoDrawer.tsx";
import IconPlayerPauseFilled from "tabler-icons/tsx/player-pause-filled.tsx";
import IconPlayerPlayFilled from "tabler-icons/tsx/player-play-filled.tsx";
import IconWindowMinimize from "tabler-icons/tsx/window-minimize.tsx";
import IconWindowMaximize from "tabler-icons/tsx/window-maximize.tsx";
import IconX from "tabler-icons/tsx/x.tsx";
import IconColumns1 from "tabler-icons/tsx/columns-1.tsx";
import IconColumns2 from "tabler-icons/tsx/columns-2.tsx";

import { useEffect, useRef, useState } from "preact/hooks";
import { signal, useSignalEffect } from "@preact/signals";
import { longDateFormat } from "../../lib/utils.ts";
import { tailSocket } from "../../lib/sockets.ts";
import { Tooltip } from "../../components/tooltip/tooltip.tsx";
import { initFlowbite } from "flowbite";

export const MAX_TAIL_SIZE = 200;

export type TailSampleRate = {
  rate: number;
  intervalSeconds: number;
};

export const tailSignal = signal<TailData[] | null>(
  null,
);
export const tailSocketSignal = signal<Websocket | null>(null);
export const tailEnabledSignal = signal<boolean>(false);
export const tailPausedSignal = signal<boolean>(false);
export const defaultTailSampleRate = {
  rate: 25,
  intervalSeconds: 1,
};
export const tailSamplingSignal = signal<TailSampleRate>(defaultTailSampleRate);
export const tailDiffSignal = signal<boolean>(false);

export type TailData = { timestamp: Date; data: string; originalData: string };

export const TailRow = (
  { row }: { row: TailData },
) => {
  return (
    <div className="bg-black text-white py-2 px-4 text-sm flex flex-col justify-start dark-scrollbar border-b border-stormCloud">
      <div className="text-stormCloud w-full">
        {row.timestamp?.toLocaleDateString(
          "en-us",
          longDateFormat,
        )}
      </div>
      <div class="flex flex-row justify-between item-center w-full">
        <div
          class={`${tailDiffSignal.value && "w-[49%]"} overflow-x-scroll`}
        >
          {tailDiffSignal.value && (
            <div className="text-stormCloud text-sm">
              After:
            </div>
          )}
          <pre>
              <code>
                <div
                  dangerouslySetInnerHTML={{
                    __html: row.data,
                  }}
                >
                </div>
              </code>
          </pre>
        </div>
        {tailDiffSignal.value && (
          <div class="w-[49%] overflow-x-scroll">
            <div className="text-stormCloud text-sm">
              Before:
            </div>
            <div class="opacity-50">
              <pre>
                <code>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: row.originalData,
                    }}
                  >
                  </div>
                </code>
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const Tail = ({ audience }: { audience: Audience }) => {
  const scrollBottom = useRef();
  const [fullScreen, setFullScreen] = useState(false);

  const start = () => {
    if (
      tailSocketSignal.value == null ||
      tailSocketSignal.value?.readyState === WebSocket.CLOSED
    ) {
      tailSocketSignal.value = tailSocket("/ws/tail", audience);
    }
  };

  const stop = () => {
    tailSocketSignal.value?.close();
  };

  useEffect(() => {
    tailSignal.value = [];
    tailPausedSignal.value = false;
    const togglePause = () => {
      tailPausedSignal.value = document.visibilityState !== "visible";
    };
    document.addEventListener("visibilitychange", togglePause);

    return () => {
      stop();
      tailSignal.value = [];
      document.removeEventListener("visibilitychange", togglePause);
    };
  }, []);

  useSignalEffect(() => {
    if (tailPausedSignal.value) {
      stop();
    } else {
      start();
    }
  });

  useEffect(() => {
    scrollBottom.current &&
      scrollBottom.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start",
      });
  }, [tailSignal.value]);

  useEffect(() => {
    initFlowbite();
  }, [tailPausedSignal.value, tailDiffSignal.value, fullScreen]);

  return (
    <div
      class={`relative flex flex-col h-screen w-[calc(100vw-${OP_MODAL_WIDTH})]`}
    >
      <div class="h-46 w-full bg-streamdalPurple p-4 text-white font-semibold text-sm">
        <span class="opacity-50">Home</span> / Tail
      </div>
      <div
        class={`h-full flex flex-col bg-white p-4 ${
          fullScreen
            ? "absolute top-0 bottom-0 right-0 left-0 z-[51] w-screen h-screen"
            : ""
        }`}
      >
        <div
          class={`flex flew-row justify-between item-center mt-6 my-4 mx-auto text-3xl font-medium w-[${
            fullScreen ? "100" : "90"
          }%]`}
        >
          <div class="flex flex-row justify-start items-center">
            <span class="mr-1">Tail</span>
            <span class="text-streamdalPurple">{audience.operationName}</span>
          </div>

          <div class="flex flex-row justify-end items-center">
            <div
              class="flex justify-center items-center w-[36px] h-[36px] rounded-[50%] bg-streamdalPurple cursor-pointer"
              data-tooltip-target="tail-pause-play"
              onClick={() => tailPausedSignal.value = !tailPausedSignal.value}
            >
              {tailPausedSignal.value
                ? <IconPlayerPlayFilled class="w-6 h-6 text-white" />
                : <IconPlayerPauseFilled class="w-6 h-6 text-white" />}
              <Tooltip
                targetId="tail-pause-play"
                message={tailPausedSignal.value ? "Resume Tail" : "Pause Tail"}
              />
            </div>
            <div
              class="ml-2 flex justify-center items-center w-[36px] h-[36px] rounded-[50%] bg-streamdalPurple cursor-pointer"
              data-tooltip-target="tail-diff"
              onClick={() => {
                tailDiffSignal.value = !tailDiffSignal.value;
              }}
            >
              {tailDiffSignal.value
                ? <IconColumns1 class="w-6 h-6 text-white" />
                : <IconColumns2 class="w-6 h-6 text-white" />}
              <Tooltip
                targetId="tail-diff"
                message={`${
                  tailDiffSignal.value ? "Hide" : "Show"
                } before and after data`}
              />
            </div>
            <div
              className="ml-2 flex justify-center items-center w-[36px] h-[36px] rounded-[50%] bg-streamdalPurple cursor-pointer"
              data-tooltip-target="tail-fullscreen"
              onClick={() => setFullScreen(!fullScreen)}
            >
              {fullScreen
                ? <IconWindowMinimize class="w-6 h-6 text-white" />
                : <IconWindowMaximize class="w-6 h-6 text-white" />}
              <Tooltip
                targetId="tail-fullscreen"
                message={fullScreen ? "Smaller" : "Fullscreen"}
              />
            </div>
            <div
              className="ml-2 flex justify-center items-center w-[36px] h-[36px] rounded-[50%] bg-streamdalPurple cursor-pointer"
              data-tooltip-target="tail-close"
              onClick={() => tailEnabledSignal.value = false}
            >
              <IconX class="w-6 h-6 text-white" />
              <Tooltip
                targetId="tail-close"
                message="Close Tail"
              />
            </div>
          </div>
        </div>
        <div
          class={`flex flex-col mx-auto w-[${
            fullScreen ? "100" : "90"
          }%] h-[calc(100vh-${
            fullScreen ? "200" : "260"
          }px)] overflow-y-scroll rounded-md bg-black text-white dark-scrollbar`}
        >
          {tailSignal.value?.map((tail: TailData) => <TailRow row={tail} />)}
          <div ref={scrollBottom} />
        </div>
      </div>
    </div>
  );
};
