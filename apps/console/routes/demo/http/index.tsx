import { Handlers } from "$fresh/src/server/types.ts";
import { signal } from "@preact/signals";
import { longDateFormat } from "../../../lib/utils.ts";

export type HttpRequestType = {
  time: string;
  method: string;
  headers: any;
  data: any;
};
export const demoHttpRequestSignal = signal<HttpRequestType[] | null>(null);

export const handler: Handlers<any | null> = {
  async POST(req, _ctx) {
    const method = req.method;
    const headers = Object.fromEntries(req.headers);
    let data = "";
    try {
      data = await req.json();
    } catch {
      console.debug("cannot parse demo http request body");
    }

    demoHttpRequestSignal.value = [
      ...demoHttpRequestSignal.value ? demoHttpRequestSignal.value : [],
      ...[{
        time: new Date().toLocaleDateString(
          "en-us",
          longDateFormat,
        ),
        method,
        headers,
        data,
      }],
    ];
    return new Response(null, { status: 200 });
  },
};
