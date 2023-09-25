import { Audience } from "@streamdal/snitch-protos/protos/sp_common";
import { ClientType } from "@streamdal/snitch-protos/protos/sp_info";
import { IInternalClient } from "@streamdal/snitch-protos/protos/sp_internal.client";

// import { version } from "../../package.json";
import { InternalPipeline, processResponse } from "./pipeline.js";

export interface RegisterConfigs {
  grpcClient: IInternalClient;
  sessionId: string;
  snitchToken: string;
  serviceName: string;
  dryRun: boolean;
  audiences?: Audience[];
}

//
// fyi, the init flag is because we can't await pipeline initialization
// in our constructor so we do it on processPipeline only if needed
export const internal = {
  pipelineInitialized: false,
  pipelines: new Map<string, InternalPipeline>(),
  audiences: new Set<string>(),
};

export const audienceKey = (audience: Audience) =>
  JSON.stringify(audience).toLowerCase();

export const register = async ({
  grpcClient,
  sessionId,
  serviceName,
  snitchToken,
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
          libraryName: "snitch-node-client",
          libraryVersion: "0.0.1",
          language: "Typescript",
          arch: process.arch,
          os: process.platform,
        },
        ...(audiences ? { audiences } : { audiences: [] }),
      },
      {
        meta: { "auth-token": snitchToken },
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
