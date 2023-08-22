import "dotenv/config";

import { ChannelCredentials } from "@grpc/grpc-js";
import { GrpcTransport } from "@protobuf-ts/grpc-transport";
import {
  IInternalClient,
  InternalClient,
} from "@streamdal/snitch-protos/protos/internal.client.js";

import { heartbeat, HEARTBEAT_INTERVAL } from "./heartbeat.js";
import { METRIC_INTERVAL, sendMetrics } from "./metrics.js";
import { register } from "./register.js";

const transport = new GrpcTransport({
  host: process.env.SNITCH_URL || "localhost:9091",
  channelCredentials: ChannelCredentials.createInsecure(),
});

const grpcClient: IInternalClient = new InternalClient(transport);

const start = () => {
  void register({
    grpcClient,
    serviceName: "test-service",
    snitchToken: "1234",
    dryRun: false,
  });

  setInterval(() => {
    void heartbeat({ grpcClient, snitchToken: "1234" });
  }, HEARTBEAT_INTERVAL);

  setInterval(() => {
    void sendMetrics({ grpcClient, snitchToken: "1234" });
  }, METRIC_INTERVAL);
};

export const close = () => {
  transport.close();
};

start();
