import { Handlers, RouteConfig } from "$fresh/src/server/types.ts";
import { effect } from "@preact/signals";

import { demoHttpRequestSignal } from "../../demo/http/index.tsx";

export const config: RouteConfig = {
  skipInheritedLayouts: true,
  skipAppWrapper: true,
};

export const handler: Handlers = {
  async GET(req, ctx) {
    if (req.headers.get("upgrade") != "websocket") {
      return new Response(null, { status: 501 });
    }

    const { socket, response } = Deno.upgradeWebSocket(req);

    effect(() => {
      try {
        demoHttpRequestSignal.value && socket.readyState == WebSocket.OPEN &&
          socket.send(JSON.stringify(demoHttpRequestSignal.value));
      } catch {
        console.debug("failed to send demo http request over socket");
      }
    });

    socket.addEventListener("message", async (event) => {
      if (event.data === "ping") {
        socket.send("pong");
      }
    });

    socket.addEventListener("open", () => {
      console.info("demo http request socket client connected!");
    });

    socket.addEventListener("close", () => {
      console.info("demo http socket client closed!");
    });

    return response;
  },
};
