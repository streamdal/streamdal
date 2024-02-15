import { readFileSync } from "node:fs";

import { ServerStreamingCall } from "@protobuf-ts/runtime-rpc";
import { Command } from "@streamdal/protos/protos/sp_command";
import { Audience } from "@streamdal/protos/protos/sp_common";
import { ClientType } from "@streamdal/protos/protos/sp_info";
import { RegisterRequest } from "@streamdal/protos/protos/sp_internal";
import { IInternalClient } from "@streamdal/protos/protos/sp_internal.client";
import { Pipeline } from "@streamdal/protos/protos/sp_pipeline";

import { InternalConfigs } from "../streamdal.js";
import { processResponse } from "./pipeline.js";
import { TokenBucket } from "./utils/tokenBucket.js";

const REGISTRATION_RETRY_INTERVAL = 5000;

export interface RegisterConfigs {
  grpcClient: IInternalClient;
  sessionId: string;
  streamdalToken: string;
  serviceName: string;
  dryRun: boolean;
}

export interface Tail {
  tailStatus?: boolean;
  tailRequestId?: string;
  sampleBucket: TokenBucket;
}

export const internal = {
  // we track registered status so downstream process pipeline
  // requests can be retried
  registered: false,
  pipelineInitialized: false,
  pipelines: new Map<string, Map<string, Pipeline>>(),
  kv: new Map<string, Uint8Array>(),
  audiences: new Map<
    string,
    { audience: Audience; tails: Map<string, Tail> }
  >(),
  wasmModules: new Map<string, any>(),
  schemas: new Map<string, any>(),
};

export const audienceKey = (audience: Audience) =>
  JSON.stringify(audience).toLowerCase();

export const version = (): string => {
  try {
    const pkg = JSON.parse(
      readFileSync("./node_modules/@streamdal/node-sdk/package.json").toString()
    );
    return (pkg?.version ? pkg.version : "unknown") as string;
  } catch (e) {
    console.error("Error getting package version");
  }
  return "unknown";
};

export const clientInfo = {
  clientType: ClientType.SDK,
  libraryName: "node-sdk",
  libraryVersion: version(),
  language: "Typescript",
  arch: process.arch,
  os: process.platform,
};

export const processRegisterResponses = async (
  call: ServerStreamingCall<RegisterRequest, Command>,
  configs: InternalConfigs
) => {
  try {
    for await (const response of call.responses) {
      if (response.command.oneofKind !== "keepAlive") {
        await processResponse(response);
      }
    }
  } catch (error) {
    internal.registered = false;
    console.error(
      "error processing register responses, retrying register",
      error
    );
    retryRegister(configs);
  }
};

export const retryRegister = (configs: InternalConfigs) =>
  setTimeout(() => {
    console.info(
      `retrying registering with grpc server in ${
        REGISTRATION_RETRY_INTERVAL / 1000
      } seconds...`
    );
    void register(configs);
  }, REGISTRATION_RETRY_INTERVAL);

export const register = async (configs: InternalConfigs) => {
  try {
    console.info(`### running node-sdk version: ${clientInfo.libraryVersion}`);
    console.info(`### registering with grpc server...`);
    const call = configs.grpcClient.register(
      {
        sessionId: configs.sessionId,
        serviceName: configs.serviceName,
        dryRun: configs.dryRun,
        clientInfo,
        audiences: Array.from(internal.audiences.values()).map(
          (a) => a.audience
        ),
      },
      {
        meta: { "auth-token": configs.streamdalToken },
      }
    );

    await call.headers;
    console.info(`### registered with grpc server`);
    //
    // considering response headers without errors as registered;
    // don't block while we wait to process stream responses
    internal.registered = true;
    void processRegisterResponses(call, configs);
  } catch (error) {
    internal.registered = false;
    console.error("error registering with grpc server", error);
    retryRegister(configs);
  }
};
