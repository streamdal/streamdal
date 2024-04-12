import { Audience } from "streamdal-protos/protos/sp_common.ts";
import { OP_MODAL_WIDTH } from "root/lib/const.ts";
import IconPlayerPauseFilled from "tabler-icons/tsx/player-pause-filled.tsx";
import IconPlayerPlayFilled from "tabler-icons/tsx/player-play-filled.tsx";
import IconWindowMinimize from "tabler-icons/tsx/window-minimize.tsx";
import IconWindowMaximize from "tabler-icons/tsx/window-maximize.tsx";
import IconColumns1 from "tabler-icons/tsx/columns-1.tsx";
import IconColumns2 from "tabler-icons/tsx/columns-2.tsx";

import { useEffect, useRef, useState } from "preact/hooks";
import { longDateFormat } from "../../lib/utils.ts";
import { tailSocket } from "../../lib/sockets.ts";
import { Tooltip } from "../../components/tooltip/tooltip.tsx";
import { initFlowBite } from "../../components/flowbite/init.tsx";
import {
  TailData,
  tailDiffSignal,
  tailSamplingSignal,
  tailSignal,
} from "root/components/tail/signals.ts";
import { tailRunningSignal } from "../../components/tail/signals.ts";

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
  const [paused, setPaused] = useState(false);
  const socketRef = useRef<WebSocket | null>();

  const start = () => {
    if (
      socketRef.current == null ||
      socketRef.current.readyState === WebSocket.CLOSED
    ) {
      socketRef.current = tailSocket("/ws/tail", audience);
      tailRunningSignal.value = true;
    }
  };

  const stop = () => {
    socketRef.current?.close();
    tailRunningSignal.value = false;
  };

  useEffect(() => {
    void initFlowBite();
    tailSignal.value = [];
    start();
    return () => {
      stop();
      tailSignal.value = [];
    };
  }, []);

  useEffect(() => {
    if (paused) {
      stop();
    } else {
      start();
    }
  }, [paused]);

  useEffect(() => {
    scrollBottom.current &&
      scrollBottom.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start",
      });
  }, [tailSignal.value]);

  useEffect(() => {
    //
    // When the tail sample rate changes, we need to restart the websocket
    if (tailSamplingSignal.value.default === false) {
      stop();
      setTimeout(() => {
      }, 1000);
    }
  }, [tailSamplingSignal.value.rate, tailSamplingSignal.value.intervalSeconds]);

  return (
    <div
      className={`${
        fullScreen ? "absolute top-0" : "relative"
      } flex flex-col h-screen w-full mr-[${OP_MODAL_WIDTH}]`}
    >
      <div className="h-46 w-full bg-streamdalPurple p-4 text-white font-semibold text-sm">
        <span className="opacity-50">Home</span> / Tail
      </div>
      <div
        class={`flex h-full flex-col bg-white p-4 ${
          fullScreen ? "absolute top-0 z-[51] h-screen w-screen" : ""
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
              onClick={() => (setPaused(!paused))}
            >
              {paused
                ? <IconPlayerPlayFilled class="h-6 w-6 text-white" />
                : <IconPlayerPauseFilled class="h-6 w-6 text-white" />}
              <Tooltip
                targetId="tail-pause-play"
                message={paused ? "Resume Tail" : "Pause Tail"}
              />
            </div>
            <div
              class="bg-streamdalPurple ml-2 flex h-[36px] w-[36px] cursor-pointer items-center justify-center rounded-[50%]"
              data-tooltip-target="tail-diff"
              onClick={() => tailDiffSignal.value = !tailDiffSignal.value}
            >
              {tailDiffSignal.value
                ? <IconColumns1 class="h-6 w-6 text-white" />
                : <IconColumns2 class="h-6 w-6 text-white" />}
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
                data-tooltip-target="tail-close"
              >
                <img
                  src="/images/x-white.svg"
                  class="w-[14px]"
                />
                <Tooltip targetId="tail-close" message="Close Tail" />
              </div>
            </a>
          </div>
        </div>
        <div
          class={`mx-auto flex flex-col w-[${
            fullScreen ? "100" : "90"
          }%] h-[calc(100vh-${
            fullScreen ? "0" : "260"
          }px)] dark-scrollbar overflow-y-scroll rounded-md bg-black text-white`}
        >
          {tailSignal.value?.map((tail: TailData) => <TailRow row={tail} />)}
          <div ref={scrollBottom} />
        </div>
      </div>
    </div>
  );
};
