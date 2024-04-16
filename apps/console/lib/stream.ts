import { effect, signal } from "@preact/signals";
import { ServerStreamingCall } from "@protobuf-ts/runtime-rpc";
import {
  GetAllRequest,
  GetAllResponse,
} from "streamdal-protos/protos/sp_external.ts";
import { setServiceSignal } from "../components/serviceMap/serviceSignal.ts";
import { client, meta } from "./grpc.ts";
import { SERVER_ERROR, serverErrorSignal } from "./serverError.ts";

export const CONNECT_RETRY_INTERVAL = 3000;
export const serviceStreamConnectedSignal = signal<boolean>(false);

export const streamServiceMap = async () => {
  const abortController = new AbortController();

  effect(() => {
    if (!serviceStreamConnectedSignal.value) {
      abortController.abort();
    }
  });

  try {
    const call: ServerStreamingCall<GetAllRequest, GetAllResponse> = client
      .getAllStream({}, { ...meta, abort: abortController.signal });

    await call.headers;
    serverErrorSignal.value = "";

    for await (const response of call.responses) {
      !response?.Keepalive && setServiceSignal(response);
    }

    const { status } = await call;
    status && console.info("received grpc getAllStream status", status);
  } catch (e) {
    //
    // User generated abort signals present as cancelled exceptions, don't reconnect
    if (e?.code === "CANCELLED") {
      return;
    }

    console.error("received grpc getAllStream error", e);
    serverErrorSignal.value = SERVER_ERROR;

    setTimeout(() => {
      console.info(
        `retrying grpc getAllStream connection in ${
          CONNECT_RETRY_INTERVAL / 1000
        } seconds...`,
      );
      streamServiceMap();
    }, CONNECT_RETRY_INTERVAL);
  }
};
