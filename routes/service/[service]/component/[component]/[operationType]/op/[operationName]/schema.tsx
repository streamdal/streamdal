import { getSchema } from "root/lib/fetch.ts";
import { getAudienceFromParams } from "root/lib/utils.ts";

export const handler: Handers<> = {
  async GET(req, ctx) {
    const audience = getAudienceFromParams(ctx.params);
    const { schema } = await getSchema(audience);
    if (schema && schema.jsonSchema) {
      const decoded = new TextDecoder().decode(schema.jsonSchema);
      const parsed = JSON.parse(decoded);
      return new Response(
        JSON.stringify({ schema: parsed, version: schema.Version }),
      );
    } else {
      return new Response(JSON.stringify({}));
    }
  },
};
export default function getSchemaRoute() {
  return null;
}
