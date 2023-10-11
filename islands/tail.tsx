import { Audience } from "streamdal-protos/protos/sp_common.ts";
import { OP_MODAL_WIDTH } from "./opModal.tsx";
import IconPlayerPauseFilled from "tabler-icons/tsx/player-pause-filled.tsx";
import IconPlayerPlayFilled from "tabler-icons/tsx/player-play-filled.tsx";
import IconWindowMinimize from "tabler-icons/tsx/window-minimize.tsx";
import IconWindowMaximize from "tabler-icons/tsx/window-maximize.tsx";
import IconX from "tabler-icons/tsx/x.tsx";
import { Head } from "$fresh/runtime.ts";
import hljs from "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/es/highlight.min.js";

import { useEffect, useRef, useState } from "preact/hooks";
import { signal } from "@preact/signals";
import { audienceKey, longDateFormat } from "../lib/utils.ts";
import { tailSocket } from "../lib/sockets.ts";

export const MAX_TAIL_SIZE = 100;

export const tailSignal = signal<{ [key in string]: TailData[] }>(
  {},
);

export const tailEnabledSignal = signal<boolean>(false);
export const tailPausedSignal = signal<boolean>(false);
export const tailSamplingSignal = signal<boolean>(false);
export const tailSamplingRateSignal = signal<number>(1);

export type TailData = { timestamp: Date; data: string };

export const parseData = (data: string) => {
  try {
    const parsed = JSON.parse(data);
    return JSON.stringify(parsed, null, 2);
  } catch (e) {
    console.debug("Error parsing tail data, returning raw data instead");
  }
  return data;
};

export const TailRow = (
  { row }: { row: TailData; index: number },
) => {
  const lastRef = useRef();

  useEffect(() => {
    tailPausedSignal.value === false && lastRef.current &&
      lastRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start",
      });
  }, [lastRef.current]);

  return (
    <div className="flex flex-row w-full">
      <div
        ref={lastRef}
        className="bg-black text-white py-2 px-4 text-sm overflow-x-scroll flex flex-col justify-start"
      >
        <div className="text-stream">
          {row.timestamp?.toLocaleDateString(
            "en-us",
            longDateFormat,
          )}
        </div>
        <pre>
          <code>
            <div dangerouslySetInnerHTML={{
                __html: hljs.highlightAuto(parseData(row.data)).value,
              }}
            >
            </div>
          </code>
        </pre>
      </div>
    </div>
  );
};

export const Tail = ({ audience }: { audience: Audience }) => {
  const [fullScreen, setFullScreen] = useState(false);

  useEffect(() => {
    const socket = tailSocket("./ws/tail", audience);

    return () => {
      socket?.close();
    };
  }, [tailSamplingSignal.value, tailSamplingRateSignal.value]);

  return (
    <>
      <Head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/dark.min.css"
        />
      </Head>
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
            <div>
              Tail{" "}
              <span class="text-streamdalPurple">{audience.operationName}</span>
            </div>
            <div class="flex flex-row justify-end items-center">
              <div
                class="flex justify-center items-center w-[36px] h-[36px] rounded-[50%] bg-streamdalPurple cursor-pointer"
                onClick={() => tailPausedSignal.value = !tailPausedSignal.value}
              >
                {tailPausedSignal.value
                  ? <IconPlayerPlayFilled class="w-6 h-6 text-white" />
                  : <IconPlayerPauseFilled class="w-6 h-6 text-white" />}
              </div>
              <div
                className="ml-2 flex justify-center items-center w-[36px] h-[36px] rounded-[50%] bg-streamdalPurple cursor-pointer"
                onClick={() => setFullScreen(!fullScreen)}
              >
                {fullScreen
                  ? <IconWindowMinimize class="w-6 h-6 text-white" />
                  : <IconWindowMaximize class="w-6 h-6 text-white" />}
              </div>
              <div
                className="ml-2 flex justify-center items-center w-[36px] h-[36px] rounded-[50%] bg-streamdalPurple cursor-pointer"
                onClick={() => tailEnabledSignal.value = false}
              >
                <IconX class="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div
            class={`flex flex-col mx-auto w-[${
              fullScreen ? "100" : "90"
            }%] h-[calc(100vh-${
              fullScreen ? "200" : "260"
            }px)] overflow-y-scroll rounded-md bg-black text-white`}
          >
            {tailSignal.value[audienceKey(audience)]?.map((
              tail: TailData,
            ) => <TailRow row={tail} />)}
          </div>
        </div>
      </div>
    </>
  );
};
