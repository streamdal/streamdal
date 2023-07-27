import {
  EnhancedStep,
  InternalPipeline,
  internalPipelines,
} from "./pipeline.js";

import { runWasm } from "./wasm.js";
import { grpcClient } from "./index.js";
import { Audience } from "@streamdal/snitch-protos/protos/common.js";
import {
  PipelineStep,
  PipelineStepCondition,
} from "@streamdal/snitch-protos/protos/pipeline.js";
import { WASMExitCode } from "@streamdal/snitch-protos/protos/wasm.js";

export interface SnitchRequest {
  audience: Audience;
  data: Uint8Array;
}

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

export interface SnitchResponse {
  data: Uint8Array;
  error: boolean;
  message?: string;
  stepStatuses?: StepStatus[];
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

export const processPipeline = async ({
  audience,
  data,
}: SnitchRequest): Promise<SnitchResponse> => {
  const pipeline = internalPipelines.get(audience);

  if (!pipeline) {
    const message = "no pipeline found for this audience, returning data";
    console.info(message);
    return { data, error: true, message };
  }

  const allSteps = mapAllSteps(pipeline);

  //
  // wrapping data up in a status object so we can track
  // statuses pass along updated data from step to step
  let pipelineStatus: PipelinesStatus = {
    data,
    stepStatuses: [],
  };

  for (const step of allSteps) {
    console.info(
      `running pipeline step ${step.pipelineName} - ${step.name}...`
    );

    pipelineStatus = await runStep({
      step,
      pipeline: pipelineStatus,
    });

    console.info(`pipeline step ${step.pipelineName} - ${step.name} complete`);

    if (pipelineStatus.stepStatuses.at(-1)?.abort) {
      break;
    }
  }

  //
  // For now top level response status is synonymous with the last step status
  const finalStatus = pipelineStatus.stepStatuses.at(-1);

  return {
    ...pipelineStatus,
    error: !!finalStatus?.error,
    message: finalStatus?.message || "Success",
  };
};

const notifyStep = async (step: StepStatus) => {
  console.info("notifying error step", step);
  await grpcClient.notify(
    {
      pipelineId: step.pipelineId,
      stepName: step.stepName,
      occurredAtUnixTsUtc: BigInt(Date.now()),
    },
    { meta: { "auth-token": process.env.SNITCH_TOKEN || "1234" } }
  );
};

export const resultCondition = (
  conditions: PipelineStepCondition[],
  stepStatus: StepStatus
) => {
  if (conditions.includes(PipelineStepCondition.NOTIFY)) {
    void notifyStep(stepStatus);
  }

  if (conditions.includes(PipelineStepCondition.ABORT)) {
    stepStatus.abort = true;
  }
};

export const runStep = async ({
  step,
  pipeline,
}: {
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
    const { output, exitCode, exitMsg } = await runWasm({
      wasmBytes: step.WasmBytes,
      wasmFunction: step.WasmFunction,
      data: pipeline.data,
    });

    //
    // output gets passed back as data for the next function
    data = output;
    stepStatus.error = exitCode !== WASMExitCode.WASM_EXIT_CODE_SUCCESS;
    stepStatus.message = exitMsg;
  } catch (error: any) {
    stepStatus.error = true;
    stepStatus.message = error.toString();
    stepStatus.abort = true;
  }

  resultCondition(
    stepStatus.error ? step.onFailure : step.onSuccess,
    stepStatus
  );

  return { data, stepStatuses: [...pipeline.stepStatuses, stepStatus] };
};
