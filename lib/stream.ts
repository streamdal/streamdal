import { setServiceSignal } from "../components/serviceMap/serviceSignal.ts";
import { client, meta } from "./grpc.ts";
import { ServerStreamingCall } from "@protobuf-ts/runtime-rpc";
import {
  GetAllRequest,
  GetAllResponse,
} from "streamdal-protos/protos/sp_external.ts";
import { effect, signal } from "@preact/signals";

export const CONNECT_RETRY_INTERVAL = 3000;
export const serviceStreamAbortSignal = signal<boolean>(false);

export const streamServiceMap = async () => {
  const abortController = new AbortController();

  effect(() => {
    if (serviceStreamAbortSignal.value) {
      abortController.abort();
    }
  });

  try {
    const call: ServerStreamingCall<GetAllRequest, GetAllResponse> = client
      .getAllStream({}, { ...meta, abort: abortController.signal });

    void processResponses(call);

    const status = await call.status;
    status && console.debug("received grpc getAllStream status: ", status);
  } catch (e) {
    console.error("received grpc getAllStream error", e);

    //
    // User generated abort signals present as cancelled exceptions,
    // don't reconnect
    if (e?.code === "CANCELLED") {
      return;
    }

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

const processResponses = async (
  call: ServerStreamingCall<GetAllRequest, GetAllResponse>,
) => {
  for await (const response of call.responses) {
    !response?.Keepalive && setServiceSignal(response);
  }
};
