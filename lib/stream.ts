import { setServiceSignal } from "../components/serviceMap/serviceSignal.ts";
import { client, meta } from "./grpc.ts";

export const streamServiceMap = async () => {
  try {
    const call: any = client
      .getAllStream({}, meta);
    for await (const response of call.responses) {
      setServiceSignal(response);
    }
  } catch (e) {
    console.error("received grpc getAllStream error", e);
  }
};
