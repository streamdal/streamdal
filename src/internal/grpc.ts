import { ChannelCredentials } from "@grpc/grpc-js";
import { GrpcTransport } from "@protobuf-ts/grpc-transport";
import {
  IInternalClient,
  InternalClient,
} from "@streamdal/protos/protos/sp_internal.client";

export const client = (url: string): IInternalClient => {
  const transport = new GrpcTransport({
    host: url,
    channelCredentials: ChannelCredentials.createInsecure(),
  });

  return new InternalClient(transport) as IInternalClient;
};
