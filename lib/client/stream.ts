import {
  serviceDisplaySignal,
  serviceSignal,
} from "../../components/serviceMap/serviceSignal.ts";
import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import {
  ExternalClient,
  IExternalClient,
} from "snitch-protos/protos/sp_external.client.ts";
import { mapServiceDisplay, mapServiceResponse } from "../serviceMap.ts";

export type GrpcConfigs = {
  grpcUrl: string;
  grpcToken: string;
};
export const streamServiceMap = async (configs: GrpcConfigs) => {
  const transport = new GrpcWebFetchTransport({
    baseUrl: configs.grpcUrl,
    format: "binary",
  });

  const client: IExternalClient = new ExternalClient(transport);

  console.log(`calling getAllStream: ${new Date()}`);
  const call: any = client.getAllStream({}, {
    meta: { "auth-token": configs.grpcToken },
  });
  for await (const response of call.responses) {
    console.log(`getAllStream response at ${new Date()}: `);
    console.dir(response, { depth: 20 });
    const serviceMap = mapServiceResponse(response);
    serviceSignal.value = serviceMap;
    serviceDisplaySignal.value = mapServiceDisplay(serviceMap);
  }
};
