import { Handlers, RouteConfig } from "$fresh/server.ts";
import { sendEmail } from "../../lib/mutation.ts";
import { SuccessType } from "../_middleware.ts";

export const config: RouteConfig = {
  skipInheritedLayouts: true,
};

export const handler: Handlers<SuccessType> = {
  async POST(req: Request, ctx) {
    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers":
        "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With",
      "Access-Control-Allow-Methods": "POST, OPTIONS, GET, PUT, DELETE",
    };

    let data = null;
    try {
      data = await req.json();
    } catch (e) {
      console.error("error parsing email request body", e);
    }

    if (!data?.email) {
      return new Response("email required", {
        status: 400,
        headers,
      });
    }

    void sendEmail(data.email);

    return new Response(JSON.stringify({ success: true }), {
      headers,
      status: 200,
    });
  },
};
