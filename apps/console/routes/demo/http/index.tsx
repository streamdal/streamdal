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
    const data = await req.json();

    demoHttpRequestSignal.value = [
      ...demoHttpRequestSignal.value ? demoHttpRequestSignal.value : [],
      ...data
        ? [{
          time: new Date().toLocaleDateString(
            "en-us",
            longDateFormat,
          ),
          method,
          headers,
          data,
        }]
        : [],
    ];
    return new Response(null, { status: 200 });
  },
};
