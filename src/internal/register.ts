import { Audience } from "@streamdal/snitch-protos/protos/sp_common";
import { ClientType } from "@streamdal/snitch-protos/protos/sp_info";
import { WasmModule } from "@streamdal/snitch-protos/protos/sp_internal";
import { IInternalClient } from "@streamdal/snitch-protos/protos/sp_internal.client";

// import { version } from "../../package.json";
import { InternalPipeline, processResponse } from "./pipeline.js";

export interface RegisterConfigs {
  grpcClient: IInternalClient;
  sessionId: string;
  streamdalToken: string;
  serviceName: string;
  dryRun: boolean;
  audiences?: Audience[];
}

export interface TailStatus {
  tail?: boolean;
  tailRequestId?: string;
}

//
// fyi, the init flag is because we can't await pipeline initialization
// in our constructor so we do it on processPipeline only if needed
export const internal = {
  pipelineInitialized: false,
  pipelines: new Map<string, InternalPipeline>(),
  audiences: new Map<string, Map<string, TailStatus>>(),
  wasmModules: new Map<string, WasmModule>(),
};

export const audienceKey = (audience: Audience) =>
  JSON.stringify(audience).toLowerCase();

export const register = async ({
  grpcClient,
  sessionId,
  serviceName,
  streamdalToken,
  dryRun,
  audiences,
}: RegisterConfigs) => {
  try {
    console.info(`### registering with grpc server...`);

    const call = grpcClient.register(
      {
        sessionId,
        serviceName,
        dryRun,
        clientInfo: {
          clientType: ClientType.SDK,
          libraryName: "node-sdk",
          libraryVersion: "0.0.1",
          language: "Typescript",
          arch: process.arch,
          os: process.platform,
        },
        ...(audiences ? { audiences } : { audiences: [] }),
      },
      {
        meta: { "auth-token": streamdalToken },
      }
    );

    console.info(`### registered with grpc server`);
    for await (const response of call.responses) {
      response.command.oneofKind !== "keepAlive" &&
        console.debug("processing response command...", response);
      processResponse(response);
    }

    //
    // TODO: check status for errors
    // const { status, trailers } = await call;
  } catch (error) {
    console.error("Error registering with grpc server", error);
  }
};
