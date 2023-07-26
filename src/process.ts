import { Audience } from "@streamdal/snitch-protos/protos/internal_api.js";
import { internalPipelines } from "./pipeline.js";
import {
  PipelineStep,
  PipelineStepCondition,
  SetPipelineCommand,
  WASMExitCode,
} from "@streamdal/snitch-protos/protos/pipeline.js";
import { runWasm } from "./wasm.js";
import { grpcClient } from "./index.js";

export interface SnitchRequest {
  audience: Audience;
  data: Uint8Array;
}

export interface Status {
  pipeline?: SetPipelineCommand;
  step?: PipelineStep;
  error?: boolean;
  message?: string;
  abort?: boolean;
  data: Uint8Array;
}

export interface SnitchResponse {
  data: Uint8Array;
  error: boolean;
  message?: string;
}

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

  //
  // wrapping data up in a status object so we can bubble up
  // transformations and errors from nested steps
  const status: Status = {
    data,
    error: false,
    message: "",
  };

  for (const pipeline of pipeLines) {
    console.info(`running pipeline ${pipeline.name}...`);
    const result = await runPipeline({ pipeline, ...status });
    status.data = result.data;

    if (result.abort) {
      return {
        data: result.data,
        error: true,
        message: result.message,
      };
    }
    console.info(`pipeline ${pipeline.name} complete`);
  }

  return { data: status.data, error: false, message: "Success" };
};

const notifyStep = async (step: Status) => {
  console.info("notifying error step", step);
  await grpcClient.notify(
    {
      ruleId: step.step?.id || "unknown",
      ruleName: step.step?.name || "unknown",
      occurredAtUnixTsUtc: BigInt(Date.now()),
      Metadata: {},
    },
    { meta: { "auth-token": process.env.SNITCH_TOKEN || "1234" } }
  );
};

export const runPipeline = async ({
  pipeline,
  data,
}: {
  pipeline: SetPipelineCommand;
  data: Uint8Array;
}): Promise<Status> => {
  const status: Status = {
    pipeline,
    data,
    error: false,
    message: "",
  };

  try {
    for (const step of pipeline.steps) {
      console.info(`running pipeline step ${step.name}...`);
      const { output, exitCode, exitMsg } = await runWasm({
        wasmBytes: step.WasmBytes,
        wasmFunction: step.WasmFunction,
        data: status.data,
      });

      status.step = step;
      status.data = output;
      status.error = exitCode !== WASMExitCode.WASM_EXIT_CODE_SUCCESS;
      status.message = exitMsg;

      exitCode === WASMExitCode.WASM_EXIT_CODE_SUCCESS
        ? console.info(`pipeline step ${step.name} completed successfully`)
        : console.info(
            `pipeline step ${step.name} completed with error ${exitMsg}`
          );

      if (exitCode === WASMExitCode.WASM_EXIT_CODE_SUCCESS) {
        continue;
      }

      if (step.conditions.includes(PipelineStepCondition.CONDITION_NOTIFY)) {
        void notifyStep(status);
      }

      if (step.conditions.includes(PipelineStepCondition.CONDITION_ABORT)) {
        console.info("aborting the pipeline per step condition");
        return {
          data: status.data,
          error: true,
          message: status.message,
          abort: true,
        };
      }
    }
  } catch (error: any) {
    return {
      data: status.data,
      error: true,
      message: error.toString(),
      abort: true,
    };
  }

  return status;
};
