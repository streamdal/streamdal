import { ClientStreamingCall } from "@protobuf-ts/runtime-rpc";
import {
  StandardResponse,
  TailResponse,
  TailResponseType,
} from "@streamdal/protos/protos/sp_common";

import { PipelineConfigs, TailRequest } from "./process.js";
import { audienceKey, internal } from "./register.js";

let tailStream: ClientStreamingCall<TailResponse, StandardResponse> | null =
  null;

export const openTailStream = (configs: PipelineConfigs) => {
  try {
    return configs.grpcClient.sendTail({
      meta: { "auth-token": configs.streamdalToken },
    });
  } catch (e) {
    console.error("error opening tail client stream");
    return null;
  }
};

export const sendTail = ({
  configs,
  audience,
  originalData,
  newData,
}: TailRequest) => {
  const key = audienceKey(audience);
  const tails = internal.audiences.get(key)?.tails;

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  tails?.forEach(async ({ tailStatus, tailRequestId, sampleBucket }) => {
    if (!tailStatus) {
      return;
    }
    try {
      if (!sampleBucket.consume()) {
        console.debug("sample rate exceeded, discarding tail");
        return;
      }

      if (tailStream == null) {
        console.debug("tail stream is closed, reopening...");
        tailStream = openTailStream(configs);
      }

      const tailResponse = TailResponse.create({
        timestampNs: (BigInt(new Date().getTime()) * BigInt(1e6)).toString(),
        type: TailResponseType.PAYLOAD,
        tailRequestId: tailRequestId,
        audience,
        sessionId: configs.sessionId,
        originalData,
        newData,
      });
      console.debug("sending tail response", tailResponse);
      await tailStream?.requests.send(tailResponse);

      const headers = await tailStream?.headers;
      console.debug("got tail response headers: ", headers);

      const response = await tailStream?.response;
      console.debug("got tail response message: ", response);

      const status = await tailStream?.status;
      console.debug("got tail status: ", status);

      const trailers = await tailStream?.trailers;
      console.debug("got tail trailers: ", trailers);
    } catch (e) {
      tailStream = null;
      console.error("Error sending tail", e);
    }
  });
};
