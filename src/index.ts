import { ChannelCredentials } from "@grpc/grpc-js";
import { GrpcTransport } from "@protobuf-ts/grpc-transport";
import {
  IInternalClient,
  InternalClient,
} from "@streamdal/snitch-protos/protos/internal_api.client.js";
import { register } from "./register.js";
import { heartbeat } from "./heartbeat.js";

const HEARTBEAT_INTERVAL = 30000;

const transport = new GrpcTransport({
  host: "localhost:9091",
  channelCredentials: ChannelCredentials.createInsecure(),
});

export const client: IInternalClient = new InternalClient(transport);

const start = () => {
  void register();
  setInterval(() => {
    void heartbeat();
  }, HEARTBEAT_INTERVAL);
};

start();
