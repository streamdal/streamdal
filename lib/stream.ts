import { setServiceSignal } from "../components/serviceMap/serviceSignal.ts";
import { client, meta } from "./grpc.ts";

export const streamServiceMap = async () => {
  const call: any = client.getAllStream({}, meta);
  for await (const response of call.responses) {
    setServiceSignal(response);
  }
};
