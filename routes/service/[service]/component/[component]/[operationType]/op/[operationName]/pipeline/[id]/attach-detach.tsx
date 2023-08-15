import { Handlers } from "$fresh/src/server/types.ts";
import { SuccessType } from "../../../../../../../../../_middleware.ts";
import { ResponseCode } from "snitch-protos/protos/common.ts";
import { getAttachedPipeline } from "../../../../../../../../../../lib/fetch.ts";
import {
  attachPipeline,
  detachPipeline,
} from "../../../../../../../../../../lib/mutation.ts";

export const handler: Handlers<SuccessType> = {
  async POST(req, ctx) {
    const attachFormData = await req.formData();
    const attachedPipeline = await getAttachedPipeline(
      ctx.params.operationName,
    );

    const { session } = ctx.state;

    if (attachedPipeline) {
      const detachResponse = await detachPipeline(attachedPipeline);
      const attachResponse = await attachPipeline(ctx.params.id);

      session.set("success", {
        status: detachResponse.code === ResponseCode.OK &&
          attachResponse.code === ResponseCode.OK,
        message: detachResponse.code === ResponseCode.OK &&
            attachResponse.code === ResponseCode.OK
          ? "Success!"
          : "Pipeline attachment failed. Please try again later",
        ...response.code !== ResponseCode.OK
          ? { errors: { apiError: response.message } }
          : {},
      });

      return new Response(
        "",
        {
          status: 307,
          headers: {
            Location:
              `/service/${ctx.params.service}/component/${ctx.params.component}/${ctx.params.operationType}/op/${ctx.params.operationName}`,
          },
        },
      );
    } else if (!attachedPipeline) {
      const attachResponse = await attachPipeline(ctx.params.id);

      session.set("success", {
        status: attachResponse.code === ResponseCode.OK,
        message: attachResponse.code === ResponseCode.OK
          ? "Success!"
          : "Pipeline attachment failed. Please try again later",
        ...attachResponse.code !== ResponseCode.OK
          ? { errors: { apiError: attachResponse.message } }
          : {},
      });

      return new Response(
        "",
        {
          status: 307,
          headers: {
            Location:
              `/service/${ctx.params.service}/component/${ctx.params.component}/${ctx.params.operationType}/op/${ctx.params.operationName}`,
          },
        },
      );
    }
  },
};

export default function AttachPipeLineRoute(props) {
  console.log("fuck", props);
  return null;
}
