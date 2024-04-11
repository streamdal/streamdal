import { Audience } from "@streamdal/protos/protos/sp_common";
import { IInternalClient } from "@streamdal/protos/protos/sp_internal.client";
import {
  AbortCondition,
  Pipeline,
  PipelineStep,
} from "@streamdal/protos/protos/sp_pipeline";
import {
  ExecStatus,
  PipelineStatus,
  StepStatus,
} from "@streamdal/protos/protos/sp_sdk";
import { InterStepResult, WASMExitCode } from "@streamdal/protos/protos/sp_wsm";

import { InternalConfigs, SDKResponse, StreamdalRequest } from "../index.js";
import { addAudience } from "./audience.js";
import { httpRequest } from "./httpRequest.js";
import { audienceMetrics, stepMetrics } from "./metrics.js";
import { notifyStep } from "./notify.js";
import { initPipelines } from "./pipeline.js";
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

export type EnhancedStepStatus = StepStatus & {
  metadata: Record<string, string>;
};

export type EnchancedPipelineStatus = PipelineStatus & {
  metadata: Record<string, string>;
};

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
  configs: InternalConfigs;
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
        if (retries >= MAX_PIPELINE_RETRIES) {
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
  const statusMessage =
    "Node SDK not registered with the server, skipping pipeline. Is the server running?";
  console.error(statusMessage);
  return Promise.resolve({
    data,
    status: ExecStatus.ERROR,
    pipelineStatus: [],
    statusMessage,
    metadata: {},
  });
};

