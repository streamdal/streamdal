import { Handlers } from "$fresh/src/server/types.ts";
import { ResponseCode } from "streamdal-protos/protos/sp_common.ts";
import { deleteService } from "../../../lib/mutation.ts";

export const handler: Handlers = {
  async POST(req, ctx) {
    const serviceName = ctx.params.service;
    const response = await deleteService(serviceName);

    return new Response(
      JSON.stringify({
        status: 307,
        success: {
          status: response.code === ResponseCode.OK,
          message: response.code === ResponseCode.OK
            ? "Successfully deleted"
            : (response as any).error,
        },
        headers: { Location: "/" },
      }),
      { status: response.code === ResponseCode.OK ? 200 : 400 },
    );
  },
};

export default function DeleteServiceRoute() {
  return null;
}
