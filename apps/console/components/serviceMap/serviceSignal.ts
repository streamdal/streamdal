import { signal } from "@preact/signals";
import {
  mapServiceDisplay,
  mapServiceResponse,
  ServiceDisplay,
  ServiceMapper,
} from "../../lib/serviceMapper.ts";
import { GetAllResponse } from "streamdal-protos/protos/sp_external.ts";

export type ServiceSignal =
  & GetAllResponse
  & ServiceMapper
  & ServiceDisplay;

export const initServiceSignal: ServiceSignal = {
  audiences: [],
  configs: {},
  displayEdges: [],
  generatedAtUnixTsNsUtc: "",
  live: [],
  liveAudiences: new Map(),
  displayNodes: [],
  pipelines: {},
  streamingUpdate: false,
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
