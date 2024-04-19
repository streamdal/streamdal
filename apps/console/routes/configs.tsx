import { Handlers } from "$fresh/server.ts";
import { getConfigs } from "root/lib/fetch.ts";

export const handler: Handlers = {
  async GET() {
    const { config = {} } = await getConfigs();
    return new Response(
      JSON.stringify(config, undefined, 2),
      {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": "attachment; filename=streamdal-configs.json",
        },
      },
    );
  },
};
