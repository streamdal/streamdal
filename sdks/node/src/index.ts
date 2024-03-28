import { Audience, OperationType } from "@streamdal/protos/protos/sp_common";
import { IInternalClient } from "@streamdal/protos/protos/sp_internal.client";
import {
  ExecStatus,
  SDKResponse as InternalSDKResponse,
} from "@streamdal/protos/protos/sp_sdk";

import { v4 as uuidv4 } from "uuid";

import { addAudiences } from "./internal/audience.js";
import { client } from "./internal/grpc.js";
import { heartbeat, HEARTBEAT_INTERVAL } from "./internal/heartbeat.js";
import { METRIC_INTERVAL, sendMetrics } from "./internal/metrics.js";
import { retryProcessPipelines } from "./internal/process.js";
import { register as internalRegister } from "./internal/register.js";

export { Audience, ExecStatus, OperationType };

export type SDKResponse = InternalSDKResponse & {
  decodedData?: any;
};

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

export interface StreamdalJSONRequest {
  audience: Audience;
  data: string;
}

export interface StreamdalAnyRequest {
  audience: Audience;
  data: any;
}

export interface StreamdalRegistration {
  process: (arg: StreamdalRequest) => Promise<SDKResponse>;
  processJSON: (arg: StreamdalJSONRequest) => Promise<SDKResponse>;
  processAny: (arg: StreamdalAnyRequest) => Promise<SDKResponse>;
}

const initConfigs = (configs?: StreamdalConfigs) => {
  if (
    process.env.NODE_ENV === "production" ||
    configs?.quiet ||
    process.env.STREAMDAL_QUIET
  ) {
    console.debug = () => null;
  }

  const url = configs?.streamdalUrl ?? process.env.STREAMDAL_URL;
  const token = configs?.streamdalToken ?? process.env.STREAMDAL_TOKEN;
  const name = configs?.serviceName ?? process.env.STREAMDAL_SERVICE_NAME;

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
      configs?.pipelineTimeout ??
      process.env.STREAMDAL_PIPELINE_TIMEOUT ??
      "100",
    stepTimeout:
      configs?.stepTimeout ?? process.env.STREAMDAL_STEP_TIMEOUT ?? "10",
    dryRun: configs?.dryRun ?? !!process.env.STREAMDAL_DRY_RUN,
    audiences: configs?.audiences,
  };

  // Heartbeat is obsolete
  setInterval(() => {
    void heartbeat(internalConfigs);
  }, HEARTBEAT_INTERVAL);

  setInterval(() => {
    sendMetrics(internalConfigs);
  }, METRIC_INTERVAL);

  return internalConfigs;
};

const encodeJson = (data: string): Uint8Array => {
  return new TextEncoder().encode(data);
};

const encodeAny = (data: any): Uint8Array => {
  // Attempts to encode data into JSON string, then to Uint8Array
  const jsonData = JSON.stringify(data);
  const encodedData = new TextEncoder().encode(jsonData);
  return encodedData;
};

/**
 * This is the recommended way to register with the Streamdal server
 * as you can await completion before processing pipelines.
 */
export const registerStreamdal = async (
  configs?: StreamdalConfigs
): Promise<StreamdalRegistration> => {
  const internalConfigs = initConfigs(configs);

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
    processJSON: async ({
      audience,
      data,
    }: StreamdalJSONRequest): Promise<SDKResponse> => {
      return retryProcessPipelines({
        configs: internalConfigs,
        audience,
        data: encodeJson(data),
      });
    },
    processAny: async ({
      audience,
      data,
    }: StreamdalAnyRequest): Promise<SDKResponse> => {
      try {
        const encodedData = encodeAny(data);
        return retryProcessPipelines({
          configs: internalConfigs,
          audience,
          data: encodedData,
        });
      } catch (error) {
        return Promise.resolve({
          data,
          status: ExecStatus.ERROR,
          statusMessage: "Failed to parse JSON data. Not",
          pipelineStatus: [],
          metadata: {},
        });
      }
    },
  };
};

/**
 * Prefer registerStreamdal for guaranteed registration before processing pipelines.
 *
 * This class can be used in envs that don't support top level await.
 * Subsequent process pipeline requests will retry until registration is done.
 */
export class Streamdal {
  private internalConfigs: InternalConfigs;
  constructor(configs?: StreamdalConfigs) {
    this.internalConfigs = initConfigs(configs);
    void addAudiences(this.internalConfigs);
    void internalRegister(this.internalConfigs);
  }

  async process({ audience, data }: StreamdalRequest): Promise<SDKResponse> {
    return retryProcessPipelines({
      configs: this.internalConfigs,
      audience,
      data,
    });
  }
}
