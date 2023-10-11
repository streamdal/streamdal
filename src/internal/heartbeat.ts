import { ResponseCode } from "@streamdal/snitch-protos/protos/sp_common";
import { IInternalClient } from "@streamdal/snitch-protos/protos/sp_internal.client";

export const HEARTBEAT_INTERVAL = 1000;

export interface HearbeatConfigs {
  grpcClient: IInternalClient;
  sessionId: string;
  streamdalToken: string;
}

export const heartbeat = async ({
  grpcClient,
  sessionId,
  streamdalToken,
}: HearbeatConfigs) => {
  const call = grpcClient.heartbeat(
    {
      sessionId,
    },
    { meta: { "auth-token": streamdalToken } }
  );

  const response = await call.response;
  if (response.code !== ResponseCode.OK) {
    console.error("Heartbeat error", response.message);
  }
};
