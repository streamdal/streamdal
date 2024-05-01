import { Handlers, PageProps } from "$fresh/src/server/types.ts";
import { Schema } from "root/islands/schema.tsx";
import { getFormattedSchema } from "root/lib/fetch.ts";
import { audienceFromKey } from "root/lib/utils.ts";
import { Audience } from "streamdal-protos/protos/sp_common.ts";

export type SchemaType = {
  schema: string;
  version: number;
  lastUpdated?: string;
};

export type SchemaRouteType = { audience: Audience; schema: SchemaType };

export const handler: Handlers<SchemaRouteType> = {
  async GET(req, ctx) {
    const audience = audienceFromKey(decodeURIComponent(ctx.params?.id));
    return ctx.render({
      audience,
      schema: await getFormattedSchema(audience),
    });
  },
};

export const SchemaRoute = (
  props: PageProps<
    SchemaRouteType
  >,
) => <Schema audience={props.data.audience} schema={props.data.schema} />;

export default SchemaRoute;
