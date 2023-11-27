import {
  Audience,
  TailRequest,
  TailRequestType,
  TailResponse,
} from "streamdal-protos/protos/sp_common.ts";
import hljs from "../static/vendor/highlight@11.8.0.min.js";

import { effect, signal } from "@preact/signals";
import { client } from "./grpc.ts";
import { GRPC_TOKEN } from "./configs.ts";
import { tailSignal } from "../islands/drawer/tail.tsx";

export const tailAbortSignal = signal<boolean>(false);

export const parseDate = (timestampNs: string) => {
  try {
    return new Date(Number(BigInt(timestampNs) / BigInt(1e6)));
  } catch (e) {
    console.error("error parsing nanosecond timestamp", e);
  }
  return null;
};

export const parseData = (data: string) => {
  try {
    const parsed = JSON.parse(data);
    return JSON.stringify(parsed, null, 2);
  } catch (e) {
    console.debug("Error parsing tail data, returning raw data instead", e);
  }
  return data;
};

export const highlightData = (data: string) =>
  hljs.highlight(parseData(data), { language: "json" }).value;

export const formatData = (data: string) => highlightData(parseData(data));

//
// sampling is a value in seconds
export const tail = async ({ audience, socket, sampling = 0 }: {
  audience: Audience;
  socket: WebSocket;
  sampling: number;
}) => {
  const sendResponse = (response: TailResponse) => {
    const data = response.newData && response.newData.length > 0
      ? response.newData
      : response.originalData;
    socket.send(
      JSON.stringify({
        timestamp: parseDate(response.timestampNs),
        data: formatData(new TextDecoder().decode(data)),
      }),
    );
  };

  const abortController = new AbortController();

  effect(() => {
    if (tailAbortSignal.value) {
      abortController.abort();
    }
  });

  try {
    const tailRequest = TailRequest.create({
      Id: crypto.randomUUID(),
      audience: audience,
      type: TailRequestType.START,
    });

    const tailCall: any = client.tail(
      tailRequest,
      {
        meta: { "auth-token": GRPC_TOKEN },
        abort: abortController.signal,
      },
    );

    let lastDate = null;

    for await (const response of tailCall?.responses) {
      if (response?.Keepalive) {
        continue;
      }

      const currentDate = parseDate(response.timestampNs);

      if (sampling === 0) {
        sendResponse(response);
        lastDate = currentDate;
        continue;
      }

      if (
        !currentDate || !lastDate ||
        ((currentDate.getTime() - lastDate.getTime()) / 1000 >
          sampling)
      ) {
        sendResponse(response);
        lastDate = currentDate;
      }
    }

    const { status } = await tailCall;
    status && console.info("grpc tail status", status);
  } catch (e) {
    tailSignal.value = [];
    //
    // User generated abort signals present as cancelled exceptions, don't reconnect
    if (e?.code === "CANCELLED") {
      return;
    }

    console.error("received grpc tail error", e);
  }
};
