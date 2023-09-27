import {
  Audience,
  Metric,
  OperationType,
} from "@streamdal/snitch-protos/protos/sp_common";
import { IInternalClient } from "@streamdal/snitch-protos/protos/sp_internal.client";
import ReadWriteLock from "rwlock";

import { StepStatus } from "./process.js";

export const METRIC_INTERVAL = 1000;

export const metrics: Metric[] = [];
export const lock = new ReadWriteLock();

export interface MetricsConfigs {
  grpcClient: IInternalClient;
  snitchToken: string;
}

export const getStepLabels = (audience: Audience, stepStatus: StepStatus) => ({
  service: audience.serviceName,
  component: audience.componentName,
  operation: audience.operationName,
  pipeline_id: stepStatus.pipelineId,
  pipeline_name: stepStatus.pipelineName,
});

export const stepMetrics = async (
  audience: Audience,
  stepStatus: StepStatus,
  payloadSize: number
  // eslint-disable-next-line @typescript-eslint/require-await
) => {
  lock.writeLock((release) => {
    const opName =
      audience.operationType === OperationType.CONSUMER ? "consume" : "produce";

    stepStatus.error &&
      metrics.push({
        name: `counter_${opName}_errors`,
        value: 1,
        labels: getStepLabels(audience, stepStatus),
        audience,
      });

    metrics.push({
      name: `counter_${opName}_processed`,
      value: 1,
      labels: getStepLabels(audience, stepStatus),
      audience,
    });

    metrics.push({
      name: `counter_${opName}_bytes`,
      value: payloadSize,
      labels: getStepLabels(audience, stepStatus),
      audience,
    });
    release();
  });
};

export const pipelineMetrics = async (
  audience: Audience,
  payloadSize: number

  // eslint-disable-next-line @typescript-eslint/require-await
) => {
  lock.writeLock((release) => {
    const opName =
      audience.operationType === OperationType.CONSUMER ? "consume" : "produce";

    metrics.push({
      name: `counter_${opName}_bytes_rate`,
      value: payloadSize,
      labels: {},
      audience,
    });
    metrics.push({
      name: `counter_${opName}_processed_rate`,
      value: 1,
      labels: {},
      audience,
    });
    release();
  });
};

// eslint-disable-next-line @typescript-eslint/require-await
export const sendMetrics = async (configs: MetricsConfigs) => {
  if (!metrics.length) {
    console.debug(`### no metrics found, skipping`);
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  lock.writeLock(async (release) => {
    try {
      const call = configs.grpcClient.metrics(
        {
          metrics,
        },
        { meta: { "auth-token": configs.snitchToken } }
      );
      const status = await call.status;
      console.debug("metrics send status", status);
      metrics.length = 0;
    } catch (e) {
      console.error("error sending metrics", e);
    }

    release();
  });
};
