import { Handlers } from "$fresh/src/server/types.ts";
import { serviceSignal } from "../../../components/serviceMap/serviceSignal.ts";
import { ResponseCode } from "streamdal-protos/protos/sp_common.ts";
import { getAttachedPipeline } from "../../../lib/utils.ts";
import {
  deleteAudience,
  deleteService,
  detachPipeline,
} from "../../../lib/mutation.ts";

export const handler: Handlers<> = {
  async POST(req, ctx) {
    const serviceName = ctx.params.service;
    const response = await deleteService(serviceName);
    console.log(response);

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

export default function DeleteServiceRoute() {
  return null;
}
