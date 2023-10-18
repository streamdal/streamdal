import { Handlers, RouteConfig } from "$fresh/src/server/types.ts";
import { effect } from "@preact/signals";
import { serviceSignal } from "../../components/serviceMap/serviceSignal.ts";
import { DisplayServiceMap } from "../../lib/serviceMapper.ts";
import { bigIntStringify } from "../../lib/utils.ts";
import {
  serviceStreamConnectedSignal,
  streamServiceMap,
} from "../../lib/stream.ts";

export const config: RouteConfig = {
  skipInheritedLayouts: true,
  skipAppWrapper: true,
};

export const handler: Handlers<DisplayServiceMap> = {
  async GET(req, ctx) {
    if (req.headers.get("upgrade") != "websocket") {
      return new Response(null, { status: 501 });
    }

    const { socket, response } = Deno.upgradeWebSocket(req);

    effect(() => {
      try {
        socket.send(bigIntStringify({
          ...serviceSignal.value,
          nodesMap: Array.from(serviceSignal.value.nodesMap.entries()),
          edgesMap: Array.from(serviceSignal.value.edgesMap.entries()),
        }));
      } catch (e) {
        console.error("failed to send service map over socket", e);
      }
    });

    socket.addEventListener("message", async (event) => {
      if (event.data === "ping") {
        socket.send("pong");
      }

      await streamServiceMap();
    });

    socket.addEventListener("open", () => {
      serviceStreamConnectedSignal.value = true;
      console.info("service map socket client connected!");
    });

    socket.addEventListener("close", () => {
      serviceStreamConnectedSignal.value = false;
      console.info("service map socket client closed!");
    });

    return response;
  },
};
