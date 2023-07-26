import { Audience } from "@streamdal/snitch-protos/protos/internal_api.js";
import { EnhancedStep, internalPipelines, PipelineType } from "./pipeline.js";
import {
  PipelineStep,
  PipelineStepCondition,
  WASMExitCode,
} from "@streamdal/snitch-protos/protos/pipeline.js";
import { runWasm } from "./wasm.js";
import { grpcClient } from "./index.js";

export interface SnitchRequest {
  audience: Audience;
  data: Uint8Array;
}

export interface StepStatus {
  id: string;
  name: string;
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
// Flatten all pipelines steps so we can have a single loop, but
// add pipeline information to the steps so we can log/notify
// appropriately
const mapAllSteps = (pipeLines: PipelineType[]): EnhancedStep[] =>
  pipeLines
    .map((p: PipelineType) =>
      p.steps.map((s: PipelineStep) => ({
        ...s,
        pipelineId: p.id,
        pipelineName: p.name,
      }))
    )
    .flat(1);

export const processPipelines = async ({
  audience,
  data,
}: SnitchRequest): Promise<SnitchResponse> => {
  const pipeLines = internalPipelines.get(audience);

  if (!pipeLines) {
    const message = "no pipelines found for this audience, returning data";
    console.info(message);
    return { data, error: true, message };
  }

  const allSteps = mapAllSteps(pipeLines);

  //
  // wrapping data up in a status object so we can track
  // statuses and set/pass along the data from step to step
  // since it can be altered.
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
    error: !finalStatus?.error,
    message: finalStatus?.message || "Success",
  };
};

const notifyStep = async (step: StepStatus) => {
  console.info("notifying error step", step);
  await grpcClient.notify(
    {
      ruleId: step.id || "unknown",
      ruleName: step.name || "unknown",
      occurredAtUnixTsUtc: BigInt(Date.now()),
      Metadata: {},
    },
    { meta: { "auth-token": process.env.SNITCH_TOKEN || "1234" } }
  );
};

export const runStep = async ({
  step,
  pipeline,
}: {
  step: EnhancedStep;
  pipeline: PipelinesStatus;
}): Promise<PipelinesStatus> => {
  const stepStatus: StepStatus = {
    id: step.id,
    name: step.name,
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

    if (
      stepStatus.error &&
      step.conditions.includes(PipelineStepCondition.CONDITION_NOTIFY)
    ) {
      void notifyStep(stepStatus);
    }

    if (
      stepStatus.error &&
      step.conditions.includes(PipelineStepCondition.CONDITION_ABORT)
    ) {
      stepStatus.abort = true;
    }
  } catch (error: any) {
    stepStatus.error = true;
    stepStatus.message = error.toString();
    stepStatus.abort = true;
  }

  return { data, stepStatuses: [...pipeline.stepStatuses, stepStatus] };
};
