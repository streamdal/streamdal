import { ChannelCredentials } from "@grpc/grpc-js";
import { GrpcTransport } from "@protobuf-ts/grpc-transport";
import {
  IInternalClient,
  InternalClient,
} from "@streamdal/protos/protos/sp_internal.client";

export const GRPC_KEEPALIVE = 2000;

export const client = (url: string): IInternalClient => {
  const transport = new GrpcTransport({
    host: url,
    channelCredentials: ChannelCredentials.createInsecure(),
    clientOptions: {
      "grpc.keepalive_time_ms": GRPC_KEEPALIVE,
    },
  });

  return new InternalClient(transport) as IInternalClient;
};
