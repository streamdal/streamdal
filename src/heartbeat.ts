import { client } from "./index.js";
import { serviceName } from "./register.js";
import { OperationType } from "@streamdal/snitch-protos/protos/internal_api.js";

export const heartbeat = async () => {
  console.info(`### sending heartbeat to grpc server...`);
  const call = client.heartbeat(
    {
      lastActivityUnixTimestampUtc: BigInt(Date.now()),
      audience: {
        serviceName,
        componentName: "test",
        operationType: OperationType.CONSUMER,
      },
      Metadata: {},
    },
    { meta: { "auth-token": process.env.SNITCH_TOKEN || "1234" } }
  );
  console.info(`### heartbeat sent`);

  const response = await call.response;
  console.info("got heartbeat response message: ", response);

  const status = await call.status;
  console.info("got heartbeat status: ", status);
};
