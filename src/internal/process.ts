import { Audience } from "@streamdal/protos/protos/sp_common";
import { IInternalClient } from "@streamdal/protos/protos/sp_internal.client";
import {
  PipelineStep,
  PipelineStepCondition,
} from "@streamdal/protos/protos/sp_pipeline";
import { WASMExitCode } from "@streamdal/protos/protos/sp_wsm";

import { Configs, StreamdalRequest, StreamdalResponse } from "../streamdal.js";
import { addAudience } from "./audience.js";
import { audienceMetrics, stepMetrics } from "./metrics.js";
import { EnhancedStep, initPipelines, InternalPipeline } from "./pipeline.js";
import { audienceKey, internal, TailStatus } from "./register.js";
import { sendTail } from "./tail.js";
import { runWasm } from "./wasm.js";

export interface StepStatus {
  stepName: string;
  pipelineId: string;
  pipelineName: string;
  error: boolean;
  message?: string;
  abort: boolean;
}

export interface PipelinesStatus {
  data: Uint8Array;
  stepStatuses: StepStatus[];
}

export interface PipelineConfigs {
  grpcClient: IInternalClient;
  streamdalToken: string;
  sessionId: string;
  dryRun: boolean;
}

export interface TailRequest {
  configs: PipelineConfigs;
  tails?: Map<string, TailStatus>;
  audience: Audience;
  originalData: Uint8Array;
  newData?: Uint8Array;
}

const MAX_PAYLOAD_SIZE = 1024 * 1024; // 1 megabyte
const MAX_PIPELINE_RETRIES = 10;
const PIPELINE_RETRY_INTERVAL = 1000;

//
// add pipeline information to the steps so we can log/notify
// appropriately as we go
const mapAllSteps = (pipeline: InternalPipeline): EnhancedStep[] =>
  pipeline.steps.map((s: PipelineStep) => ({
    ...s,
    pipelineId: pipeline.id,
    pipelineName: pipeline.name,
  })) as EnhancedStep[];

export const retryProcessPipeline = async ({
  configs,
  audience,
  data,
}: {
  configs: Configs;
} & StreamdalRequest): Promise<StreamdalResponse> => {
  let retries = 1;
  try {
    if (internal.registered) {
      return processPipeline({
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
            processPipeline({
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
  const message =
    "Node SDK not registered with the server, skipping pipeline. Is the server running?";
  console.error(message);
  return Promise.resolve({
    data,
    error: true,
    message,
  });
};

export const processPipeline = async ({
  configs,
  audience,
  data,
}: {
  configs: Configs;
} & StreamdalRequest): Promise<StreamdalResponse> => {
  if (!internal.pipelineInitialized) {
    await initPipelines(configs);
  }

  await addAudience({ configs: configs, audience });

  const key = audienceKey(audience);
  const pipeline = internal.pipelines.get(key);
  const tails = internal.audiences.get(key)?.tails;

  void audienceMetrics(audience, data.length);

  if (!pipeline || pipeline.paused) {
    const message =
      "no active pipeline found for this audience, returning data";
    console.debug(message);

    sendTail({
      configs,
      tails,
      audience,
      originalData: data,
    });

    return { data, error: true, message };
  }

  //
  // hold for tail
  const originalData = data;
  const allSteps = mapAllSteps(pipeline);

  //
  // wrapping data up in a status object so we can track
  // statuses pass along updated data from step to step
  let pipelineStatus: PipelinesStatus = {
    data,
    stepStatuses: [],
  };

  for (const step of allSteps) {
    if (configs.dryRun) {
      console.debug(
        `Dry run set. Found pipeline step ${step.pipelineName} - ${step.name}...not running.`
      );
      continue;
    }

    console.debug(
      `running pipeline step ${step.pipelineName} - ${step.name}...`
    );

    pipelineStatus = await runStep({
      audience,
      configs,
      step,
      pipeline: pipelineStatus,
    });

    console.debug(`pipeline step ${step.pipelineName} - ${step.name} complete`);

    if (pipelineStatus.stepStatuses.at(-1)?.abort) {
      break;
    }
  }

  sendTail({
    configs,
    tails,
    audience,
    originalData,
    newData: data,
  });

  //
  // For now top level response status is synonymous with the last step status
  const finalStatus = pipelineStatus.stepStatuses.at(-1);

  return {
    ...pipelineStatus,
    error: !!finalStatus?.error,
    message: finalStatus?.message ?? "Success",
  };
};

const notifyStep = async (configs: PipelineConfigs, step: StepStatus) => {
  console.debug("notifying error step", step);
  try {
    await configs.grpcClient.notify(
      {
        pipelineId: step.pipelineId,
        stepName: step.stepName,
        occurredAtUnixTsUtc: Date.now().toString(),
      },
      { meta: { "auth-token": configs.streamdalToken } }
    );
  } catch (e) {
    console.error("error sending notification to server", e);
  }
};

export const resultCondition = (
  configs: PipelineConfigs,
  conditions: PipelineStepCondition[],
  stepStatus: StepStatus
) => {
  if (conditions.includes(PipelineStepCondition.NOTIFY)) {
    void notifyStep(configs, stepStatus);
  }

  if (conditions.includes(PipelineStepCondition.ABORT)) {
    stepStatus.abort = true;
  }
};

export const runStep = async ({
  audience,
  configs,
  step,
  pipeline,
}: {
  audience: Audience;
  configs: PipelineConfigs;
  step: EnhancedStep;
  pipeline: PipelinesStatus;
}): Promise<PipelinesStatus> => {
  const stepStatus: StepStatus = {
    stepName: step.name,
    pipelineId: step.pipelineId,
    pipelineName: step.pipelineName,
    error: false,
    abort: false,
  };

  let data = pipeline.data;
  const payloadSize = data.length;

  try {
    const { outputPayload, exitCode, exitMsg } =
      payloadSize < MAX_PAYLOAD_SIZE
        ? await runWasm({
            step,
            data,
          })
        : {
            outputPayload: new Uint8Array(),
            exitCode: WASMExitCode.WASM_EXIT_CODE_FAILURE,
            exitMsg: "Payload exceeds maximum size",
          };

    //
    // output gets passed back as data for the next function
    data =
      exitCode === WASMExitCode.WASM_EXIT_CODE_SUCCESS ? outputPayload : data;
    stepStatus.error = exitCode !== WASMExitCode.WASM_EXIT_CODE_SUCCESS;
    stepStatus.message = exitMsg;
  } catch (error: any) {
    stepStatus.error = true;
    stepStatus.message = error.toString();
    stepStatus.abort = true;
  }

  resultCondition(
    configs,
    stepStatus.error ? step.onFailure : step.onSuccess,
    stepStatus
  );
  void stepMetrics(audience, stepStatus, payloadSize);

  return { data, stepStatuses: [...pipeline.stepStatuses, stepStatus] };
};
