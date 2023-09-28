import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import {
  ExternalClient,
  IExternalClient,
} from "snitch-protos/protos/sp_external.client.ts";

import { signal } from "@preact/signals";

type RateMetrics = { bytes: string; processed: string };
export const edgeMetricsSignal = signal<{ [key in string]: RateMetrics }>(
  {},
);

export const getEdgeMetrics = async ({ grpcUrl, grpcToken }: {
  grpcUrl: string;
  grpcToken: string;
}) => {
  try {
    const transport = new GrpcWebFetchTransport({
      baseUrl: grpcUrl,
    });

    const client: IExternalClient = new ExternalClient(transport);
    const edgeMetricsCall: any = client
      .getAudienceRates(
        {},
        {
          meta: { "auth-token": grpcToken },
        },
      );

    for await (const response of edgeMetricsCall?.responses) {
      for (const [key, value] of Object.entries(response?.rates)) {
        //
        // A map would be better but changes do maps do not trigger
        // signal effects
        edgeMetricsSignal.value = {
          ...edgeMetricsSignal.value,
          ...{ [key]: value as RateMetrics },
        };
      }
    }

    const { status } = await edgeMetricsCall;
    status && console.info("grpc edgeMetricsCall status", status);
  } catch (e) {
    console.error("received grpc edgeMetricsCall error", e);
  }
};
