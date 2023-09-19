import { ClientStreamingCall } from "@protobuf-ts/runtime-rpc";
import {
  Audience,
  StandardResponse,
  TailResponse,
  TailResponseType,
} from "@streamdal/snitch-protos/protos/sp_common";
import { IInternalClient } from "@streamdal/snitch-protos/protos/sp_internal.client";
import {
  PipelineStep,
  PipelineStepCondition,
} from "@streamdal/snitch-protos/protos/sp_pipeline";
import { WASMExitCode } from "@streamdal/snitch-protos/protos/sp_wsm";
import { v4 as uuidv4 } from "uuid";

import { SnitchRequest, SnitchResponse } from "../snitch.js";
import { lock, metrics } from "./metrics.js";
import { EnhancedStep, InternalPipeline } from "./pipeline.js";
import { audienceKey, internal } from "./register.js";
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
  tailCall: ClientStreamingCall<TailResponse, StandardResponse>;
  snitchToken: string;
  sessionId: string;
  dryRun: boolean;
}

export interface TailRequest {
  configs: PipelineConfigs;
  audience: Audience;
  originalData: Uint8Array;
  newData: Uint8Array;
  pipeline: InternalPipeline;
}

//
// add pipeline information to the steps so we can log/notify
// appropriately as we go
const mapAllSteps = (pipeline: InternalPipeline): EnhancedStep[] =>
  pipeline.steps.map((s: PipelineStep) => ({
    ...s,
    pipelineId: pipeline.id,
    pipelineName: pipeline.name,
  })) as EnhancedStep[];

export const sendTail = ({
  configs,
  pipeline,
  audience,
  originalData,
  newData,
}: TailRequest) => {
  void configs.tailCall.requests.send(
    TailResponse.create({
      type: TailResponseType.PAYLOAD,
      tailRequestId: uuidv4(),
      audience,
      pipelineId: pipeline.id,
      sessionId: configs.sessionId,
      originalData,
      newData,
    })
  );
};

export const processPipeline = async ({
  configs,
  audience,
  data,
}: { configs: PipelineConfigs } & SnitchRequest): Promise<SnitchResponse> => {
  const pipeline = internal.pipelines.get(audienceKey(audience));

  if (!pipeline || pipeline.paused) {
    const message =
      "no active pipeline found for this audience, returning data";
    console.debug(message);
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
    console.debug(
      `running pipeline step ${step.pipelineName} - ${step.name}...`
    );

    pipelineStatus = await runStep({ configs, step, pipeline: pipelineStatus });

    console.debug(`pipeline step ${step.pipelineName} - ${step.name} complete`);

    if (pipelineStatus.stepStatuses.at(-1)?.abort) {
      break;
    }
  }

  pipeline.tail &&
    sendTail({
      configs,
      pipeline,
      audience,
      originalData,
      newData: pipelineStatus.data,
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
  await configs.grpcClient.notify(
    {
      pipelineId: step.pipelineId,
      stepName: step.stepName,
      occurredAtUnixTsUtc: BigInt(Date.now()),
    },
    { meta: { "auth-token": configs.snitchToken } }
  );
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

// eslint-disable-next-line @typescript-eslint/require-await
export const stepMetrics = async (stepStatus: StepStatus) => {
  lock.writeLock((release) => {
    metrics.push({
      name: "Rule run",
      value: 1,
      labels: {
        pipeLineId: stepStatus.pipelineId,
        stepName: stepStatus.stepName,
        result: stepStatus.error ? "failure" : "success",
      },
    });
    release();
  });
};

export const runStep = async ({
  configs,
  step,
  pipeline,
}: {
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

  try {
    const { outputPayload, exitCode, exitMsg } = await runWasm({
      step,
      data,
    });

    //
    // output gets passed back as data for the next function
    data = outputPayload;
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
  void stepMetrics(stepStatus);

  return { data, stepStatuses: [...pipeline.stepStatuses, stepStatus] };
};
