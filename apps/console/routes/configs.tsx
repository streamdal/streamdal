import { Handlers } from "$fresh/server.ts";
import { getConfigs } from "root/lib/fetch.ts";

export const handler: Handlers = {
  async GET() {
    return new Response(
      JSON.stringify(await getConfigs(), undefined, 2),
      {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": "attachment; filename=streamdal-configs.json",
        },
      },
    );
  },
};
