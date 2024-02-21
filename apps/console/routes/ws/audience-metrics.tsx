import { Handlers, RouteConfig } from "$fresh/src/server/types.ts";
import { TailResponse } from "streamdal-protos/protos/sp_common.ts";
import {
  audienceMetricsConnected,
  getAudienceMetrics,
} from "../../lib/audienceMetrics.ts";

export const config: RouteConfig = {
  skipInheritedLayouts: true,
  skipAppWrapper: true,
};

export const handler: Handlers<{ tail: TailResponse }> = {
  async GET(req, ctx) {
    if (req.headers.get("upgrade") != "websocket") {
      return new Response(null, { status: 501 });
    }

    const { socket, response } = Deno.upgradeWebSocket(req);

    socket.addEventListener("message", async (event) => {
      if (event.data === "ping") {
        socket.send("pong");
      }

      await getAudienceMetrics({ socket });
    });

    socket.addEventListener("open", () => {
      audienceMetricsConnected.value = true;
      console.info("audience metrics socket client connected!");
    });

    socket.addEventListener("close", () => {
      audienceMetricsConnected.value = false;
      console.info("audience metrics socket client closed!");
    });

    return response;
  },
};
