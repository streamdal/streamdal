import { Command, TailCommand } from "@streamdal/protos/protos/sp_command";
import { Audience, TailRequestType } from "@streamdal/protos/protos/sp_common";
import { GetSetPipelinesCommandsByServiceResponse } from "@streamdal/protos/protos/sp_internal";
import { Pipeline, PipelineStep } from "@streamdal/protos/protos/sp_pipeline";

import { Configs } from "../streamdal.js";
import { kvCommand } from "./kv.js";
import { audienceKey, internal, Tail } from "./register.js";
import { TokenBucket } from "./utils/tokenBucket.js";
import { instantiateWasm } from "./wasm.js";

export const initPipelines = async (configs: Configs) => {
  try {
    if (internal.pipelineInitialized) {
      return;
    }

    console.debug("initializing pipelines");
    const { response }: { response: GetSetPipelinesCommandsByServiceResponse } =
      await configs.grpcClient.getSetPipelinesCommandsByService(
        {
          serviceName: configs.serviceName.toLowerCase(),
        },
        { meta: { "auth-token": configs.streamdalToken } }
      );

    for await (const [k, v] of Object.entries(response.wasmModules)) {
      await instantiateWasm(k, v.bytes);
    }

    for await (const command of response.setPipelineCommands) {
      await processResponse(command);
    }
    internal.pipelineInitialized = true;
  } catch (e) {
    console.error("Error initializing pipelines", e);
  }
};

export const processResponse = async (response: Command) => {
  if (response.command.oneofKind === "kv") {
    kvCommand(response.command.kv);
    return;
  }

  if (!response.audience) {
    response.command.oneofKind !== "keepAlive" &&
      console.debug("command response has no audience, ignoring");
    return;
  }

  switch (response.command.oneofKind) {
    case "setPipelines":
      await setPipelines(
        response.audience,
        response.command.setPipelines.pipelines
      );
      break;
    case "tail":
      tailPipeline(response.audience, response.command.tail);
      break;
  }
};

export const buildPipeline = async (pipeline: Pipeline): Promise<Pipeline> => {
  return {
    ...pipeline,
    steps: await Promise.all(
      pipeline.steps.map(async (step: PipelineStep) => {
        await instantiateWasm(step.WasmId, step.WasmBytes);
        return {
          ...step,
          WasmBytes: undefined,
        };
      })
    ),
  };
};

export const setPipelines = async (
  audience: Audience,
  pipelines: Pipeline[]
) => {
  const key = audienceKey(audience);
  const mappedPipelines: [string, Pipeline][] = await Promise.all(
    pipelines.map(async (p) => [p.id, await buildPipeline(p)])
  );
  internal.pipelines.set(key, new Map<string, Pipeline>(mappedPipelines));
};

export const tailPipeline = (audience: Audience, { request }: TailCommand) => {
  console.debug("received a tail command for audience", audience);
  if (!request) {
    console.debug("no tail request details specified, skipping");
    return;
  }

  switch (request.type) {
    case TailRequestType.START: {
      console.debug(
        "received a START tail: adding entry to audiences for tail id",
        audience
      );
      // Create inner map if it doesn't exist
      if (!internal.audiences.has(audienceKey(audience))) {
        internal.audiences.set(audienceKey(audience), {
          audience,
          tails: new Map<string, Tail>(),
        });
      }
      // Add entry (@JH, OK if overwritten?)
      request.id &&
        internal.audiences.get(audienceKey(audience))?.tails.set(request.id, {
          tail: request.type === TailRequestType.START,
          tailRequestId: request.id,
          sampleBucket: new TokenBucket(
            request.sampleOptions?.sampleRate,
            request.sampleOptions?.sampleIntervalSeconds
          ),
        });
      break;
    }
    case TailRequestType.STOP: {
      console.debug(
        "received a STOP tail: removing entry from audiences for tail id",
        request.id
      );
      request.id &&
        internal.audiences.get(audienceKey(audience))?.tails.delete(request.id);
      break;
    }
    default:
      console.error("unknown tail request type ", request.type);
      break;
  }
};
