import {
  ExternalClient,
  IExternalClient,
} from "snitch-protos/protos/sp_external.client.ts";
import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";

export const meta = {
  meta: { "auth-token": "1234" },
};

const transport = new GrpcWebFetchTransport({
  baseUrl: `${
    (await Deno.env.get("SNITCH_GRPC_WEB_URL")) || "http://localhost:9091"
  }`,
  format: "binary",
});

export const client: IExternalClient = new ExternalClient(transport);
