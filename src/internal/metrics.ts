import { IInternalClient } from "@streamdal/snitch-protos/protos/internal.client.js";
import { Metrics } from "@streamdal/snitch-protos/protos/internal.js";
import ReadWriteLock from "rwlock";

export const METRIC_INTERVAL = 1000;

export const metrics: Metrics[] = [
  { name: "test", labels: { testLabelKey: "testLabelValue" }, value: 200 },
];

export const lock = new ReadWriteLock();

export interface MetricsConfigs {
  grpcClient: IInternalClient;
  snitchToken: string;
}

// eslint-disable-next-line @typescript-eslint/require-await
export const sendMetrics = async (configs: MetricsConfigs) => {
  console.debug(`### sending metrics to grpc server...`);
  if (!metrics.length) {
    console.debug(`### no metrics found, skipping`);
  }

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  lock.writeLock(async (release) => {
    const call = configs.grpcClient.metrics(
      {
        metrics,
      },
      { meta: { "auth-token": configs.snitchToken } }
    );
    console.debug(`### metrics sent`);

    //
    // TODO: check status
    await call.status;
    metrics.length = 0;

    release();
  });
};
