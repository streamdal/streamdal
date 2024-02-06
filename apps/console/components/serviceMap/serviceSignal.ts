import { signal } from "@preact/signals";
import {
  DisplayServiceMap,
  mapServiceDisplay,
  mapServiceResponse,
  ServiceMapper,
} from "../../lib/serviceMapper.ts";
import { GetAllResponse } from "streamdal-protos/protos/sp_external.ts";

export type ServiceSignal =
  & GetAllResponse
  & ServiceMapper
  & DisplayServiceMap;

export const initServiceSignal: ServiceSignal = {
  audiences: [],
  config: {},
  edgesMap: new Map(),
  generatedAtUnixTsNsUtc: "",
  live: [],
  liveAudiences: new Map(),
  nodesMap: new Map(),
  pipelines: {},
  browserInitialized: false,
};

//
// The service signal is our main reactive data structure
// that is used to draw the main ui. It's continually updated
// server side via grpc streaming and mapped there and the
// mapped updates are sent to the browser via websocket
export const serviceSignal = signal<ServiceSignal>(initServiceSignal);

export const setServiceSignal = (
  response: GetAllResponse,
) => {
  const serviceMap = mapServiceResponse(response);
  serviceSignal.value = {
    ...serviceMap,
    ...mapServiceDisplay(serviceMap),
  };
};

export const setPipelines = (audienceKey: string, pipelineIds: string[]) => {
  if (serviceSignal.value) {
    serviceSignal.value.config[audienceKey] = {
      ...serviceSignal.value.config[audienceKey] || {},
      pipelineIds,
    };
  }
};
