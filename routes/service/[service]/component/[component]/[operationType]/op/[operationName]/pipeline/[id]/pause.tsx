import { Handlers } from "$fresh/src/server/types.ts";
import { SuccessType } from "../../../../../../../../../_middleware.ts";
import { OperationType, ResponseCode } from "snitch-protos/protos/sp_common.ts";
import { HandlerContext } from "$fresh/server.ts";
import { pausePipeline } from "../../../../../../../../../../lib/fetch.ts";

export const handler: Handlers<SuccessType> = {
  async POST(req, { params }: HandlerContext) {
    const response = await pausePipeline(params.id, {
      serviceName: params.service,
      componentName: params.component,
      operationType: OperationType[params.operationType],
      operationName: params.operationName,
    });

    return new Response(
      JSON.stringify({
        success: {
          status: response.code === ResponseCode.OK,
          message: response.code === ResponseCode.OK
            ? "Pipeline successfully paused"
            : response.message,
        },
      }),
      { status: response.code === ResponseCode.OK ? 200 : 400 },
    );
  },
};

export default function PausePipeLineRoute() {
  return null;
}
