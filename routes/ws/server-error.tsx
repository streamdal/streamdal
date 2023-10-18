import { Handlers, RouteConfig } from "$fresh/src/server/types.ts";
import { effect } from "@preact/signals";
import { serverErrorSignal } from "../../lib/serverError.ts";

export const config: RouteConfig = {
  skipInheritedLayouts: true,
  skipAppWrapper: true,
};

export const handler: Handlers<{ message: string | null }> = {
  async GET(req, ctx) {
    if (req.headers.get("upgrade") != "websocket") {
      return new Response(null, { status: 501 });
    }

    const { socket, response } = Deno.upgradeWebSocket(req);

    effect(() => {
      try {
        socket.send(serverErrorSignal.value);
      } catch (e) {
        console.error("failed to send server error over socket", e);
      }
    });

    socket.addEventListener("message", (event) => {
      if (event.data === "ping") {
        socket.send("pong");
      }
    });

    socket.addEventListener("open", () => {
      console.info("server error socket client connected!");
      socket.send(serverErrorSignal.value);
    });

    socket.addEventListener("close", () => {
      console.info("server error socket client closed!");
    });

    return response;
  },
};
