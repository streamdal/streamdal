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
    let serviceSocket: WebSocket;
    let audienceSocket: WebSocket;
    let errorSocket: WebSocket;

    //
    // Wait a few ticks to open sockets to allow previous upstream closes to finish,
    // sometimes they are not on refreshes and redirects
    setTimeout(() => {
      serviceSocket = serviceMapSocket("/ws/service-map");
      audienceSocket = audienceMetricsSocket("/ws/audience-metrics");
      errorSocket = serverErrorSocket("/ws/server-error");
    }, 500);

    return () => {
      serviceSocket?.close();
      audienceSocket?.close();
      errorSocket?.close();
    };
  }, []);

  return null;
};
