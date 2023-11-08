import { Handlers } from "$fresh/src/server/types.ts";
import { getAudienceFromParams } from "root/lib/utils.ts";
import { deleteAudience } from "root/lib/mutation.ts";
import { ResponseCode } from "streamdal-protos/protos/sp_common.ts";

export const handler: Handlers<> = {
  async POST(req, ctx) {
    const audience = getAudienceFromParams(ctx.params);
    const response = await deleteAudience(audience, true);

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
