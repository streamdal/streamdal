import { IInternalClient } from "@streamdal/snitch-protos/protos/internal.client.js";

import { sessionId } from "./register.js";

export const HEARTBEAT_INTERVAL = 1000;

export interface HearbeatConfigs {
  grpcClient: IInternalClient;
  snitchToken: string;
}

export const heartbeat = async (configs: HearbeatConfigs) => {
  console.debug(`### sending heartbeat to grpc server...`);
  const call = configs.grpcClient.heartbeat(
    {
      sessionId,
    },
    { meta: { "auth-token": configs.snitchToken } }
  );

  const response = await call.response;
  console.debug("got heartbeat response message: ", response);

  const status = await call.status;
  console.debug("got heartbeat status: ", status);
};
