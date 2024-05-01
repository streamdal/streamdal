import { Handlers } from "$fresh/src/server/types.ts";
import { getFormattedSchema } from "root/lib/fetch.ts";
import { getAudienceFromParams } from "root/lib/utils.ts";
import { Audience } from "streamdal-protos/protos/sp_common.ts";

export const handler: Handlers = {
  async GET(req, ctx) {
    const audience: Audience = getAudienceFromParams(ctx.params);
    return new Response(
      JSON.stringify(await getFormattedSchema(audience)),
    );
  },
};

export default function getSchemaRoute() {
  return null;
}
