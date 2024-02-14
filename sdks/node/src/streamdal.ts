import { Audience, OperationType } from "@streamdal/protos/protos/sp_common";
import { IInternalClient } from "@streamdal/protos/protos/sp_internal.client";
import { ExecStatus, SDKResponse } from "@streamdal/protos/protos/sp_sdk";
import { v4 as uuidv4 } from "uuid";

import { addAudiences } from "./internal/audience.js";
import { client } from "./internal/grpc.js";
import { heartbeat, HEARTBEAT_INTERVAL } from "./internal/heartbeat.js";
import { METRIC_INTERVAL, sendMetrics } from "./internal/metrics.js";
import { retryProcessPipelines } from "./internal/process.js";
import { register as internalRegister } from "./internal/register.js";

export { Audience, ExecStatus, OperationType, SDKResponse };

export interface StreamdalConfigs {
  streamdalUrl?: string;
  streamdalToken?: string;
  serviceName?: string;
  pipelineTimeout?: string;
  stepTimeout?: string;
  dryRun?: boolean;
  audiences?: Audience[];
  quiet?: boolean;
}

export interface InternalConfigs {
  grpcClient: IInternalClient;
  streamdalUrl: string;
  streamdalToken: string;
  serviceName: string;
  pipelineTimeout: string;
  stepTimeout: string;
  dryRun: boolean;
  sessionId: string;
  audiences?: Audience[];
}

export interface StreamdalRequest {
  audience: Audience;
  data: Uint8Array;
}

export interface Streamdal {
  process: (arg: StreamdalRequest) => Promise<SDKResponse>;
}

export const registerStreamdal = async (
  configs: StreamdalConfigs
): Promise<Streamdal> => {
  if (configs.quiet || process.env.NODE_ENV === "production") {
    console.debug = () => null;
  }

  const url = configs.streamdalUrl ?? process.env.STREAMDAL_URL;
  const token = configs.streamdalToken ?? process.env.STREAMDAL_TOKEN;
  const name = configs.serviceName ?? process.env.STREAMDAL_SERVICE_NAME;

  if (!url || !token || !name) {
    throw new Error(`Required configs are missing. You must provide configs streamdalUrl, streamdalToken and serviceName 
        either as constructor arguments to Streamdal() or as environment variables in the form of STREAMDAL_URL, STREAMDAL_TOKEN and STREAMDAL_SERVICE_NAME`);
  }

  const sessionId = uuidv4();
  const grpcClient = client(url);

  const internalConfigs = {
    grpcClient,
    sessionId,
    streamdalUrl: url,
    streamdalToken: token,
    serviceName: name,
    pipelineTimeout:
      configs.pipelineTimeout ??
      process.env.STREAMDAL_PIPELINE_TIMEOUT ??
      "100",
    stepTimeout:
      configs.stepTimeout ?? process.env.STREAMDAL_STEP_TIMEOUT ?? "10",
    dryRun: configs.dryRun ?? !!process.env.STREAMDAL_DRY_RUN,
    audiences: configs.audiences,
  };

  // Heartbeat is obsolete
  setInterval(() => {
    void heartbeat(internalConfigs);
  }, HEARTBEAT_INTERVAL);

  setInterval(() => {
    sendMetrics(internalConfigs);
  }, METRIC_INTERVAL);

  await addAudiences(internalConfigs);
  await internalRegister(internalConfigs);

  return {
    process: async ({
      audience,
      data,
    }: StreamdalRequest): Promise<SDKResponse> => {
      return retryProcessPipelines({
        configs: internalConfigs,
        audience,
        data,
      });
    },
  };
};
