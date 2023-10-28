import { Audience } from "@streamdal/protos/protos/sp_common";
import { SendSchemaRequest } from "@streamdal/protos/protos/sp_internal";

import { PipelineConfigs, PipelinesStatus } from "./process.js";
import { audienceKey, internal } from "./register.js";

export interface SchemaRequest {
  configs: PipelineConfigs;
  audience: Audience;
  pipelineStatus: PipelinesStatus;
}

export const sendSchema = async ({
  configs,
  audience,
  pipelineStatus,
}: SchemaRequest) => {
  try {
    const step = pipelineStatus.stepStatuses.at(-1);
    if (step?.stepName !== "Infer Schema") {
      return;
    }

    if (!step.schema) {
      console.info("No schema found, skipping send schema");
      return;
    }

    const key = audienceKey(audience);
    const existing = internal.schemas.get(key);

    if (!existing || existing.toString() !== step.schema.toString()) {
      internal.schemas.set(key, step.schema);
      const schemaRequest = SendSchemaRequest.create({
        audience,
        schema: { jsonSchema: step.schema },
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
