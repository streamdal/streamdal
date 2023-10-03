import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import {
  ExternalClient,
  IExternalClient,
} from "snitch-protos/protos/sp_external.client.ts";
import {
  Audience,
  TailRequest,
  TailRequestType,
  TailResponse,
} from "snitch-protos/protos/sp_common.ts";

import { effect, signal } from "@preact/signals";
import { parseDate } from "../islands/tail.tsx";

export const MAX_TAIL_SIZE = 500;

export const tailSignal = signal<TailResponse[] | []>(
  [],
);

export const tailEnabledSignal = signal<boolean>(false);
export const tailPausedSignal = signal<boolean>(false);
export const tailSamplingSignal = signal<boolean>(false);
export const tailSamplingRateSignal = signal<number>(1);

export const tail = async ({ audience, grpcUrl, grpcToken }: {
  audience: Audience;
  grpcUrl: string;
  grpcToken: string;
}) => {
  const appendResponse = (response: TailResponse) =>
    tailSignal.value = [
      ...tailSignal.value.slice(
        -MAX_TAIL_SIZE,
      ),
      response,
    ];
  const abortController = new AbortController();

  effect(() => {
    if (!tailEnabledSignal.value) {
      abortController.abort();
      tailSignal.value = [];
    }
  });

  try {
    const transport = new GrpcWebFetchTransport({
      baseUrl: grpcUrl,
    });

    const client: IExternalClient = new ExternalClient(transport);
    const tailRequest = TailRequest.create({
      Id: crypto.randomUUID(),
      audience: audience,
      type: TailRequestType.START,
    });

    const tailCall: any = client
      .tail(
        tailRequest,
        {
          meta: { "auth-token": grpcToken },
          abort: abortController.signal,
        },
      );

    for await (const response of tailCall?.responses) {
      if (!tailSamplingSignal.value || tailSignal.value.length === 0) {
        appendResponse(response);
      }

      const last = parseDate(tailSignal.value?.at(-1)?.timestampNs!);
      const current = parseDate(response.timestampNs);

      if (
        !current || !last ||
        ((current.getTime() - last.getTime()) / 1000 >
          tailSamplingRateSignal.value)
      ) {
        appendResponse(response);
      }
    }

    const { status } = await tailCall;
    status && console.info("grpc tail status", status);
  } catch (e) {
    console.error("received grpc tail error", e);
  }
};
