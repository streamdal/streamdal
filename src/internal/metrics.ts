import {
  Audience,
  Metric,
  OperationType,
} from "@streamdal/snitch-protos/protos/sp_common";
import { IInternalClient } from "@streamdal/snitch-protos/protos/sp_internal.client";
import ReadWriteLock from "rwlock";

import { StepStatus } from "./process.js";

export const METRIC_INTERVAL = 1000;

export const metrics = new Map<string, Metric>();
export const lock = new ReadWriteLock();

export interface MetricsConfigs {
  grpcClient: IInternalClient;
  streamdalToken: string;
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

    const labels = getStepLabels(audience, stepStatus);
    const stepErrorKey = `counter_${opName}_errors`;
    const stepProcessedKey = `counter_${opName}_processed`;
    const stepBytesKey = `counter_${opName}_bytes`;

    stepStatus.error &&
      metrics.set(stepErrorKey, {
        name: stepErrorKey,
        value: (metrics.get(stepErrorKey)?.value ?? 0) + 1,
        labels,
        audience,
      });

    metrics.set(stepProcessedKey, {
      name: stepProcessedKey,
      value: (metrics.get(stepProcessedKey)?.value ?? 0) + 1,
      labels,
      audience,
    });

    metrics.set(stepBytesKey, {
      name: stepBytesKey,
      value: (metrics.get(stepBytesKey)?.value ?? 0) + payloadSize,
      labels,
      audience,
    });

    release();
  });
};

export const audienceMetrics = async (
  audience: Audience,
  payloadSize: number

  // eslint-disable-next-line @typescript-eslint/require-await
) => {
  lock.writeLock((release) => {
    const opName =
      audience.operationType === OperationType.CONSUMER ? "consume" : "produce";

    const bytesProcessedKey = `counter_${opName}_bytes_rate`;
    const processedKey = `counter_${opName}_processed_rate`;

    metrics.set(bytesProcessedKey, {
      name: bytesProcessedKey,
      value: (metrics.get(bytesProcessedKey)?.value ?? 0) + payloadSize,
      labels: {},
      audience,
    });

    metrics.set(processedKey, {
      name: processedKey,
      value: (metrics.get(processedKey)?.value ?? 0) + 1,
      labels: {},
      audience,
    });

    release();
  });
};

// eslint-disable-next-line @typescript-eslint/require-await
export const sendMetrics = async (configs: MetricsConfigs) =>
  lock.writeLock((release) => {
    try {
      if (!metrics.size) {
        console.debug(`### no metrics found, skipping`);
        release();
        return;
      }
      const metricsData = Array.from(metrics.values()).map((m: Metric) => ({
        ...m,
        //
        // Make sure we always send data per second
        value: m.value / (METRIC_INTERVAL / 1000),
      }));
      console.debug("sending metrics", metricsData);

      void configs.grpcClient.metrics(
        {
          metrics: metricsData,
        },
        { meta: { "auth-token": configs.streamdalToken } }
      );
      metrics.clear();
    } catch (e) {
      console.error("error sending metrics", e);
    }
    release();
  });
