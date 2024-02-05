import { getSchema } from "root/lib/fetch.ts";
import { getAudienceFromParams } from "root/lib/utils.ts";
import hljs from "root/static/vendor/highlight@11.8.0.min.js";
import { Handlers } from "$fresh/src/server/types.ts";
import { Audience } from "streamdal-protos/protos/sp_common.ts";

export const handler: Handlers = {
  async GET(req, ctx) {
    try {
      const audience: Audience = getAudienceFromParams(ctx.params);
      const { schema } = await getSchema(audience);
      const decoded = new TextDecoder().decode(schema?.jsonSchema);
      const parsed = JSON.parse(decoded);
      const highlighted =
        hljs.highlight(JSON.stringify(parsed, null, 2), { language: "json" })
          .value;

      return new Response(
        JSON.stringify({
          schema: highlighted,
          version: schema?.Version,
          metaData: schema?.Metadata,
        }),
      );
    } catch (e) {
      console.error("error fetching and parsing json schema", e);
    }
    return new Response(JSON.stringify({}));
  },
};

export default function getSchemaRoute() {
  return null;
}
