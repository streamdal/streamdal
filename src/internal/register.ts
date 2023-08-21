import { Audience } from "@streamdal/snitch-protos/protos/common.js";
import { ClientType } from "@streamdal/snitch-protos/protos/info.js";
import { IInternalClient } from "@streamdal/snitch-protos/protos/internal.client.js";
import { v4 as uuidv4 } from "uuid";

// import { version } from "../../package.json";
import { processResponse } from "./pipeline.js";

export interface RegisterConfigs {
  grpcClient: IInternalClient;
  serviceName: string;
  dryRun?: boolean;
  audiences?: Audience[];
}

export const sessionId = uuidv4();

export const register = async ({
  grpcClient,
  serviceName,
  dryRun,
  audiences,
}: RegisterConfigs) => {
  try {
    console.info(`### registering with grpc server...`);

    const call = grpcClient.register(
      {
        sessionId,
        serviceName,
        dryRun: dryRun ? true : false,
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
      { meta: { "auth-token": process.env.SNITCH_TOKEN || "1234" } }
    );

    console.info(`### registered with grpc server`);

    const headers = await call.headers;
    console.info("got response headers: ", headers);

    for await (const response of call.responses) {
      console.info("got response message: ", response.command);
      console.info("processing response command...");
      processResponse(response);
    }

    const status = await call.status;
    console.info("got status: ", status);

    const trailers = await call.trailers;
    console.info("got trailers: ", trailers);
  } catch (error) {
    console.error("Error registering with grpc server", error);
  }
};
