import { ExternalClient } from "snitch-protos/protos/external.client.ts";
import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import { getEnv } from "../lib/utils.ts";

const transport = new GrpcWebFetchTransport({
  baseUrl: `${await getEnv("SNITCH_GRPC_WEB_URL") || "http://localhost:9091"}`,
  format: "binary",
});

export const client = new ExternalClient(transport);