export const processPipeline = async ({
  originalData,
  audience,
  configs,
  pipeline,
}: {
  originalData: Uint8Array;
  audience: Audience;
  configs: InternalConfigs;
  pipeline: Pipeline;
}): Promise<{ pipelineStatus: EnchancedPipelineStatus; data: Uint8Array }> => {
  const pipelineStatus: EnchancedPipelineStatus = {
    id: pipeline.id,
    name: pipeline.name,
    stepStatus: [],
    metadata: {},
  };
  let data = originalData;
  let lastStepResult = undefined;

  for (const step of pipeline.steps) {
    if (configs.dryRun) {
      console.debug(
        `Dry run set. Found pipeline: ${pipeline.name}, step: ${step.name}...not running.`
      );
      continue;
    }

    console.debug(`running pipeline: ${pipeline.name}, step: ${step.name}...`);

    const {
      data: newData,
      stepStatus,
      interStepResult,
    } = await runStep({
      originalData: data,
      audience,
      configs,
      step,
      pipeline,
      lastStepResult,
    });
    data = newData;
    pipelineStatus.stepStatus = [...pipelineStatus.stepStatus, stepStatus];
    lastStepResult = interStepResult;

    if (Object.keys(stepStatus.metadata).length) {
      pipelineStatus.metadata = {
        ...pipelineStatus.metadata,
        ...stepStatus.metadata,
      };
    }

    if (
      [AbortCondition.ABORT_CURRENT, AbortCondition.ABORT_ALL].includes(
        stepStatus.abortCondition
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
}: { configs: InternalConfigs } & StreamdalRequest): Promise<SDKResponse> => {
  await initPipelines(configs);
  const internalAudience = { serviceName: configs.serviceName, ...audience };
  await addAudience({
    configs: configs,
    audience: internalAudience,
  });

  const key = audienceKey(internalAudience);
  const pipelines = internal.pipelines.get(key);

  void audienceMetrics(internalAudience, data.length);

  if (!pipelines) {
    const statusMessage =
      "No active pipelines found for this audience, returning data";
    console.debug(statusMessage);

    sendTail({
      configs,
      audience: internalAudience,
      originalData: data,
    });

    return {
      data,
      status: ExecStatus.TRUE,
      statusMessage,
      pipelineStatus: [],
      metadata: {},
    };
  }

  const response: SDKResponse = {
    data,
    decodedData: new TextDecoder().decode(data),
    pipelineStatus: [],
    status: ExecStatus.TRUE,
    statusMessage: "",
    metadata: {},
  };

  for (const pipeline of pipelines.values()) {
    const { data, pipelineStatus } = await processPipeline({
      originalData: response.data,
      audience: internalAudience,
      configs,
      pipeline,
    });
    response.data = data;
    response.pipelineStatus = [...response.pipelineStatus, pipelineStatus];

    if (Object.keys(pipelineStatus.metadata).length) {
      response.metadata = { ...response.metadata, ...pipelineStatus.metadata };
    }

    const lastAbort = pipelineStatus.stepStatus.at(-1)?.abortCondition;
    if (lastAbort && [AbortCondition.ABORT_ALL].includes(lastAbort)) {
      break;
    }
  }

  sendTail({
    configs,
    audience: internalAudience,
    originalData: data,
    newData: response.data,
  });

  const finalStatus = response.pipelineStatus.at(-1)?.stepStatus.at(-1);

  return Promise.resolve({
    ...response,
    ...(finalStatus && {
      status: finalStatus.status,
      statusMessage: finalStatus.statusMessage,
    }),
  });
};

export const getStepStatus = (exitCode: WASMExitCode): ExecStatus =>
  (exitCode === WASMExitCode.WASM_EXIT_CODE_TRUE
    ? ExecStatus.TRUE
    : exitCode === WASMExitCode.WASM_EXIT_CODE_FALSE
    ? ExecStatus.FALSE
    : exitCode === WASMExitCode.WASM_EXIT_CODE_ERROR
    ? ExecStatus.ERROR
    : ExecStatus.UNSET) as ExecStatus;

export const resultCondition = ({
  configs,
  audience,
  step,
  pipeline,
  stepStatus,
  payload,
}: {
  configs: PipelineConfigs;
  audience: Audience;
  step: PipelineStep;
  pipeline: Pipeline;
  stepStatus: EnhancedStepStatus;
  payload: Uint8Array;
}) => {
  const condition =
    stepStatus.status === ExecStatus.TRUE
      ? step.onTrue
      : stepStatus.status === ExecStatus.FALSE
      ? step.onFalse
      : step.onError;

  condition?.notification?.notificationConfigIds.length &&
    void notifyStep({
      configs,
      audience,
      step,
      stepStatus,
      pipelineId: pipeline.id,
      payload,
    });

  if (condition?.metadata && Object.keys(condition.metadata).length) {
    stepStatus.metadata = { ...stepStatus.metadata, ...condition.metadata };
  }

  stepStatus.abortCondition = condition?.abort
    ? condition.abort
    : AbortCondition.UNSET;
};

export const runStep = async ({
  originalData,
  audience,
  configs,
  step,
  pipeline,
  lastStepResult,
}: {
  originalData: Uint8Array;
  audience: Audience;
  configs: PipelineConfigs;
  step: PipelineStep;
  pipeline: Pipeline;
  lastStepResult?: InterStepResult;
}): Promise<{
  stepStatus: EnhancedStepStatus;
  data: Uint8Array;
  interStepResult?: InterStepResult;
}> => {
  const stepStatus: EnhancedStepStatus = {
    name: step.name,
    status: ExecStatus.TRUE,
    abortCondition: AbortCondition.UNSET,
    metadata: {},
  };

  const payloadSize = originalData.length;
  let data = originalData;
  let stepResult;

  try {
    const { outputPayload, outputStep, exitCode, exitMsg, interStepResult } =
      step.step.oneofKind === "httpRequest"
        ? await httpRequest({ step })
        : runWasm({
            step,
            originalData,
            interStepResult: lastStepResult,
          });

    //
    // output gets passed back as data for the next function
    stepStatus.status = getStepStatus(exitCode);

    if (stepStatus.status !== ExecStatus.ERROR && outputPayload) {
      data = outputPayload;
    }

    stepStatus.statusMessage = exitMsg;
    stepResult = interStepResult;

    stepStatus.status !== ExecStatus.ERROR &&
      step.name.includes("Infer Schema") &&
      void sendSchema({ configs, audience, schema: outputStep });
  } catch (error: any) {
    console.error(`error running pipeline step - ${step.name}`, error);
    stepStatus.status = ExecStatus.ERROR;
    stepStatus.statusMessage = error.toString();
  }

  resultCondition({
    configs,
    audience,
    step,
    pipeline,
    stepStatus,
    payload: data,
  });

  void stepMetrics({ audience, stepStatus, pipeline, payloadSize });

  return { data, interStepResult: stepResult, stepStatus };
};
