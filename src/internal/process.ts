import { Audience } from "@streamdal/protos/protos/sp_common";
import { IInternalClient } from "@streamdal/protos/protos/sp_internal.client";
import {
  PipelineStep,
  PipelineStepCondition,
} from "@streamdal/protos/protos/sp_pipeline";
import {
  AbortStatus,
  PipelineStatus,
  SDKResponse,
  StepStatus,
} from "@streamdal/protos/protos/sp_sdk";
import { WASMExitCode } from "@streamdal/protos/protos/sp_wsm";

import { Configs, StreamdalRequest } from "../streamdal.js";
import { addAudience } from "./audience.js";
import { audienceMetrics, stepMetrics } from "./metrics.js";
import { initPipelines, InternalPipeline } from "./pipeline.js";
import { audienceKey, internal, Tail } from "./register.js";
import { sendSchema } from "./schema.js";
import { sendTail } from "./tail.js";
import { runWasm } from "./wasm.js";

export interface PipelineConfigs {
  grpcClient: IInternalClient;
  streamdalToken: string;
  sessionId: string;
  dryRun: boolean;
}

export interface TailRequest {
  configs: PipelineConfigs;
  tails?: Map<string, Tail>;
  audience: Audience;
  originalData: Uint8Array;
  newData?: Uint8Array;
}

export const MAX_PAYLOAD_SIZE = 1024 * 1024; // 1 megabyte
const MAX_PIPELINE_RETRIES = 10;
const PIPELINE_RETRY_INTERVAL = 1000;

export const retryProcessPipelines = async ({
  configs,
  audience,
  data,
}: {
  configs: Configs;
} & StreamdalRequest): Promise<SDKResponse> => {
  let retries = 1;
  try {
    if (internal.registered) {
      return processPipelines({
        configs,
        audience,
        data,
      });
    }
    console.info(
      `not yet registered with the grpc server, retrying process pipeline in ${
        PIPELINE_RETRY_INTERVAL / 1000
      } seconds...`
    );
    return new Promise((resolve) => {
      const intervalId = setInterval(() => {
        retries++;
        if (MAX_PIPELINE_RETRIES && retries >= MAX_PIPELINE_RETRIES) {
          clearInterval(intervalId);
          return;
        }
        if (internal.registered) {
          console.debug(`retrying process pipeline...`);
          clearInterval(intervalId);
          return resolve(
            processPipelines({
              configs,
              audience,
              data,
            })
          );
        }
        console.debug(
          `retrying process pipeline in ${
            PIPELINE_RETRY_INTERVAL / 1000
          } seconds; ${retries} of ${MAX_PIPELINE_RETRIES} retries`
        );
      }, PIPELINE_RETRY_INTERVAL);
    });
  } catch (e) {
    console.error("Error running process pipeline", e);
  }
  const errorMessage =
    "Node SDK not registered with the server, skipping pipeline. Is the server running?";
  console.error(errorMessage);
  return Promise.resolve({
    data,
    dropMessage: false,
    pipelineStatus: [],
    error: true,
    errorMessage,
  });
};

export const processPipeline = ({
  originalData,
  audience,
  configs,
  pipeline,
}: {
  originalData: Uint8Array;
  audience: Audience;
  configs: Configs;
  pipeline: InternalPipeline;
}): { pipelineStatus: PipelineStatus; data: Uint8Array } => {
  const pipelineStatus: PipelineStatus = {
    id: pipeline.id,
    name: pipeline.name,
    stepStatus: [],
  };
  let data = originalData;

  for (const step of pipeline.steps) {
    if (configs.dryRun) {
      console.debug(
        `Dry run set. Found pipeline: ${pipeline.name}, step: ${step.name}...not running.`
      );
      continue;
    }

    console.debug(`running pipeline: ${pipeline.name}, step: ${step.name}...`);

    const { data: newData, stepStatus } = runStep({
      originalData,
      audience,
      configs,
      step,
      pipeline,
    });
    data = newData;
    pipelineStatus.stepStatus = [...pipelineStatus.stepStatus, stepStatus];

    if (
      [AbortStatus.CURRENT, AbortStatus.ALL, AbortStatus.DROP_MESSAGE].includes(
        stepStatus.abortStatus
      )
    ) {
      break;
    }
  }
  return { data, pipelineStatus };
};

