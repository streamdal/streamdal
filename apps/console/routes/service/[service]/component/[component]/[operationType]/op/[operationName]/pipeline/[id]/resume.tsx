import { Handlers } from "$fresh/src/server/types.ts";
import { SuccessType } from "root/routes/_middleware.ts";
import {
  OperationType,
  ResponseCode,
} from "streamdal-protos/protos/sp_common.ts";
import { resumePipeline } from "root/lib/mutation.ts";

export const handler: Handlers<SuccessType> = {
  async POST(req, { params }: any) {
    const response = await resumePipeline(params.id, {
      serviceName: params.service,
      componentName: params.component,
      operationType: OperationType[params.operationType] as any,
      operationName: params.operationName,
    });

    return new Response(
      JSON.stringify({
        success: {
          status: response.code === ResponseCode.OK,
          message: response.code === ResponseCode.OK
            ? "Pipeline successfully resumed"
            : (response as any).error,
        },
      }),
      { status: response.code === ResponseCode.OK ? 200 : 400 },
    );
  },
};

export default function ResumePipeLineRoute() {
  return null;
}
