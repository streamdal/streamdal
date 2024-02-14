import { Audience, OperationType } from "@streamdal/protos/protos/sp_common";
import { IInternalClient } from "@streamdal/protos/protos/sp_internal.client";
import { ExecStatus, SDKResponse } from "@streamdal/protos/protos/sp_sdk";
import { v4 as uuidv4 } from "uuid";

import { addAudiences } from "./internal/audience.js";
import { client } from "./internal/grpc.js";
import { heartbeat, HEARTBEAT_INTERVAL } from "./internal/heartbeat.js";
import { METRIC_INTERVAL, sendMetrics } from "./internal/metrics.js";
import { retryProcessPipelines } from "./internal/process.js";
import { register } from "./internal/register.js";

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

export interface Configs {
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

export class Streamdal {
  private configs: Configs;

  constructor({
    streamdalUrl,
    streamdalToken,
    serviceName,
    pipelineTimeout,
    stepTimeout,
    dryRun,
    audiences,
    quiet,
  }: StreamdalConfigs) {
    if (quiet || process.env.NODE_ENV === "production") {
      console.debug = () => null;
    }

    const url = streamdalUrl ? streamdalUrl : process.env.STREAMDAL_URL;
    const token = streamdalToken ? streamdalToken : process.env.STREAMDAL_TOKEN;
    const name = serviceName ? serviceName : process.env.STREAMDAL_SERVICE_NAME;

    if (!url || !token || !name) {
      throw new Error(`Required configs are missing. You must provide configs streamdalUrl, streamdalToken and serviceName 
        either as constructor arguments to Streamdal() or as environment variables in the form of STREAMDAL_URL, STREAMDAL_TOKEN and STREAMDAL_SERVICE_NAME`);
    }

    const sessionId = uuidv4();
    const grpcClient = client(url);

    this.configs = {
      grpcClient,
      sessionId,
      streamdalUrl: url,
      streamdalToken: token,
      serviceName: name,
      pipelineTimeout:
        pipelineTimeout ?? process.env.STREAMDAL_PIPELINE_TIMEOUT ?? "100",
      stepTimeout: stepTimeout ?? process.env.STREAMDAL_STEP_TIMEOUT ?? "10",
      dryRun: dryRun ?? !!process.env.STREAMDAL_DRY_RUN,
      audiences,
    };

    // Heartbeat is obsolete
    setInterval(() => {
      void heartbeat(this.configs);
    }, HEARTBEAT_INTERVAL);

    setInterval(() => {
      sendMetrics(this.configs);
    }, METRIC_INTERVAL);

    void addAudiences(this.configs);
    void register(this.configs);
  }

  async process({ audience, data }: StreamdalRequest): Promise<SDKResponse> {
    return retryProcessPipelines({ configs: this.configs, audience, data });
  }
}