export const processPipelines = async ({
  configs,
  audience,
  data,
}: { configs: Configs } & StreamdalRequest): Promise<SDKResponse> => {
  await initPipelines(configs);
  await addAudience({ configs: configs, audience });

  const key = audienceKey(audience);
  const pipelines = internal.pipelines.get(key);

  void audienceMetrics(audience, data.length);

  if (!pipelines) {
    const errorMessage =
      "no active pipelines found for this audience, returning data";
    console.debug(errorMessage);

    sendTail({
      configs,
      audience,
      originalData: data,
    });

    return {
      data,
      error: true,
      dropMessage: false,
      errorMessage,
      pipelineStatus: [],
    };
  }

  const response: SDKResponse = {
    data,
    pipelineStatus: [],
    error: false,
    dropMessage: false,
    errorMessage: "",
  };

  for (const pipeline of pipelines.values()) {
    const { data, pipelineStatus } = processPipeline({
      originalData: response.data,
      audience,
      configs,
      pipeline,
    });
    response.data = data;
    response.pipelineStatus = [...response.pipelineStatus, pipelineStatus];

    const lastStatus = pipelineStatus.stepStatus.at(-1)?.abortStatus;
    if (
      lastStatus &&
      [AbortStatus.ALL, AbortStatus.DROP_MESSAGE].includes(lastStatus)
    ) {
      break;
    }
  }

  sendTail({
    configs,
    audience,
    originalData: data,
    newData: response.data,
  });

  const finalStatus = response.pipelineStatus.at(-1)?.stepStatus.at(-1);

  return Promise.resolve({
    ...response,
    dropMessage: finalStatus?.abortStatus === AbortStatus.DROP_MESSAGE,
    error: !!finalStatus?.error,
    errorMessage: finalStatus?.errorMessage ?? "",
  });
};

const notifyStep = async (
  configs: PipelineConfigs,
  step: PipelineStep,
  pipeline: InternalPipeline
) => {
  console.debug("notifying error step", step.name);
  try {
    await configs.grpcClient.notify(
      {
        pipelineId: pipeline.id,
        stepName: step.name,
        occurredAtUnixTsUtc: Date.now().toString(),
      },
      { meta: { "auth-token": configs.streamdalToken } }
    );
  } catch (e) {
    console.error("error sending notification to server", e);
  }
};

/**
 * DROP_MESSAGE is the same as ABORT_ALL, but sets a flag on the final response,
 * and overrides the other settings. ABORT_ALL overrides ABORT_CURRENT,
 */
const getStepStatus = (resultConditions: PipelineStepCondition[]): any =>
  resultConditions.includes(PipelineStepCondition.DISCARD_MESSAGE)
    ? AbortStatus.DROP_MESSAGE
    : resultConditions.includes(PipelineStepCondition.ABORT_ALL)
    ? AbortStatus.ALL
    : resultConditions.includes(PipelineStepCondition.ABORT_CURRENT)
    ? AbortStatus.CURRENT
    : AbortStatus.UNSET;

export const resultCondition = ({
  configs,
  step,
  pipeline,
  stepStatus,
}: {
  configs: PipelineConfigs;
  step: PipelineStep;
  pipeline: InternalPipeline;
  stepStatus: StepStatus;
}) => {
  const conditions = stepStatus.error ? step.onFailure : step.onSuccess;

  conditions.includes(PipelineStepCondition.NOTIFY) &&
    void notifyStep(configs, step, pipeline);

  stepStatus.abortStatus = getStepStatus(conditions);
};

export const runStep = ({
  originalData,
  audience,
  configs,
  step,
  pipeline,
}: {
  originalData: Uint8Array;
  audience: Audience;
  configs: PipelineConfigs;
  step: PipelineStep;
  pipeline: InternalPipeline;
}): { stepStatus: StepStatus; data: Uint8Array } => {
  const stepStatus: StepStatus = {
    name: step.name,
    error: false,
    errorMessage: "",
    abortStatus: AbortStatus.UNSET,
  };

  const payloadSize = originalData.length;
  let data = originalData;

  try {
    const { outputPayload, outputStep, exitCode, exitMsg } = runWasm({
      step,
      originalData,
    });

    //
    // output gets passed back as data for the next function
    const error = exitCode !== WASMExitCode.WASM_EXIT_CODE_SUCCESS;
    data = error ? originalData : outputPayload;
    stepStatus.error = error;
    stepStatus.errorMessage = error ? exitMsg : "";

    !error &&
      step.name === "Infer Schema" &&
      void sendSchema({ configs, audience, schema: outputStep });
  } catch (error: any) {
    console.error(`error running pipeline step - ${step.name}`, error);
    stepStatus.error = true;
    stepStatus.errorMessage = error.toString();
  }

  resultCondition({ configs, step, pipeline, stepStatus });
  void stepMetrics({ audience, stepStatus, pipeline, payloadSize });

  return { data, stepStatus };
};
