import { signal } from "@preact/signals";
import {
  DisplayServiceMap,
  mapServiceDisplay,
  mapServiceResponse,
  ServiceMapper,
} from "../../lib/serviceMapper.ts";
import { GetAllResponse } from "snitch-protos/protos/sp_external.ts";

export type ServiceSignal = ServiceMapper & DisplayServiceMap;

//
// The service signal is our main reactive data structure
// that is used to draw the main ui. It's continually updated
// server side via grpc streaming and mapped there and the
// mapped updates are sent to the browser via websocket
export const serviceSignal = signal<ServiceSignal | null>(
  null,
);

export const setServiceSignal = (
  response: GetAllResponse,
) => {
  const serviceMap = mapServiceResponse(response);
  serviceSignal.value = {
    ...serviceMap,
    ...mapServiceDisplay(serviceMap),
  };
};
