import { grpcClient } from "./index.js";
import { Metrics } from "@streamdal/snitch-protos/protos/internal.js";
import ReadWriteLock from "rwlock";

export const METRIC_INTERVAL = 1000;

export const metrics: Metrics[] = [
  { name: "test", labels: { testLabelKey: "testLabelValue" }, value: 200 },
];

export const lock = new ReadWriteLock();

// eslint-disable-next-line @typescript-eslint/require-await
export const sendMetrics = async () => {
  console.debug(`### sending metrics to grpc server...`);
  if (!metrics.length) {
    console.debug(`### no metrics found, skipping`);
  }

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  lock.writeLock(async (release) => {
    const call = grpcClient.metrics(
      {
        metrics,
      },
      { meta: { "auth-token": process.env.SNITCH_TOKEN || "1234" } }
    );
    console.debug(`### metrics sent`);

    //
    // TODO: check status
    await call.status;
    metrics.length = 0;

    release();
  });
};
