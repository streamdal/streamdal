import { IInternalClient } from "@streamdal/snitch-protos/protos/internal.client.js";

import { sessionId } from "./register.js";

export const HEARTBEAT_INTERVAL = 30000;

export interface HearbeatConfigs {
  grpcClient: IInternalClient;
  snitchToken: string;
}

export const heartbeat = async (configs: HearbeatConfigs) => {
  console.info(`### sending heartbeat to grpc server...`);
  const call = configs.grpcClient.heartbeat(
    {
      sessionId,
    },
    { meta: { "auth-token": configs.snitchToken } }
  );
  console.info(`### heartbeat sent`);

  const response = await call.response;
  console.info("got heartbeat response message: ", response);

  const status = await call.status;
  console.info("got heartbeat status: ", status);
};
