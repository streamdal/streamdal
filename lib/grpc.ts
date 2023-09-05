import {
  ExternalClient,
  IExternalClient,
} from "snitch-protos/protos/sp_external.client.ts";
import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import { grpcToken, grpcUrl } from "./configs.ts";

export const meta = {
  meta: { "auth-token": await grpcToken() },
};

const transport = new GrpcWebFetchTransport({
  baseUrl: await grpcUrl(),
  format: "binary",
});

export const client: IExternalClient = new ExternalClient(transport);
