import {
  Audience,
  TailRequest,
  TailRequestType,
  TailResponse,
} from "streamdal-protos/protos/sp_common.ts";
import hljs from "../static/vendor/highlight@11.8.0.min.js";
import * as uuid from "$std/uuid/mod.ts";

import { effect, signal } from "@preact/signals";
import { client } from "./grpc.ts";
import { GRPC_TOKEN } from "./configs.ts";
import {
  defaultTailSampleRate,
  TailSampleRate,
} from "../islands/drawer/tail.tsx";

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
export const tail = async (
  { audience, socket, sampling = defaultTailSampleRate }: {
    audience: Audience;
    socket: WebSocket;
    sampling: TailSampleRate;
  },
) => {
  const sendResponse = (response: TailResponse) => {
    socket.send(
      JSON.stringify({
        timestamp: parseDate(response.timestampNs),
        data: formatData(new TextDecoder().decode(response.newData)),
        originalData: formatData(
          new TextDecoder().decode(response.originalData),
        ),
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
      id: uuid.v1.generate(),
      audience: audience,
      type: TailRequestType.START,
      sampleOptions: {
        sampleRate: sampling.rate,
        sampleIntervalSeconds: sampling.intervalSeconds,
      },
    });

    const tailCall: any = client.tail(
      tailRequest,
      {
        meta: { "auth-token": GRPC_TOKEN },
        abort: abortController.signal,
      },
    );

    for await (const response of tailCall?.responses) {
      if (response?.Keepalive) {
        continue;
      }
      sendResponse(response);
    }

    const { status } = await tailCall;
    status && console.info("grpc tail status", status);
  } catch (e) {
    //
    // User generated abort signals present as cancelled exceptions, don't log
    if (e?.code === "CANCELLED") {
      return;
    }

    console.error("received grpc tail error", e);
  }
};
