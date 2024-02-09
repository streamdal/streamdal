import { Audience } from "@streamdal/protos/protos/sp_common";
import { SendSchemaRequest } from "@streamdal/protos/protos/sp_internal";

import { PipelineConfigs } from "./process.js";
import { audienceKey, internal } from "./register.js";

export interface SchemaRequest {
  configs: PipelineConfigs;
  audience: Audience;
  schema: any;
}

export const sendSchema = async ({
  configs,
  audience,
  schema,
}: SchemaRequest) => {
  try {
    if (!schema) {
      console.info("No schema found, skipping send schema");
      return;
    }

    const key = audienceKey(audience);
    const existing = internal.schemas.get(key);

    if (!existing || existing.toString() !== schema.toString()) {
      internal.schemas.set(key, schema);
      const schemaRequest = SendSchemaRequest.create({
        audience,
        schema: { jsonSchema: schema },
      });
      console.debug("sending schema...");
      const call = configs.grpcClient.sendSchema(schemaRequest, {
        meta: { "auth-token": configs.streamdalToken },
      });
      await call.headers;
      console.debug("schema sent");
    }
  } catch (e) {
    console.error("Error sending schema", e);
  }
};
