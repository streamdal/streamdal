import { ChannelCredentials } from "@grpc/grpc-js";
import { GrpcTransport } from "@protobuf-ts/grpc-transport";
import { register } from "./register.js";
import { heartbeat, HEARTBEAT_INTERVAL } from "./heartbeat.js";
import "dotenv/config";
import {
  IInternalClient,
  InternalClient,
} from "@streamdal/snitch-protos/protos/internal.client.js";
import { METRIC_INTERVAL, sendMetrics } from "./metrics.js";

const transport = new GrpcTransport({
  host: process.env.SNITCH_URL || "localhost:9091",
  channelCredentials: ChannelCredentials.createInsecure(),
});

export const grpcClient: IInternalClient = new InternalClient(transport);

const start = () => {
  void register();

  setInterval(() => {
    void heartbeat();
  }, HEARTBEAT_INTERVAL);

  setInterval(() => {
    void sendMetrics();
  }, METRIC_INTERVAL);
};

export const close = () => {
  transport.close();
};

start();
