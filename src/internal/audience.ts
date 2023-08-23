import {
  Audience,
  ResponseCode,
} from "@streamdal/snitch-protos/protos/common.js";

import { Configs } from "../snitch.js";
import { internal, sessionId } from "./register.js";

export interface AddAudience {
  configs: Configs;
  audience: Audience;
}

export const addAudiences = async (configs: Configs) => {
  if (!configs.audiences || configs.audiences.length === 0) {
    return;
  }

  for (const audience of configs.audiences) {
    await addAudience({ configs, audience });
  }
};

export const addAudience = async ({ configs, audience }: AddAudience) => {
  try {
    if (internal.audiences.has(JSON.stringify(audience))) {
      return;
    }
    internal.audiences.add(JSON.stringify(audience));
    const { response } = await configs.grpcClient.newAudience(
      {
        sessionId,
        audience,
      },
      { meta: { "auth-token": configs.snitchToken } }
    );

    if (response.code !== ResponseCode.OK) {
      console.error("error adding audience", response.message);
    }
  } catch (error) {
    console.error("error adding audience", error);
  }
};
