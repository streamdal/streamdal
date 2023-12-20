//
// A global client side component to setup our sockets
import { useEffect } from "preact/hooks";
import {
  audienceMetricsSocket,
  serverErrorSocket,
  serviceMapSocket,
} from "../lib/sockets.ts";

export const Sockets = () => {
  useEffect(() => {
    const serviceSocket = serviceMapSocket("/ws/service-map");
    const audienceSocket = audienceMetricsSocket("/ws/audience-metrics");
    const errorSocket = serverErrorSocket("/ws/server-error");
    return () => {
      serviceSocket?.close();
      audienceSocket?.close();
      errorSocket?.close();
    };
  }, []);

  return null;
};
