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
import { Pipeline } from "snitch-protos/protos/sp_pipeline.ts";

import { effect, signal } from "@preact/signals";
import { parseDate } from "../islands/peek.tsx";

export const MAX_PEEK_SIZE = 1000;

export const peekSignal = signal<TailResponse[] | []>(
  [],
);

export const peekingSignal = signal<boolean>(false);
export const peekPausedSignal = signal<boolean>(false);
export const peekSamplingSignal = signal<boolean>(false);
export const peekSamplingRateSignal = signal<number>(1);

export const peek = async ({ audience, pipeline, grpcUrl, grpcToken }: {
  audience: Audience;
  pipeline: Pipeline;
  grpcUrl: string;
  grpcToken: string;
}) => {
  const abortController = new AbortController();

  effect(() => {
    if (!peekingSignal.value) {
      abortController.abort();
      peekSignal.value = [];
    }
  });

  try {
    const transport = new GrpcWebFetchTransport({
      baseUrl: grpcUrl,
    });
    const abortController = new AbortController();

    const client: IExternalClient = new ExternalClient(transport);
    const tailRequest = TailRequest.create({
      Id: crypto.randomUUID(),
      audience: audience,
      pipelineId: pipeline?.id,
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
      if (!peekSamplingSignal.value || peekSignal.value.length === 0) {
        peekSignal.value = [...peekSignal.value, response].slice(
          -MAX_PEEK_SIZE,
        );
      }

      const last = parseDate(peekSignal.value?.at(-1)?.timestampNs!);
      const current = parseDate(response.timestampNs);

      if (
        !current || !last ||
        ((current.getTime() - last.getTime()) / 1000 >
          peekSamplingRateSignal.value)
      ) {
        peekSignal.value = [...peekSignal.value, response].slice(
          -MAX_PEEK_SIZE,
        );
      }
    }

    const { status } = await tailCall;
    console.info("grpc tail status", status);
  } catch (e) {
    console.error("received grpc tail error", e);
  }
};
