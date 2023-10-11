import { Handlers } from "$fresh/src/server/types.ts";
import {
  getAttachedPipeline,
  getAudienceFromParams,
} from "../../../../../../../../lib/utils.ts";
import {
  deleteAudience,
  detachPipeline,
} from "../../../../../../../../lib/mutation.ts";
import { ResponseCode } from "streamdal-protos/protos/sp_common.ts";
import { serviceSignal } from "../../../../../../../../components/serviceMap/serviceSignal.ts";

export const handler: Handlers<> = {
  async POST(req, ctx) {
    const audience = getAudienceFromParams(ctx.params);
    const pipelines = serviceSignal.value.pipelines;
    const config = serviceSignal.value.config;
    const attachedPipeline = await getAttachedPipeline(
      audience,
      pipelines,
      config,
    );
    let response;
    if (attachedPipeline) {
      response = await detachPipeline(attachedPipeline.id, audience);
    }
    if (!attachedPipeline || response?.code === ResponseCode.OK) {
      response = await deleteAudience(audience, true);
    }

    return new Response(
      JSON.stringify({
        status: 307,
        success: {
          status: response.code === ResponseCode.OK,
          message: response.code === ResponseCode.OK
            ? "Successfully deleted"
            : response.message,
        },
        headers: { Location: "/" },
      }),
      { status: response.code === ResponseCode.OK ? 200 : 400 },
    );
  },
};

export default function DeleteAudienceRoute() {
  return null;
}
