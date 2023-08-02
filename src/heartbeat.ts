import { grpcClient, sessionId } from "./index.js";

export const HEARTBEAT_INTERVAL = 30000;

export const heartbeat = async () => {
  console.info(`### sending heartbeat to grpc server...`);
  const call = grpcClient.heartbeat(
    {
      sessionId,
    },
    { meta: { "auth-token": process.env.SNITCH_TOKEN || "1234" } }
  );
  console.info(`### heartbeat sent`);

  const response = await call.response;
  console.info("got heartbeat response message: ", response);

  const status = await call.status;
  console.info("got heartbeat status: ", status);
};
