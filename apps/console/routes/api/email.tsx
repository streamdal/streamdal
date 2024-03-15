import { Handlers, RouteConfig } from "$fresh/server.ts";
import { sendEmail } from "../../lib/mutation.ts";
import { SuccessType } from "../_middleware.ts";

export const config: RouteConfig = {
  skipInheritedLayouts: true,
};

export const handler: Handlers<SuccessType> = {
  async POST(req: Request) {
    let data = null;
    try {
      data = await req.json();
    } catch (e) {
      console.error("error parsing email request body", e);
    }

    if (!data?.email) {
      return new Response("email required", {
        status: 400,
      });
    }

    void sendEmail(data.email);

    return new Response(JSON.stringify({ success: true }), {
      headers: {
        "Content-Type": "application/json",
      },
      status: 200,
    });
  },
};
