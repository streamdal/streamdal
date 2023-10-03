import { getSchema } from "root/lib/fetch.ts";
import { getAudienceFromParams } from "root/lib/utils.ts";

export const handler: Handers<> = {
  async GET(req, ctx) {
    const audience = getAudienceFromParams(ctx.params);
    const schema = await getSchema(audience);
    if (schema) {
      const decoded = new TextDecoder().decode(schema.schema.jsonSchema);
      const parsed = JSON.parse(decoded);
      return new Response(JSON.stringify({ schema: parsed }));
    }
  },
};
export default function getSchemaRoute() {
  return null;
}
