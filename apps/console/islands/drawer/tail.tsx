import { Audience } from "streamdal-protos/protos/sp_common.ts";
import { OP_MODAL_WIDTH } from "./infoDrawer.tsx";
import IconPlayerPauseFilled from "tabler-icons/tsx/player-pause-filled.tsx";
import IconPlayerPlayFilled from "tabler-icons/tsx/player-play-filled.tsx";
import IconWindowMinimize from "tabler-icons/tsx/window-minimize.tsx";
import IconWindowMaximize from "tabler-icons/tsx/window-maximize.tsx";
import IconX from "tabler-icons/tsx/x.tsx";
import IconColumns1 from "tabler-icons/tsx/columns-1.tsx";
import IconColumns2 from "tabler-icons/tsx/columns-2.tsx";

import { useEffect, useLayoutEffect, useRef, useState } from "preact/hooks";
import { signal, useSignalEffect } from "@preact/signals";
import { longDateFormat } from "../../lib/utils.ts";
import { tailSocket } from "../../lib/sockets.ts";
import { Tooltip } from "../../components/tooltip/tooltip.tsx";
import { defaultTailSampleRate } from "../../components/modals/tailRateModal.tsx";

export const MAX_TAIL_SIZE = 200;

export type TailSampleRate = {
  rate: number;
  intervalSeconds: number;
};

export const tailSignal = signal<TailData[] | null>(null);
export const tailSocketSignal = signal<WebSocket | null>(null);
export const tailEnabledSignal = signal<boolean>(false);
export const tailPausedSignal = signal<boolean>(false);
export const tailSamplingSignal = signal<TailSampleRate>({
  rate: defaultTailSampleRate.rate,
  intervalSeconds: defaultTailSampleRate.intervalSeconds,
});
export const tailDiffSignal = signal<boolean>(false);

export type TailData = { timestamp: Date; data: string; originalData: string };

export const TailRow = ({ row }: { row: TailData }) => {
  return (
    <div className="dark-scrollbar border-stormCloud flex flex-col justify-start border-b bg-black px-4 py-2 text-sm text-white">
      <div className="text-stormCloud w-full">
        {row.timestamp?.toLocaleDateString("en-us", longDateFormat)}
      </div>
      <div class="item-center flex w-full flex-row justify-between">
        {tailDiffSignal.value && (
          <div class="w-[49%] overflow-x-scroll">
            <div className="text-stormCloud text-sm">Before:</div>
            <div class="opacity-50">
              <pre>
                <code>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: row.originalData,
                    }}
                  ></div>
                </code>
              </pre>
            </div>
          </div>
        )}
        <div class={`${tailDiffSignal.value && "w-[49%]"} overflow-x-scroll`}>
          {tailDiffSignal.value && (
            <div className="text-stormCloud text-sm">After:</div>
          )}
          <pre>
            <code>
              <div
                dangerouslySetInnerHTML={{
                  __html: row.data,
                }}
              ></div>
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
};

export const Tail = ({ audience }: { audience: Audience }) => {
  const scrollBottom = useRef<HTMLDivElement | null>(null);
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

  useEffect(() => {}, [
    tailPausedSignal.value,
    tailDiffSignal.value,
    fullScreen,
  ]);

  useLayoutEffect(async () => {
    const { initFlowbite } = await import("flowbite");
    initFlowbite();
  });

  return (
    <div
      class={`relative flex h-screen flex-col w-[calc(100vw-${OP_MODAL_WIDTH})]`}
    >
      <div class="h-46 bg-streamdalPurple w-full p-4 text-sm font-semibold text-white">
        <span class="opacity-50">Home</span> / Tail
      </div>
      <div
        class={`flex h-full flex-col bg-white p-4 ${
          fullScreen
            ? "absolute bottom-0 left-0 right-0 top-0 z-[51] h-screen w-screen"
            : ""
        }`}
      >
        <div
          class={`flew-row item-center mx-auto my-4 mt-6 flex justify-between text-3xl font-medium w-[${
            fullScreen ? "100" : "90"
          }%]`}
        >
          <div class="flex flex-row items-center justify-start">
            <span class="mr-1">Tail</span>
            <span class="text-streamdalPurple">{audience.operationName}</span>
          </div>

          <div class="flex flex-row items-center justify-end">
            <div
              class="bg-streamdalPurple flex h-[36px] w-[36px] cursor-pointer items-center justify-center rounded-[50%]"
              data-tooltip-target="tail-pause-play"
              onClick={() => (tailPausedSignal.value = !tailPausedSignal.value)}
            >
              {tailPausedSignal.value ? (
                <IconPlayerPlayFilled class="h-6 w-6 text-white" />
              ) : (
                <IconPlayerPauseFilled class="h-6 w-6 text-white" />
              )}
              <Tooltip
                targetId="tail-pause-play"
                message={tailPausedSignal.value ? "Resume Tail" : "Pause Tail"}
              />
            </div>
            <div
              class="bg-streamdalPurple ml-2 flex h-[36px] w-[36px] cursor-pointer items-center justify-center rounded-[50%]"
              data-tooltip-target="tail-diff"
              onClick={() => {
                tailDiffSignal.value = !tailDiffSignal.value;
              }}
            >
              {tailDiffSignal.value ? (
                <IconColumns1 class="h-6 w-6 text-white" />
              ) : (
                <IconColumns2 class="h-6 w-6 text-white" />
              )}
              <Tooltip
                targetId="tail-diff"
                message={`${
                  tailDiffSignal.value ? "Hide" : "Show"
                } before and after data`}
              />
            </div>
            <div
              className="bg-streamdalPurple ml-2 flex h-[36px] w-[36px] cursor-pointer items-center justify-center rounded-[50%]"
              data-tooltip-target="tail-fullscreen"
              onClick={() => setFullScreen(!fullScreen)}
            >
              {fullScreen ? (
                <IconWindowMinimize class="h-6 w-6 text-white" />
              ) : (
                <IconWindowMaximize class="h-6 w-6 text-white" />
              )}
              <Tooltip
                targetId="tail-fullscreen"
                message={fullScreen ? "Smaller" : "Fullscreen"}
              />
            </div>
            <div
              className="bg-streamdalPurple ml-2 flex h-[36px] w-[36px] cursor-pointer items-center justify-center rounded-[50%]"
              data-tooltip-target="tail-close"
              onClick={() => (tailEnabledSignal.value = false)}
            >
              <IconX class="h-6 w-6 text-white" />
              <Tooltip targetId="tail-close" message="Close Tail" />
            </div>
          </div>
        </div>
        <div
          class={`mx-auto flex flex-col w-[${
            fullScreen ? "100" : "90"
          }%] h-[calc(100vh-${
            fullScreen ? "200" : "260"
          }px)] dark-scrollbar overflow-y-scroll rounded-md bg-black text-white`}
        >
          {tailSignal.value?.map((tail: TailData) => <TailRow row={tail} />)}
          <div ref={scrollBottom} />
        </div>
      </div>
    </div>
  );
};
