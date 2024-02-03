import {
  Audience,
  Metric,
  OperationType,
} from "@streamdal/protos/protos/sp_common";
import { IInternalClient } from "@streamdal/protos/protos/sp_internal.client";
import { Pipeline } from "@streamdal/protos/protos/sp_pipeline";
import { ExecStatus, StepStatus } from "@streamdal/protos/protos/sp_sdk";
import ReadWriteLock from "rwlock";

export const METRIC_INTERVAL = 1000;

export const metrics = new Map<string, Metric>();
export const lock = new ReadWriteLock();

export interface MetricsConfigs {
  grpcClient: IInternalClient;
  streamdalToken: string;
}

export const getStepLabels = (audience: Audience, pipeline: Pipeline) => ({
  service: audience.serviceName,
  component: audience.componentName,
  operation: audience.operationName,
  pipeline_id: pipeline.id,
  pipeline_name: pipeline.name,
});

export const stepMetrics = async ({
  audience,
  stepStatus,
  pipeline,
  payloadSize,
}: {
  audience: Audience;
  stepStatus: StepStatus;
  pipeline: Pipeline;
  payloadSize: number;
  // eslint-disable-next-line @typescript-eslint/require-await
}) => {
  lock.writeLock((release) => {
    const opName =
      audience.operationType === OperationType.CONSUMER ? "consume" : "produce";

    const labels = getStepLabels(audience, pipeline);
    const stepErrorKey = `counter_${opName}_errors`;
    const stepProcessedKey = `counter_${opName}_processed`;
    const stepBytesKey = `counter_${opName}_bytes`;

    stepStatus.status === ExecStatus.ERROR &&
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

export const sendMetrics = (configs: MetricsConfigs) =>
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
