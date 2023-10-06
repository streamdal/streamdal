import { Handlers, RouteConfig } from "$fresh/src/server/types.ts";
import { TailResponse } from "snitch-protos/protos/sp_common.ts";
import {
  audienceMetricsAbortSignal,
  getAudienceMetrics,
} from "../../lib/audienceMetrics.ts";

export const config: RouteConfig = {
  skipInheritedLayouts: true,
  skipAppWrapper: true,
};

export const handler: Handlers<{ tail: TailResponse }> = {
  async GET(req, ctx) {
    let clientConnected = false;
    if (req.headers.get("upgrade") != "websocket") {
      return new Response(null, { status: 501 });
    }

    const { socket, response } = Deno.upgradeWebSocket(req);

    socket.addEventListener("message", (event) => {
      if (event.data === "ping") {
        socket.send("pong");
      }

      clientConnected && void getAudienceMetrics({ socket });
    });

    socket.addEventListener("open", () => {
      clientConnected = true;
      audienceMetricsAbortSignal.value = false;
      console.info("audience metrics socket client connected!");
    });

    socket.addEventListener("close", () => {
      clientConnected = false;
      audienceMetricsAbortSignal.value = true;
      console.info("audience metrics socket client closed!");
    });

    return response;
  },
};
