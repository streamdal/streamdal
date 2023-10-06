import { Handlers, RouteConfig } from "$fresh/src/server/types.ts";
import { TailResponse } from "snitch-protos/protos/sp_common.ts";
import { tail, tailAbortSignal } from "../../lib/tail.ts";

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
        return;
      }

      try {
        const { audience, sampling } = JSON.parse(event.data);
        void tail({ audience, socket, sampling });
      } catch (e) {
        console.error("error parsing tail request", e);
      }
    });

    socket.addEventListener("open", () => {
      clientConnected = true;
      tailAbortSignal.value = false;
      console.info("tail socket client connected!");
    });

    socket.addEventListener("close", () => {
      clientConnected = false;
      tailAbortSignal.value = true;
      console.info("tail socket client closed!");
    });

    return response;
  },
};
