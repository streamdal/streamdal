import { ResponseCode } from "@streamdal/snitch-protos/protos/sp_common.js";
import { IInternalClient } from "@streamdal/snitch-protos/protos/sp_internal.client.js";

export const HEARTBEAT_INTERVAL = 1000;

export interface HearbeatConfigs {
  grpcClient: IInternalClient;
  sessionId: string;
  snitchToken: string;
}

export const heartbeat = async ({
  grpcClient,
  sessionId,
  snitchToken,
}: HearbeatConfigs) => {
  const call = grpcClient.heartbeat(
    {
      sessionId,
    },
    { meta: { "auth-token": snitchToken } }
  );

  const response = await call.response;
  if (response.code !== ResponseCode.OK) {
    console.error("Heartbeat error", response.message);
  }
};
