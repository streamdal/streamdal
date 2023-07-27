import { Layout } from "../components/layout.tsx";
import { ExternalClient } from "snitch-protos/protos/external.client.ts";
import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import { getEnv } from "../lib/utils.ts";

const transport = new GrpcWebFetchTransport({
  baseUrl: `${await getEnv("SNITCH_GRPC_WEB_URL") || "http://localhost:9091"}`,
  format: "binary",
});

const client = new ExternalClient(transport);

try {
  const { response } = await client.test({ input: "hello world" }, {
    meta: { "auth-token": "1234" },
  });
  console.log("test response:", response);
} catch (error) {
  console.log("error", error);
}

export default function GRPC() {
  return (
    <Layout hideNav={true}>
      <div>Successfully called grpc using grpc-web!</div>
    </Layout>
  );
}
