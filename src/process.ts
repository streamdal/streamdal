import {
  Audience,
  OperationType,
} from "@streamdal/snitch-protos/protos/internal_api.js";

export interface SnitchRequest {
  name: string;
  component: string;
  operation: OperationType;
  data: Uint8Array;
}

export interface SnitchResponse {
  data: Uint8Array;
}

export const process = (audience: Audience, data: Uint8Array) => {
  console.info("procssing data", data);

  //
  //...coming soon...
  // pipelines = self.__get_pipelines(req.operation, req.component);
};
