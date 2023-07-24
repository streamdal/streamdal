import { ChannelCredentials } from "@grpc/grpc-js";
import { GrpcTransport } from "@protobuf-ts/grpc-transport";
import {
  ExternalClient,
  IExternalClient,
} from "@streamdal/snitch-protos/protos/external_api.client.js";

import { testDetective } from "./detective.js";

const transport = new GrpcTransport({
  host: "localhost:9091",
  channelCredentials: ChannelCredentials.createInsecure(),
});

const client: IExternalClient = new ExternalClient(transport);

const start = async () => {
  await grpc();
  await testDetective();
};
const input = "hello grpc";

const grpc = async () => {
  const call = client.test({ input }, { meta: { "auth-token": "1234" } });

  console.info("\n");
  console.info(`### start grpc test`);
  console.info(`calling method ${call.method.name} with payload ${input}`);

  const headers = await call.headers;
  console.info("got response headers: ", headers);

  const response = await call.response;
  console.info("got response message: ", response);

  const status = await call.status;
  console.info("got status: ", status);

  const trailers = await call.trailers;
  console.info("got trailers: ", trailers);
  console.info(`### end grpc test`);
};

await start();
