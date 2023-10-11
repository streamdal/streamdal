import { ChannelCredentials } from "@grpc/grpc-js";
import { GrpcTransport } from "@protobuf-ts/grpc-transport";
import { ClientStreamingCall } from "@protobuf-ts/runtime-rpc";
import {
  Audience,
  OperationType,
  StandardResponse,
  TailResponse,
} from "@streamdal/protos/protos/sp_common";
import {
  IInternalClient,
  InternalClient,
} from "@streamdal/protos/protos/sp_internal.client";
import { v4 as uuidv4 } from "uuid";

import { addAudience, addAudiences } from "./internal/audience.js";
import { METRIC_INTERVAL, sendMetrics } from "./internal/metrics.js";
import { initPipelines } from "./internal/pipeline.js";
import {
  processPipeline as internalProcessPipeline,
  StepStatus,
} from "./internal/process.js";
import { internal, register } from "./internal/register.js";

export { Audience, OperationType };

export interface StreamdalConfigs {
  streamdalUrl?: string;
  streamdalToken?: string;
  serviceName?: string;
  pipelineTimeout?: string;
  stepTimeout?: string;
  dryRun?: boolean;
  audiences?: Audience[];
}

export interface Configs {
  grpcClient: IInternalClient;
  tailCall: ClientStreamingCall<TailResponse, StandardResponse>;
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

export interface StreamdalResponse {
  data: Uint8Array;
  error: boolean;
  message?: string;
  stepStatuses?: StepStatus[];
}

export class Streamdal {
  private configs: Configs;
  private readonly transport: GrpcTransport;

  constructor({
    streamdalUrl,
    streamdalToken,
    serviceName,
    pipelineTimeout,
    stepTimeout,
    dryRun,
    audiences,
  }: StreamdalConfigs) {
    if (process.env.NODE_ENV === "production") {
      console.debug = () => null;
    }

    const url = streamdalUrl ? streamdalUrl : process.env.STREAMDAL_URL;
    const token = streamdalToken ? streamdalToken : process.env.STREAMDAL_TOKEN;
    const name = serviceName ? serviceName : process.env.STREAMDAL_SERVICE_NAME;

    if (!url || !token || !name) {
      throw new Error(`Required configs are missing. You must provide configs streamdalUrl, streamdalToken and serviceName 
        either as constructor arguments to Streamdal() or as environment variables in the form of STREAMDAL_URL, STREAMDAL_TOKEN and STREAMDAL_SERVICE_NAME`);
    }

    this.transport = new GrpcTransport({
      host: url,
      channelCredentials: ChannelCredentials.createInsecure(),
    });

    const grpcClient = new InternalClient(this.transport);
    const sessionId = uuidv4();

    this.configs = {
      grpcClient,
      tailCall: grpcClient.sendTail({
        meta: { "auth-token": token },
      }),
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
    // setInterval(() => {
    //   void heartbeat(this.configs);
    // }, HEARTBEAT_INTERVAL);

    setInterval(() => {
      void sendMetrics(this.configs);
    }, METRIC_INTERVAL);

    void addAudiences(this.configs);
    void register(this.configs);
  }

  async processPipeline({
    audience,
    data,
  }: StreamdalRequest): Promise<StreamdalResponse> {
    if (!internal.pipelineInitialized) {
      await initPipelines(this.configs);
    }

    await addAudience({ configs: this.configs, audience });
    return internalProcessPipeline({ configs: this.configs, audience, data });
  }
}
