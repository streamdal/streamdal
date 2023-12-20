import { effect, signal } from "@preact/signals";
import { client, meta } from "./grpc.ts";
import { CONNECT_RETRY_INTERVAL } from "./stream.ts";
import { SERVER_ERROR, serverErrorSignal } from "./serverError.ts";

type RateMetrics = { bytes: string; processed: string };
export const audienceMetricsConnected = signal<boolean>(false);

export const getAudienceMetrics = async ({ socket }: { socket: WebSocket }) => {
  const abortController = new AbortController();

  effect(() => {
    if (!audienceMetricsConnected.value) {
      abortController.abort();
    }
  });

  try {
    const audienceMetricsCall: any = client
      .getAudienceRates(
        {},
        {
          ...meta,
          abort: abortController.signal,
        },
      );

    await audienceMetricsCall.headers;
    serverErrorSignal.value = "";

    for await (const response of audienceMetricsCall?.responses) {
      for (const [key, value] of Object.entries(response?.rates)) {
        !response?.Keepalive &&
          sendMetrics({ [key]: value as RateMetrics }, socket);
      }
    }

    const { status } = await audienceMetricsCall;
    status && console.info("received grpc getAudienceRates status", status);
  } catch (e) {
    //
    // User generated abort signals present as cancelled exceptions, don't reconnect
    if (e?.code === "CANCELLED") {
      return;
    }

    console.error("received grpc getAudienceRates error", e);

    serverErrorSignal.value = SERVER_ERROR;

    setTimeout(() => {
      console.info(
        `retrying grpc getAudienceRates connection in ${
          CONNECT_RETRY_INTERVAL / 1000
        } seconds...`,
      );
      getAudienceMetrics({ socket });
    }, CONNECT_RETRY_INTERVAL);
  }
};

const sendMetrics = (metric: any, socket: WebSocket) => {
  try {
    socket.send(JSON.stringify(metric));
  } catch (e) {
    console.debug("failed to send audience metrics over socket", e);
  }
};
