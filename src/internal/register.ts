import { readFileSync } from "node:fs";

import { Audience } from "@streamdal/protos/protos/sp_common";
import { ClientType } from "@streamdal/protos/protos/sp_info";
import { WasmModule } from "@streamdal/protos/protos/sp_internal";
import { IInternalClient } from "@streamdal/protos/protos/sp_internal.client";

import { InternalPipeline, processResponse } from "./pipeline.js";

const MAX_REGISTER_RETRIES = 20;
const RETRY_INTERVAL = 5000;

export interface RegisterConfigs {
  grpcClient: IInternalClient;
  sessionId: string;
  streamdalToken: string;
  serviceName: string;
  dryRun: boolean;
}

export interface TailStatus {
  tail?: boolean;
  tailRequestId?: string;
}

//
// fyi, the init flag is because we can't await pipeline initialization
// in our constructor so we do it on processPipeline only if needed
export const internal = {
  registered: false,
  pipelineInitialized: false,
  pipelines: new Map<string, InternalPipeline>(),
  audiences: new Map<
    string,
    { audience: Audience; tails: Map<string, TailStatus> }
  >(),
  wasmModules: new Map<string, WasmModule>(),
};

export const audienceKey = (audience: Audience) =>
  JSON.stringify(audience).toLowerCase();

export const clientInfo = () => ({
  clientType: ClientType.SDK,
  libraryName: "node-sdk",
  libraryVersion: version(),
  language: "Typescript",
  arch: process.arch,
  os: process.platform,
});

export const version = (): string => {
  try {
    const pkg = JSON.parse(readFileSync("./package.json").toString());
    return pkg?.version as string;
  } catch (e) {
    console.error("Error getting package version");
  }
  return "unknown";
};

//
// Wait for the initial registration attempt, but not any thereafter so we don't
// block too long
export const retryRegister = async (configs: RegisterConfigs) => {
  const registered = await register(configs);
  if (registered) {
    return Promise.resolve(true);
  }
  let retries = 1;
  const intervalId = setInterval(() => {
    if (retries > MAX_REGISTER_RETRIES || internal.registered) {
      clearInterval(intervalId);
    } else {
      retries++;
      console.debug(
        `retrying registration, ${retries} of ${MAX_REGISTER_RETRIES} times`
      );
      void register(configs);
    }
  }, RETRY_INTERVAL);

  return Promise.resolve(false);
};

export const register = async ({
  grpcClient,
  sessionId,
  serviceName,
  streamdalToken,
  dryRun,
}: RegisterConfigs) => {
  try {
    console.info(`### attempting to register with grpc server...`);

    const call = grpcClient.register(
      {
        sessionId,
        serviceName,
        dryRun,
        clientInfo: clientInfo(),
        audiences: Array.from(internal.audiences.values()).map(
          (a) => a.audience
        ),
      },
      {
        meta: { "auth-token": streamdalToken },
      }
    );

    await call.headers;
    console.info(`### registered with grpc server`);
    //
    // considering response headers without errors as registered
    internal.registered = true;
    //
    // await responses asynchronously so we can let upstream know we've registered
    void responseHandler(call);
    return Promise.resolve(true);
  } catch (error) {
    console.error("error registering with grpc server", error);
    return Promise.resolve(false);
  }
};

const responseHandler = async (call: any) => {
  for await (const response of call.responses) {
    response.command.oneofKind !== "keepAlive" &&
      console.debug("processing response command...", response);
    processResponse(response);
  }
};
