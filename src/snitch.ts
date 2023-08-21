import { ChannelCredentials } from "@grpc/grpc-js";
import { GrpcTransport } from "@protobuf-ts/grpc-transport";
import { OperationType } from "@streamdal/snitch-protos/protos/common.js";
import {
  IInternalClient,
  InternalClient,
} from "@streamdal/snitch-protos/protos/internal.client.js";

import {
  processPipeline as internalProcessPipeline,
  StepStatus,
} from "./internal/process.js";
import { register } from "./internal/register.js";

export interface Audience {
  serviceName: string;
  componentName: string;
  operationType: OperationType;
  operationName: string;
}

export interface SnitchConfigs {
  snitchUrl?: string;
  snitchToken?: string;
  serviceName?: string;
  pipelineTimeout?: string;
  stepTimeout?: string;
  dryRun?: string;
  audiences?: Audience[];
}
export interface SnitchRequest {
  audience: Audience;
  data: Uint8Array;
}

export interface SnitchResponse {
  data: Uint8Array;
  error: boolean;
  message?: string;
  stepStatuses?: StepStatus[];
}

export class Snitch {
  private configs: SnitchConfigs;
  private readonly transport: GrpcTransport;
  private readonly grpcClient: IInternalClient;

  constructor({
    snitchUrl,
    snitchToken,
    serviceName,
    pipelineTimeout = "100",
    stepTimeout = "10",
    dryRun = "false",
    audiences,
  }: SnitchConfigs) {
    this.configs = {
      snitchUrl: snitchUrl ? snitchUrl : process.env.SNITCH_URL,
      snitchToken: snitchToken ? snitchToken : process.env.SNITCH_TOKEN,
      serviceName: serviceName ? serviceName : process.env.SNITCH_SERVICE_NAME,
      pipelineTimeout: pipelineTimeout
        ? pipelineTimeout
        : process.env.SNITCH_PIPELINE_TIMEOUT!,
      stepTimeout: stepTimeout ? stepTimeout : process.env.SNITCH_STEP_TIMEOUT,
      dryRun: dryRun ? dryRun : process.env.SNITCH_DRY_RUN,
      audiences,
    };

    if (
      !this.configs.snitchUrl ||
      !this.configs.snitchToken ||
      !this.configs.serviceName
    ) {
      throw new Error(`Required configs are missing. You must provide configs snitchUrl, snitchToken and serviceName 
        either as constructor arguments to Snitch() or as environment variables in the form of SNITCH_URL, SNITCH_TOKEN and SNITCH_SERVICE_NAME`);
    }

    this.transport = new GrpcTransport({
      host: snitchUrl!,
      channelCredentials: ChannelCredentials.createInsecure(),
    });

    this.grpcClient = new InternalClient(this.transport);
  }

  async processPipeline({
    audience,
    data,
  }: SnitchRequest): Promise<SnitchResponse> {
    await register({
      grpcClient: this.grpcClient,
      serviceName: this.configs.serviceName!,
      dryRun: this.configs.dryRun === "true",
      audiences: this.configs.audiences,
    });
    return internalProcessPipeline({ audience, data });
  }
}
