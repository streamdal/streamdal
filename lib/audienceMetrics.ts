import { effect, signal } from "@preact/signals";
import { client, meta } from "./grpc.ts";
import { CONNECT_RETRY_INTERVAL } from "./stream.ts";

type RateMetrics = { bytes: string; processed: string };
export const audienceMetricsAbortSignal = signal<boolean>(false);

export const getAudienceMetrics = async ({ socket }: { socket: WebSocket }) => {
  const abortController = new AbortController();

  effect(() => {
    if (audienceMetricsAbortSignal.value) {
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

    for await (const response of audienceMetricsCall?.responses) {
      for (const [key, value] of Object.entries(response?.rates)) {
        !response?.Keepalive && socket.send(
          JSON.stringify({ [key]: value as RateMetrics }),
        );
      }
    }

    const { status } = await audienceMetricsCall;
    status && console.info("received grpc getAudienceRates status", status);
  } catch (e) {
    console.error("received grpc getAudienceRates error", e);

    //
    // User generated abort signals present as cancelled exce ptions,
    // don't reconnect
    if (e?.code === "CANCELLED") {
      return;
    }

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
