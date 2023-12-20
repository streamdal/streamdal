import {
  ExternalClient,
  IExternalClient,
} from "streamdal-protos/protos/sp_external.client.ts";
import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import { GRPC_TOKEN, GRPC_URL } from "./configs.ts";

export const meta = {
  meta: { "auth-token": GRPC_TOKEN },
};

const transport = new GrpcWebFetchTransport({
  baseUrl: GRPC_URL,
  format: "binary",
});

export const client: IExternalClient = new ExternalClient(transport);
