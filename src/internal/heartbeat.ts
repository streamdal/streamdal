import { ResponseCode } from "@streamdal/snitch-protos/protos/common.js";
import { IInternalClient } from "@streamdal/snitch-protos/protos/internal.client.js";

import { sessionId } from "./register.js";

export const HEARTBEAT_INTERVAL = 1000;

export interface HearbeatConfigs {
  grpcClient: IInternalClient;
  snitchToken: string;
}

export const heartbeat = async (configs: HearbeatConfigs) => {
  const call = configs.grpcClient.heartbeat(
    {
      sessionId,
    },
    { meta: { "auth-token": configs.snitchToken } }
  );

  const response = await call.response;
  if (response.code !== ResponseCode.OK) {
    console.error("Heartbeat error", response.message);
  }
};
