import { grpcClient } from "./index.js";
import { serviceName } from "./register.js";
import { OperationType } from "@streamdal/snitch-protos/protos/common.js";

export const HEARTBEAT_INTERVAL = 30000;

export const heartbeat = async () => {
  console.info(`### sending heartbeat to grpc server...`);
  const call = grpcClient.heartbeat(
    {
      lastActivityUnixTimestampUtc: BigInt(Date.now()),
      audience: {
        serviceName,
        componentName: "heartbeat",
        operationType: OperationType.CONSUMER,
      },
    },
    { meta: { "auth-token": process.env.SNITCH_TOKEN || "1234" } }
  );
  console.info(`### heartbeat sent`);

  const response = await call.response;
  console.info("got heartbeat response message: ", response);

  const status = await call.status;
  console.info("got heartbeat status: ", status);
};
