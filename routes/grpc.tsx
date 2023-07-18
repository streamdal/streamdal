import { Layout } from "../components/layout.tsx";
import { ExternalClient } from "../lib/protos/external_api.client.ts";
import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";

const transport = new GrpcWebFetchTransport({
  baseUrl: "http://localhost:9091",
  format: "binary",
  // fetchInit: {
  //   meta: {
  //     "auth_token": "1234",
  //   },
  //   headers: {
  //     "auth_token": "1234",
  //   },
  // },
});

const client = new ExternalClient(transport);

try {
  // not 100% sure about the test request format
  // const input = new TextEncoder().encode(JSON.stringify("test grpc-web call"));
  // const r = TestRequest.create({ input });
  const { response } = await client.test({ input: "hello world" }, {
    meta: { "auth_token": "1234" },
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
