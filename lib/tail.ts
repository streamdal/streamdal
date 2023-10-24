import {
  Audience,
  TailRequest,
  TailRequestType,
  TailResponse,
} from "streamdal-protos/protos/sp_common.ts";

import { effect, signal } from "@preact/signals";
import { client } from "./grpc.ts";
import { GRPC_TOKEN, grpcToken } from "./configs.ts";

export const tailAbortSignal = signal<boolean>(false);

export const parseDate = (timestampNs: string) => {
  try {
    return new Date(Number(BigInt(timestampNs) / BigInt(1e6)));
  } catch (e) {
    console.error("error parsing nanosecond timestamp", e);
  }
  return null;
};

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
        data: new TextDecoder().decode(data),
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
    console.error("received grpc tail error", e);
  }
};
