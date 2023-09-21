import { Audience, TailResponse } from "snitch-protos/protos/sp_common.ts";
import { Pipeline } from "snitch-protos/protos/sp_pipeline.ts";
import { OP_MODAL_OPEN_WIDTH, OP_MODAL_WIDTH } from "./opModal.tsx";
import IconPlayerPauseFilled from "tabler-icons/tsx/player-pause-filled.tsx";
import IconPlayerPlayFilled from "tabler-icons/tsx/player-play-filled.tsx";
import IconWindowMinimize from "tabler-icons/tsx/window-minimize.tsx";
import IconWindowMaximize from "tabler-icons/tsx/window-maximize.tsx";
import IconX from "tabler-icons/tsx/x.tsx";

import { useEffect, useRef, useState } from "preact/hooks";
import { peek, peekPausedSignal, peekSignal } from "../lib/peek.ts";
import { effect } from "@preact/signals";

export const parseData = (data: Uint8Array) => {
  const decoded = new TextDecoder().decode(data);

  try {
    const parsed = JSON.parse(decoded);
    return JSON.stringify(parsed);
  } catch (e) {
    console.error("Error parsing peek data, returning decoded data instead", e);
  }
  return decoded;
};

export const parseDate = (timestampNs: string) => {
  try {
    return new Date(Number(BigInt(timestampNs) / BigInt(1e6)));
  } catch (e) {
    console.error("error parsing", timestampNs);
  }
  return null;
};

export const PeekRow = (
  { row, index }: { row: TailResponse; index: number },
) => {
  const lastRef = useRef();

  useEffect(() => {
    lastRef.current &&
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
        className="bg-gloaming text-stormCloud w-[10%] text-right p-4 mr-2 text-xs font-bold"
      >
        {index + 1}
      </div>
      <div className="bg-black text-white w-[90%] p-4 text-sm overflow-x-scroll flex flex-col justify-start">
        <div className="mb text-stream">
          {parseDate(row.timestampNs)?.toLocaleString()}
        </div>
        <div>{parseData(row.newData)}</div>
      </div>
    </div>
  );
};

export const Peek = (
  {
    audience,
    pipeline,
    modalExpanded,
    grpcToken,
    grpcUrl,
    close,
  }: {
    audience: Audience;
    pipeline: Pipeline;
    modalExpanded: boolean;
    grpcUrl: string;
    grpcToken: string;
    close: () => void;
  },
) => {
  const [peekData, setPeekData] = useState();
  const [fullScreen, setFullScreen] = useState(false);

  useEffect(() => {
    if (pipeline) {
      void peek({ audience, pipeline, grpcUrl, grpcToken });
    }
  }, []);

  effect(() => {
    if (peekSignal.value && !peekPausedSignal.value) {
      setPeekData(peekSignal.value);
    }
  });

  const width = modalExpanded ? OP_MODAL_OPEN_WIDTH : OP_MODAL_WIDTH;

  return (
    <div
      class={`relative flex flex-col h-screen w-[calc(100vw-${width})]`}
    >
      <div class="h-46 w-full bg-streamdalPurple p-4 text-white font-semibold text-sm">
        <span class="opacity-50">Home</span> / Peek
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
            Peeking{" "}
            <span class="text-streamdalPurple">{audience.operationName}</span>
          </div>
          <div class="flex flex-row justify-end items-center">
            <div
              class="flex justify-center items-center w-[36px] h-[36px] rounded-[50%] bg-streamdalPurple cursor-pointer"
              onClick={() => peekPausedSignal.value = !peekPausedSignal.value}
            >
              {peekPausedSignal.value
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
              onClick={close}
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
          }px)] overflow-y-scroll rounded-md`}
        >
          {peekData?.map((p: TailResponse, i: number) => (
            <PeekRow row={p} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
};
