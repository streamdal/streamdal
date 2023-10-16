import { ResponseCode } from "@streamdal/protos/protos/sp_common";
import { IInternalClient } from "@streamdal/protos/protos/sp_internal.client";

import { clientInfo, internal } from "./register.js";

export const HEARTBEAT_INTERVAL = 1000;

export interface HearbeatConfigs {
  serviceName: string;
  grpcClient: IInternalClient;
  sessionId: string;
  streamdalToken: string;
}

export const heartbeat = async ({
  serviceName,
  grpcClient,
  sessionId,
  streamdalToken,
}: HearbeatConfigs) => {
  const heartbeatRequest = {
    sessionId,
    serviceName,
    audiences: Array.from(internal.audiences.values()).map((a) => a.audience),
    clientInfo: clientInfo(),
  };
  console.debug("sending heartbeat", heartbeatRequest);

  const call = grpcClient.heartbeat(heartbeatRequest, {
    meta: { "auth-token": streamdalToken },
  });

  const response = await call.response;
  if (response.code !== ResponseCode.OK) {
    console.error("Heartbeat error", response.message);
  }
};
