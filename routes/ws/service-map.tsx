import { Handlers, RouteConfig } from "$fresh/src/server/types.ts";
import { effect } from "@preact/signals";
import { serviceSignal } from "../../components/serviceMap/serviceSignal.ts";
import { DisplayServiceMap } from "../../lib/serviceMapper.ts";
import { bigIntStringify } from "../../lib/utils.ts";
import { serviceStreamAbortSignal } from "../../lib/stream.ts";

export const config: RouteConfig = {
  skipInheritedLayouts: true,
  skipAppWrapper: true,
};

export const handler: Handlers<DisplayServiceMap> = {
  async GET(req, ctx) {
    let clientConnected = false;
    if (req.headers.get("upgrade") != "websocket") {
      return new Response(null, { status: 501 });
    }

    const { socket, response } = Deno.upgradeWebSocket(req);

    effect(() => {
      if (serviceSignal.value && clientConnected) {
        socket.send(bigIntStringify({
          ...serviceSignal.value,
          nodesMap: Array.from(serviceSignal.value.nodesMap.entries()),
          edgesMap: Array.from(serviceSignal.value.edgesMap.entries()),
        }));
      }
    });

    socket.addEventListener("message", (event) => {
      if (event.data === "ping") {
        socket.send("pong");
      }
    });

    socket.addEventListener("open", () => {
      clientConnected = true;
      console.info("service map socket client connected!");
    });

    socket.addEventListener("close", () => {
      clientConnected = false;
      serviceStreamAbortSignal.value = false;
      console.info("service map socket client closed!");
    });

    return response;
  },
};
