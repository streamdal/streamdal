import {
  Audience as InternalAudience,
  ResponseCode,
} from "@streamdal/protos/protos/sp_common";

import { InternalConfigs } from "../index.js";
import { audienceKey, internal, Tail } from "./register.js";

export interface AddAudience {
  configs: InternalConfigs;
  audience: InternalAudience;
}

export const addAudiences = async (configs: InternalConfigs) => {
  if (!configs.audiences || configs.audiences.length === 0) {
    return;
  }

  for (const audience of configs.audiences) {
    await addAudience({
      configs,
      audience,
    });
  }
};

export const addAudience = async ({ configs, audience }: AddAudience) => {
  try {
    if (internal.audiences.has(audienceKey(audience))) {
      return;
    }
    const { response } = await configs.grpcClient.newAudience(
      {
        sessionId: configs.sessionId,
        audience,
      },
      { meta: { "auth-token": configs.streamdalToken } }
    );

    if (response.code === ResponseCode.OK) {
      internal.audiences.set(audienceKey(audience), {
        audience,
        tails: new Map<string, Tail>(),
      });
    } else {
      console.error("error adding audience", response.message);
    }
  } catch (error) {
    console.error("error adding audience", error);
  }
};
