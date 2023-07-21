import { ChannelCredentials } from "@grpc/grpc-js";
import { GrpcTransport } from "@protobuf-ts/grpc-transport";
import {
  ExternalClient,
  IExternalClient,
} from "@streamdal/snitch-protos/protos/external_api.client.js";

const transport = new GrpcTransport({
  host: "localhost:9091",
  channelCredentials: ChannelCredentials.createInsecure(),
});

const client: IExternalClient = new ExternalClient(transport);

const start = async () => {
  const call = client.test(
    { input: "hello world" },
    { meta: { "auth-token": "1234" } }
  );

  console.log(`### calling method "${call.method.name}"...`);

  const headers = await call.headers;
  console.log("got response headers: ", headers);

  const response = await call.response;
  console.log("got response message: ", response);

  const status = await call.status;
  console.log("got status: ", status);

  const trailers = await call.trailers;
  console.log("got trailers: ", trailers);
};

await start();
