import { effect, signal } from "@preact/signals";
import { client, meta } from "./grpc.ts";

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
        meta,
      );

    for await (const response of audienceMetricsCall?.responses) {
      for (const [key, value] of Object.entries(response?.rates)) {
        socket.send(
          JSON.stringify({ [key]: value as RateMetrics }),
        );
      }
    }

    const { status } = await audienceMetricsCall;
    status && console.info("grpc audienceMetricsCall status", status);
  } catch (e) {
    console.error("received grpc audienceMetricsCall error", e);
  }
};
